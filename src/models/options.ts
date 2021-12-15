export class PolicyItem {
  userAgent: string
  allow?: string
  disallow?: string
}

export class PageItem {
  relativeUrl: string
  changeFrequency: string
  priority: number
}

export class LanguageItem {
  lang: string
  relativePrefixUrl: string
}

export class SeoPluginOptions {
  host: string
  policies: PolicyItem[]
  pages: PageItem[]
  languages: LanguageItem[]

  robotsFileName = 'robots.txt'
}
