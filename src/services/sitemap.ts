import { SitemapStream } from "sitemap"
import { LanguageItem, PageItem } from "../models/options"

function writePageAttributes (sitemap: SitemapStream, page: PageItem, lastModification: string, languages: LanguageItem[]) {
  if (languages?.length) {
    // Manage languages
    languages.forEach(l1 => {
      const pathAttributes = {
        url: `${l1.relativePrefixUrl}${page.relativeUrl}`.replace(/\/$/, ''),
        lastmod: lastModification,
        changefreq: page.changeFrequency,
        priority: page.priority,
        links: [],
      }

      languages.forEach(l2 => {
        pathAttributes.links.push({
          lang: l2.lang,
          url: `${l2.relativePrefixUrl}${page.relativeUrl}`.replace(/\/$/, ''),
        })
      })

      sitemap.write(pathAttributes)
    })
  } else {
    // No language defined
    sitemap.write({
      url: page.relativeUrl,
      lastmod: lastModification,
      changefreq: page.changeFrequency,
      priority: page.priority,
    })
  }
}

export const generateSitemapFile = (hostname: string, pages: PageItem[], languages: LanguageItem[]): Promise<string> => {
  const sitemap = new SitemapStream({ hostname })
  const lastModification = new Date().toISOString().split('T')[0]

  pages.forEach(page => {
    writePageAttributes(sitemap, page, lastModification, languages)
  })

  sitemap.end()

  let str = ''
  return new Promise(resolve => {
    sitemap.on('data', (data) => {
      str += data.toString()
    })

    sitemap.on('end', () => {
      resolve(str)
    })
  })
}
