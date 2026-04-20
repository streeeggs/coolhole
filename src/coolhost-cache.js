var http = require("http");
var path = require("path");
var fs = require("fs");
var crypto = require("crypto");
var Config = require("./config");
var ytdlp = require("./ytdlp");

const LOGGER = require("@calzoneman/jsli")("coolhost-cache");

// In-memory lock to prevent duplicate downloads of the same video
var activeDownloads = {};

/**
 * Check Coolhost cache for a YouTube video, download if not cached.
 * Returns the Coolhost file URL via callback.
 */
exports.getOrDownload = function getOrDownload(videoId, title, duration, cb) {
    // If this video is already being downloaded, wait for that to finish
    if (activeDownloads[videoId]) {
        LOGGER.info("Download already in progress for %s, waiting", videoId);
        activeDownloads[videoId].push(cb);
        return;
    }

    // Install the lock before the async cache check so concurrent requests
    // don't race past the same cache miss and start duplicate downloads.
    activeDownloads[videoId] = [cb];

    checkCache(videoId, function (err, cacheResult) {
        if (err) {
            LOGGER.warn("Cache check failed for %s: %s", videoId, err);
            // Fall through to download
        }

        if (cacheResult && cacheResult.cached) {
            var playbackUrl = cacheResult.embed_url || cacheResult.url;
            LOGGER.info("Cache hit for %s: %s", videoId, playbackUrl);
            return resolvePending(videoId, null, playbackUrl);
        }

        downloadAndRegister(videoId, function (dlErr, url) {
            resolvePending(videoId, dlErr, url);
        });
    });
};

function resolvePending(videoId, err, url) {
    var waiting = activeDownloads[videoId] || [];
    delete activeDownloads[videoId];

    for (var i = 0; i < waiting.length; i++) {
        waiting[i](err, url);
    }
}

function checkCache(videoId, cb) {
    var coolhostUrl = Config.get("coolhost.url") || "http://localhost:3800";
    var adminPassword = Config.get("coolhost.admin-password") || "";
    var reqUrl = coolhostUrl + "/api/cache/yt/" + videoId;

    var parsed = new URL(reqUrl);
    var options = {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname,
        method: "GET",
        headers: {
            "Authorization": "Bearer " + adminPassword
        }
    };

    var req = http.request(options, function (res) {
        var body = "";
        res.on("data", function (chunk) { body += chunk; });
        res.on("end", function () {
            try {
                var data = JSON.parse(body);
                cb(null, data);
            } catch (e) {
                cb("Invalid response from Coolhost");
            }
        });
    });

    req.on("error", function (err) {
        cb("Coolhost unreachable: " + err.message);
    });

    req.setTimeout(5000, function () {
        req.destroy();
        cb("Coolhost cache check timed out");
    });

    req.end();
}

function downloadAndRegister(videoId, cb) {
    var uploadsDir = Config.get("coolhost.uploads-dir");
    if (!uploadsDir) {
        return cb("coolhost.uploads-dir not configured");
    }

    var fileId = crypto.randomBytes(8).toString("hex");
    var filename = fileId + ".mp4";
    var outputPath = path.join(uploadsDir, filename);

    LOGGER.info("Downloading %s to %s", videoId, outputPath);

    ytdlp.downloadVideo(videoId, outputPath, function (err) {
        if (err) {
            // Clean up partial file
            try { fs.unlinkSync(outputPath); } catch (e) {}
            LOGGER.error("Download failed for %s: %s", videoId, err);
            return cb("Download failed: " + err);
        }

        // Get file size
        var size;
        try {
            size = fs.statSync(outputPath).size;
        } catch (e) {
            return cb("Downloaded file not found");
        }

        LOGGER.info("Download complete for %s (%d bytes), registering with Coolhost", videoId, size);

        registerWithCoolhost(videoId, filename, size, function (regErr, url) {
            if (regErr) {
                // File is on disk but not registered — Coolhost's orphan cleanup
                // will handle it within 5 minutes
                LOGGER.error("Registration failed for %s: %s", videoId, regErr);
                return cb("Failed to register cached video: " + regErr);
            }

            LOGGER.info("Registered %s at %s", videoId, url);
            cb(null, url);
        });
    });
}

function registerWithCoolhost(videoId, filename, sizeBytes, cb) {
    var coolhostUrl = Config.get("coolhost.url") || "http://localhost:3800";
    var adminPassword = Config.get("coolhost.admin-password") || "";

    var postData = JSON.stringify({
        videoId: videoId,
        filename: filename,
        size_bytes: sizeBytes,
        mime_type: "video/mp4"
    });

    var parsed = new URL(coolhostUrl + "/api/cache/register");
    var options = {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname,
        method: "POST",
        headers: {
            "Authorization": "Bearer " + adminPassword,
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(postData)
        }
    };

    var req = http.request(options, function (res) {
        var body = "";
        res.on("data", function (chunk) { body += chunk; });
        res.on("end", function () {
            if (res.statusCode !== 200) {
                return cb("Coolhost returned " + res.statusCode + ": " + body);
            }
            try {
                var data = JSON.parse(body);
                cb(null, data.embed_url || data.url);
            } catch (e) {
                cb("Invalid response from Coolhost");
            }
        });
    });

    req.on("error", function (err) {
        cb("Coolhost unreachable: " + err.message);
    });

    req.setTimeout(10000, function () {
        req.destroy();
        cb("Coolhost registration timed out");
    });

    req.write(postData);
    req.end();
}
