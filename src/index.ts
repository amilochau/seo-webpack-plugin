import { cosmiconfig } from 'cosmiconfig'
import { Compiler, sources } from 'webpack'
import { SeoPluginOptions } from './models/options'
import { generateRobotsFile } from './services/robots'

export default class SeoWebpackPlugin {
  apply (compiler: Compiler): void {
    const plugin = { name: this.constructor.name }

    compiler.hooks.compilation.tap(plugin, compilation => {
      compilation.hooks.additionalAssets.tapPromise(plugin, (): Promise<void> => {
        return buildConfig().then(config => {
          const robotsFileContent = process.env.NODE_ENVIRONMENT === 'Production'
            ? generateRobotsFile(config.policies, 'sitemap.xml')
            : generateRobotsFile([{ userAgent: '*', disallow: '/' }], 'sitemap.xml')

          const source = new sources.RawSource(robotsFileContent)

          if (compilation.emitAsset) {
            compilation.emitAsset(config.robotsFileName, source)
          } else {
            // Remove this after drop support for webpack@4
            compilation.assets[config.robotsFileName] = source
          }
        })
        .catch(error => {
          compilation.errors.push(error)
        })
      })
    })
  }
}

const buildConfig = (): Promise<SeoPluginOptions> => {
  const searchPath = process.cwd()
  const configPath = null

  const configExplorer = cosmiconfig('seo')
  const searchForConfig = configPath
    ? configExplorer.load(configPath)
    : configExplorer.search(searchPath)

  return searchForConfig.then(result => {
    if (!result) {
      return new SeoPluginOptions()
    }

    return result.config
  })
}
