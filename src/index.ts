import { cosmiconfig } from 'cosmiconfig'
import { Compiler, sources } from 'webpack'
import { SeoPluginOptions } from './models/options'
import { generateRobotsFile } from './services/robots'

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
      compilation.hooks.additionalAssets.tapPromise(plugin, (): Promise<void> => {
        return this.buildConfig().then(config => {
          const disableSeo = config.disableSeoCondition ? config.disableSeoCondition() : false
          const robotsFileContent = disableSeo
            ? generateRobotsFile([{ userAgent: '*', disallow: '/' }], 'sitemap.xml')
            : generateRobotsFile(config.policies, 'sitemap.xml')

          const source = new sources.RawSource(robotsFileContent)

          if (compilation.emitAsset) {
            compilation.emitAsset(config.robotsFileName ?? 'robots.txt', source)
          } else {
            // Remove this after drop support for webpack@4
            compilation.assets[config.robotsFileName ?? 'robots.txt'] = source
          }
        })
        .catch(error => {
          compilation.errors.push(error)
        })
      })
    })
  }
  
  private buildConfig = (): Promise<SeoPluginOptions> => {
    const searchPath = process.cwd()
    const configPath = null

    const configExplorer = cosmiconfig('seo')
    const searchForConfig = configPath
      ? configExplorer.load(configPath)
      : configExplorer.search(searchPath)

    return searchForConfig.then(result => {
      const config = !result ? {} : result.config
      this.options = Object.assign({}, this.options, config)
      return this.options
    })
  }
}

