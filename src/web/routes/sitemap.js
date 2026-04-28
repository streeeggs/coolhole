import Config from "../../config";

/**
 * Adds /sitemap.xml and /robots.txt routes.
 *
 * Why: pre-fix, neither route existed. Search engines couldn't discover
 * channels and couldn't tell what's crawlable vs. private. Channel index
 * is exposed via `channelIndex.listPublicChannels()`, same source the
 * homepage uses, so the sitemap stays accurate as channels come and go.
 */
export default function initialize(app, channelIndex) {
    const chanPath = Config.get("channel-path");

    app.get("/robots.txt", (req, res) => {
        const baseUrl = req.realProtocol + "://" + req.header("host");
        res.type("text/plain").send(
            [
                "User-agent: *",
                "Allow: /",
                "Disallow: /account/",
                "Disallow: /acp",
                "Disallow: /api/",
                "Disallow: /login",
                "Disallow: /logout",
                "Disallow: /register",
                "",
                `Sitemap: ${baseUrl}/sitemap.xml`,
                ""
            ].join("\n")
        );
    });

    app.get("/sitemap.xml", async (req, res) => {
        const baseUrl = req.realProtocol + "://" + req.header("host");

        let channels = [];
        try {
            channels = await channelIndex.listPublicChannels();
        } catch (e) {
            channels = [];
        }

        const now = new Date().toISOString();
        const urls = [
            { loc: `${baseUrl}/`, priority: "1.0", changefreq: "hourly" },
            { loc: `${baseUrl}/contact`, priority: "0.3", changefreq: "yearly" }
        ];

        for (const c of channels) {
            urls.push({
                loc: `${baseUrl}/${chanPath}/${encodeURIComponent(c.name)}`,
                priority: "0.8",
                changefreq: "always"
            });
        }

        const body =
            '<?xml version="1.0" encoding="UTF-8"?>\n' +
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
            urls
                .map(
                    (u) =>
                        `  <url><loc>${u.loc}</loc><lastmod>${now}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
                )
                .join("\n") +
            "\n</urlset>\n";

        res.type("application/xml").send(body);
    });
}
