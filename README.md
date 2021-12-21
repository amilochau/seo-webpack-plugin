# seo-webpack-plugin

## Introduction

`seo-webpack-plugin` exposes a Webpack plugin to generate SEO files:

- the `robots.txt` file lets crawler know which page they should visit, and references sitemap files
- the `sitemap.xml` file (eventually split in multiple files) lets crawler know which pages they should index, with their references with multiple languages

---

## Integration

To integrate the `seo-webpack-plugin`, you must follow these three steps.

1. Install the npm package

Run the following command to install the npm package:

```pwsh
npm install --save-dev seo-webpack-plugin
```

1. Register the plugin

In your webpack configuration, create a new instance of the `SeoWebpackPlugin`:

**webpack.config.js**

```javascript
const SeoWebpackPlugin = require('seo-webpack-plugin').default

module.exports = {
  plugins: [new SeoWebpackPlugin()]
}
```

1. Configure your SEO

Use your `package.json` file to configure your SEO for the plugin, with a dedicated section named `seo`:

**package.json**

```json
{
  "name": "XXX",
  "version": "1.0.0",
  "seo": {
    "host": "https://example.com",
    "policies": [
      {
        "userAgent": "*",
        "allow": "/"
      }
    ],
    "pages": [
      {
        "relativeUrl": "/",
        "changeFrequency": "daily",
        "priority": 0.6
      }
    ],
    "languages": [
      { "lang": "en", "relativePrefixUrl": "/en" },
      { "lang": "fr", "relativePrefixUrl": "/fr" }
    ]
  }
}
```

## Result

The two following files are generated by the plugin in the assets output folder, during the build of your project.

**robots.txt**

```txt
User-agent: *
Allow: /
Sitemap: https://example.com/sitemap.xml
```

This `robots.txt` file allow all crawler to navigate on every page, and links the generated `sitemap.xml` file.

**sitemap.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
    <url>
        <loc>https://example.com/en</loc>
        <lastmod>2022-01-01T00:00:00.000Z</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.6</priority>
        <xhtml:link rel="alternate" hreflang="en" href="https://example.com/en" />
        <xhtml:link rel="alternate" hreflang="fr" href="https://example.com/fr" />
    </url>
    <url>
        <loc>https://example.com/fr</loc>
        <lastmod>2022-01-01T00:00:00.000Z</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.6</priority>
        <xhtml:link rel="alternate" hreflang="en" href="https://example.com/en" />
        <xhtml:link rel="alternate" hreflang="fr" href="https://example.com/fr" />
    </url>
</urlset>
```

This `sitemap.xml` file indicates that two pages (`https://example.com/en` and `https://example.com/fr`) should be indexed by the crawlers, and their two pages are linked as languages-connected pages.

## Options

More options are available for the plugin, and will be documented soon :)

--- 

## Contribute

Feel free to push your code if you agree with publishing under the [MIT license](./LICENSE).
