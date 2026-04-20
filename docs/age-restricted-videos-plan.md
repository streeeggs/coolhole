# Age-Restricted YouTube Video Support via Coolhost Cache

## Problem
CyTube blocks age-restricted YouTube videos at queue time (playlist.js:990). Even if we removed the block, YouTube's iframe embed refuses to play them without viewer Google auth. Users currently can't watch age-restricted content at all.

## Solution
When a YouTube video is detected as age-restricted, download the full video via yt-dlp to Coolhost (the existing temporary file hosting service on the same server). Play through VideoJS as a self-hosted file. Coolhost's 8-hour auto-expiry handles cleanup. No expiring URLs, no refresh logic, no mid-playback failures.

## Why Cache Instead of Direct URL Extraction

Direct URL extraction (yt-dlp `-j` mode) returns temporary YouTube CDN links that expire in ~6 hours. This creates problems:
- Videos sitting in queue go stale and need re-extraction at play time
- Mid-playback failures if a URL expires during a long video
- Requires complex refresh logic in mediarefresher
- Single point of failure — when YouTube breaks yt-dlp extractors, everything goes down

Caching on Coolhost eliminates all of these. Once downloaded, the file is static and plays reliably until the TTL cleans it up. Same video queued twice hits cache instantly. If yt-dlp breaks, already-cached videos keep working.

## Architecture

Coolhole and Coolhost are both on the same Hetzner box (5.78.187.172). yt-dlp writes directly to Coolhost's uploads/ directory and registers the file via Coolhost's internal API. No network file transfer needed.

```
User queues age-restricted YouTube video
    |
YouTube API returns ytRating: "ytAgeRestricted"
    |
Coolhole checks Coolhost cache: is this video ID already stored?
    |
  CACHED --> return Coolhost file URL immediately
  NOT CACHED --> yt-dlp downloads video to Coolhost uploads/
              --> register in Coolhost DB with 8hr TTL
              --> return Coolhost file URL
    |
Media created as type "fi" pointing at Coolhost URL
    |
Client receives type "fi" --> VideoJS plays it as a normal file
    |
8 hours later, Coolhost auto-cleans the file
```

## Data Flow Detail

### Queue Time
1. User sends queue event with YouTube video ID
2. `get-info.js` calls YouTube API, gets metadata including `ytRating: "ytAgeRestricted"`
3. If age-restricted and yt-dlp enabled:
   a. Check Coolhost cache via `GET /api/cache/yt/<videoId>`
   b. If cached: get Coolhost file URL, skip download
   c. If not cached: spawn `yt-dlp -f "bv*+ba/b" --merge-output-format mp4 -o <path> <url>`
   d. Register file in Coolhost DB via `POST /api/cache/register`
   e. Build Media object with type `"fi"`, URL pointing to Coolhost
4. Emit queue success — video appears in playlist like any other

### Play Time
Nothing special. VideoJS loads the file from Coolhost. No refresh needed.

### Cleanup
Coolhost's existing cleanup cron (every 60 seconds) handles expiry. No changes needed.

## Coolhost Changes

### New Endpoints (internal, no ban check needed)

#### `GET /api/cache/yt/:videoId`
Check if a YouTube video is already cached and still active.

```javascript
// Returns:
// { cached: true, url: "http://5.78.187.172:3800/f/<stored_name>", expires_at: "..." }
// { cached: false }
```

Looks up by `original_name` matching pattern `yt_<videoId>.mp4`.

#### `POST /api/cache/register`
Register a file that was written directly to the uploads/ directory (server-to-server, no multipart upload needed since same box).

```javascript
// Body: { videoId, filename, size_bytes, mime_type }
// Returns: { id, url, expires_at }
```

Creates a DB record for a file already on disk. Used when yt-dlp writes directly to Coolhost's uploads/ dir.

### Database Change
No schema change needed. The existing `uploads` table works. We use `original_name` = `yt_<videoId>.mp4` as the cache key for lookups.

## Coolhole Changes

### 1. `src/ytdlp.js` (NEW)
yt-dlp process wrapper for downloading videos.

```javascript
// Exports:
// - downloadVideo(videoId, outputPath, cb)
//   Spawns: yt-dlp -f "bv*+ba/b" --merge-output-format mp4 --no-warnings -o <outputPath> <url>
//   Timeout: 120s (configurable, downloads take longer than extraction)
//   Returns: { filename, size_bytes }
//   Error handling: missing binary, timeout, download failure, disk full
//
// - getVideoInfo(videoId, cb)
//   Spawns: yt-dlp -j --no-warnings <url>
//   Returns: { title, duration, formats }
//   Used to get metadata before/without downloading
```

**yt-dlp format selection:** `-f "bv*+ba/b"` selects best video+audio combined, or best single format if no merge needed. `--merge-output-format mp4` ensures MP4 output for browser compatibility.

### 2. `src/get-info.js` — Modify `Getters.yt` (line 67-88)
After YouTube API returns age-restricted, check cache then download:

```javascript
if (meta.ytRating === "ytAgeRestricted" && Config.get("yt-dlp.enabled")) {
    return coolhostCache.getOrDownload(video.id, video.title, video.duration, function (err, fileUrl) {
        if (err) {
            return callback("Age-restricted video: " + err);
        }
        // Create as type "fi" (FilePlayer/VideoJS) instead of "yt"
        var media = new Media(video.id, video.title, video.duration, "fi", {
            ytAgeRestricted: true,
            coolhostUrl: fileUrl
        });
        media.id = fileUrl; // FilePlayer uses media.id as the source URL
        callback(false, media);
    });
}
```

