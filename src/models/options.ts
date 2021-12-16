export type PolicyItem = {
  userAgent: string
  allow?: string
  disallow?: string
}

export type PageItem = {
  relativeUrl: string
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
}

export type LanguageItem = {
  lang: string
  relativePrefixUrl: string
}

export type SeoPluginOptions = {
  host: string
  policies: PolicyItem[]
  pages: PageItem[]
  languages: LanguageItem[]

  robotsFileName?: string

  sitemapFileName?: string

  disableSeoCondition?: () => boolean
}
