import SeoWebpackPlugin from "../../../src";

export default {
  entry: (): [] => [],
  output: {
    filename: "index.js",
    path: `${__dirname}/actual-output`,
    libraryTarget: "umd"
  },

  plugins: [
    new SeoWebpackPlugin({
      host: "https://example.com",
      policies: [
        {
          userAgent: "*",
          allow: "/"
        }
      ],
      pages: [
        {
          relativeUrl: "/",
          changeFrequency: "daily",
          priority: 0.6
        }
      ],
      languages: [
        { lang: "en", relativePrefixUrl: "/en" },
        { lang: "fr", relativePrefixUrl: "/fr" }
      ]
    })
  ]
};