### 3. `src/coolhost-cache.js` (NEW)
Manages the Coolhost cache check and download flow.

```javascript
// Exports:
// - getOrDownload(videoId, title, duration, cb)
//   1. GET http://localhost:3800/api/cache/yt/<videoId>
//   2. If cached: return url immediately
//   3. If not: yt-dlp downloads to COOLHOST_UPLOADS/<id>.mp4
//   4. POST http://localhost:3800/api/cache/register
//   5. Return url
//
// Config used:
//   coolhost.url (default: http://localhost:3800)
//   coolhost.uploads-dir (default: /path/to/Coolhosting/uploads)
//   yt-dlp.exec (default: yt-dlp)
//   yt-dlp.timeout (default: 120000)
```

### 4. `src/channel/playlist.js` — Modify `_addItem` (line 990-992)
Allow age-restricted videos through when they have a Coolhost URL:

```javascript
// BEFORE:
if (media.meta.ytRating === "ytAgeRestricted") {
    return qfail("Cannot add age restricted videos...");
}

// AFTER:
if (media.meta.ytRating === "ytAgeRestricted" && !media.meta.ytAgeRestricted) {
    return qfail("Cannot add age restricted videos (yt-dlp not available)...");
}
```

The `meta.ytAgeRestricted` flag (set in get-info.js) indicates the video was successfully processed through the Coolhost cache path. If it's missing, yt-dlp is disabled or failed.

### 5. `player/update.coffee` — No changes needed
Age-restricted videos come through as type `"fi"` which already maps to `FilePlayer` (extends VideoJSPlayer). The existing player routing handles it.

### 6. `src/config.js` — Add config defaults

```javascript
"yt-dlp": {
    enabled: false,
    exec: "yt-dlp",
    timeout: 120000
},
"coolhost": {
    url: "http://localhost:3800",
    "uploads-dir": "/opt/Coolhosting/uploads",
    "admin-password": ""
}
```

### 7. `config.template.yaml` — Add config section

```yaml
# yt-dlp for age-restricted YouTube videos
# Requires yt-dlp installed on the server
yt-dlp:
  enabled: false
  exec: 'yt-dlp'
  timeout: 120000  # ms, downloads can take a while

# Coolhost cache for age-restricted video files
# Must be on the same server as Coolhole
coolhost:
  url: 'http://localhost:3800'
  uploads-dir: '/opt/Coolhosting/uploads'
  admin-password: ''
```

## Queue Time UX

Downloading a video takes 10-60 seconds depending on length and resolution. The user who queued it needs feedback:

1. On age-restricted detection, emit a `queueMsg` to the user: "Downloading age-restricted video, this may take a moment..."
2. On success, emit normal `queue` event
3. On failure, emit `queueFail` with error

The rest of the room doesn't see the delay — the video just appears in the playlist when ready.

## File Summary

| File | Action | Purpose |
|------|--------|---------|
| `Coolhosting/server.js` | Modify | Add `/api/cache/yt/:videoId` and `/api/cache/register` endpoints |
| `coolhole/src/ytdlp.js` | New | yt-dlp download wrapper |
| `coolhole/src/coolhost-cache.js` | New | Cache check + download orchestration |
| `coolhole/src/get-info.js` | Modify | Route age-restricted videos through Coolhost cache |
| `coolhole/src/channel/playlist.js` | Modify | Allow age-restricted videos with Coolhost URLs |
| `coolhole/src/config.js` | Modify | Add yt-dlp + coolhost config defaults |
| `coolhole/config.template.yaml` | Modify | Add yt-dlp + coolhost config section |

## Server Requirements
- yt-dlp binary installed and in PATH (or configured path)
- yt-dlp needs periodic updates (`yt-dlp -U`) as YouTube changes extraction
- Coolhost running on same box
- Sufficient disk space (Coolhost already enforces 5GB minimum free)

## Edge Cases
- **Video too large:** Coolhost has 2GB max file size. Most YouTube videos under 2 hours at 1080p fit. If exceeded, fall back to error message suggesting lower quality or skip.
- **Disk full:** Coolhost already checks free disk space before accepting files (5GB minimum). If full, queue fails with clear error.
- **yt-dlp broken:** Cached videos keep working. New age-restricted videos fail with "yt-dlp extraction failed" error until yt-dlp is updated.
- **Same video queued by multiple users simultaneously:** First download wins. Subsequent requests should check cache before starting a new download. Use a simple in-memory lock per video ID to prevent duplicate downloads.
- **Video queued, cached, expires, requeued:** Re-downloads. Config stays the same, no stale state.
- **yt-dlp timeout:** 120s default. Long videos (2hr+) may need more. Configurable.
- **Coolhost restart:** Files on disk survive. DB is SQLite with WAL. No data loss.

## Implementation Order
1. Add cache endpoints to Coolhost (`/api/cache/yt/:videoId`, `/api/cache/register`)
2. Create `src/ytdlp.js` (download wrapper)
3. Create `src/coolhost-cache.js` (cache orchestration)
4. Modify `src/get-info.js` (route age-restricted through cache)
5. Modify `src/channel/playlist.js` (allow age-restricted with Coolhost URL)
6. Add config defaults and template entries
7. Test with known age-restricted YouTube video IDs
