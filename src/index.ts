import { cosmiconfig } from 'cosmiconfig'
import { Compiler, sources, WebpackError } from 'webpack'
import { SeoPluginOptions } from './models/options'
import { generateRobotsFile } from './services/robots'
import { generateSitemapFile } from './services/sitemap'

export default class SeoWebpackPlugin {
  options: SeoPluginOptions

  constructor (options: SeoPluginOptions) {
    this.options = Object.assign({
      robotsFileName: 'robots.txt'
    }, options)
  }

  public apply (compiler: Compiler): void {
    const plugin = { name: this.constructor.name }

    compiler.hooks.compilation.tap(plugin, compilation => {
      compilation.hooks.additionalAssets.tapPromise(plugin, async (): Promise<void> => {
        try {
          const config = await this.buildConfig()
          const disableSeo = config.disableSeoCondition ? config.disableSeoCondition() : false
          
          // Generate sitemap.xml
          let sitemapRelativePath: string | undefined = undefined;
          if (!disableSeo) {
            const sitemap = await generateSitemapFile(config.host, config.pages, config.languages)
            const sitemapSource = new sources.RawSource(sitemap)
            sitemapRelativePath = config.sitemapFileName ?? 'sitemap.xml'

            if (compilation.emitAsset) {
              compilation.emitAsset(sitemapRelativePath, sitemapSource)
            } else {
              // Remove this after drop support for webpack@4
              compilation.assets[sitemapRelativePath] = sitemapSource
            }
          }
          
          // Generate robots.txt
          const robotsFileContent = disableSeo
            ? generateRobotsFile([{ userAgent: '*', disallow: '/' }], config.host, sitemapRelativePath)
            : generateRobotsFile(config.policies, config.host, sitemapRelativePath)

          const robotsSource = new sources.RawSource(robotsFileContent)

          if (compilation.emitAsset) {
            compilation.emitAsset(config.robotsFileName ?? 'robots.txt', robotsSource)
          } else {
            // Remove this after drop support for webpack@4
            compilation.assets[config.robotsFileName ?? 'robots.txt'] = robotsSource
          }
        } catch (error) {
          compilation.errors.push(error as WebpackError)
        }
      })
    })
  }
  
  private buildConfig = async (): Promise<SeoPluginOptions> => {
    const searchPath = process.cwd()
    const configPath = null

    const configExplorer = cosmiconfig('seo')
    const searchForConfig = configPath
      ? configExplorer.load(configPath)
      : configExplorer.search(searchPath)

    const result_1 = await searchForConfig
    const config = !result_1 ? {} : result_1.config
    this.options = Object.assign({}, this.options, config)
    return this.options
  }
}

