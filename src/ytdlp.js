var spawn = require("child_process").spawn;
var Config = require("./config");

const LOGGER = require("@calzoneman/jsli")("ytdlp");

/**
 * Download a YouTube video to a local file path.
 * Uses yt-dlp with best video+audio, merged to MP4.
 */
exports.downloadVideo = function downloadVideo(videoId, outputPath, cb) {
    var exec = Config.get("yt-dlp.exec") || "yt-dlp";
    var timeout = Config.get("yt-dlp.timeout") || 120000;
    var url = "https://www.youtube.com/watch?v=" + videoId;

    var args = [
        "-f", "bv*+ba/b",
        "--merge-output-format", "mp4",
        "--no-warnings",
        "--no-playlist",
        "-o", outputPath,
        url
    ];

    LOGGER.info("Downloading video %s to %s", videoId, outputPath);

    var child;
    try {
        child = spawn(exec, args);
    } catch (error) {
        LOGGER.error("Unable to spawn yt-dlp: %s", error.stack);
        return cb("Failed to start yt-dlp: " + error.message);
    }

    var stderr = "";
    var childErr = null;

    var timer = setTimeout(function () {
        LOGGER.warn("yt-dlp download timed out for %s after %ds", videoId, timeout / 1000);
        childErr = "Download timed out after " + (timeout / 1000) + " seconds";
        child.kill("SIGKILL");
    }, timeout);

    child.on("error", function (err) {
        childErr = err.message;
    });

    child.stderr.on("data", function (data) {
        stderr += data;
    });

    child.on("close", function (code) {
        clearTimeout(timer);
        LOGGER.info("yt-dlp exited with code %d for %s", code, videoId);

        if (childErr) {
            return cb(childErr);
        }

        if (code !== 0) {
            LOGGER.error("yt-dlp stderr: %s", stderr);
            return cb("yt-dlp failed (exit code " + code + ")");
        }

        cb(null);
    });
};

/**
 * Get video metadata (title, duration) via yt-dlp JSON output.
 * Used as a fallback if YouTube API metadata is insufficient.
 */
exports.getVideoInfo = function getVideoInfo(videoId, cb) {
    var exec = Config.get("yt-dlp.exec") || "yt-dlp";
    var url = "https://www.youtube.com/watch?v=" + videoId;

    var args = ["-j", "--no-warnings", "--no-playlist", url];

    var child;
    try {
        child = spawn(exec, args);
    } catch (error) {
        return cb("Failed to start yt-dlp: " + error.message);
    }

    var stdout = "";
    var childErr = null;

    var timer = setTimeout(function () {
        childErr = "yt-dlp info timed out";
        child.kill("SIGKILL");
    }, 30000);

    child.on("error", function (err) {
        childErr = err.message;
    });

    child.stdout.on("data", function (data) {
        stdout += data;
    });

    child.on("close", function (code) {
        clearTimeout(timer);

        if (childErr) return cb(childErr);
        if (code !== 0) return cb("yt-dlp failed (exit code " + code + ")");

        try {
            var info = JSON.parse(stdout);
            cb(null, {
                title: info.title || "Unknown",
                duration: Math.round(info.duration || 0)
            });
        } catch (e) {
            cb("Failed to parse yt-dlp output");
        }
    });
};
