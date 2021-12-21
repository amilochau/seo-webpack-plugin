import { cosmiconfig } from 'cosmiconfig'
import { Compilation, Compiler, sources, WebpackError } from 'webpack'
import { SeoPluginOptions } from './models/options'
import { generateRobotsFile } from './services/robots'
import { generateSitemapFile } from './services/sitemap'
import webpackSources from "webpack-sources";

// Webpack 4/5 compat
// https://github.com/webpack/webpack/issues/11425#issuecomment-686607633
// istanbul ignore next
const { RawSource } = sources || webpackSources;

export default class SeoWebpackPlugin {
  options: SeoPluginOptions
  pluginName = 'seo-webpack-plugin'

  constructor (options: SeoPluginOptions) {
    this.options = options
  }

  public apply (compiler: Compiler): void {
    if (compiler.webpack && compiler.webpack.version[0] == '5') {
      // Webpack 5
      compiler.hooks.compilation.tap(this.pluginName, compilation => {
        compilation.hooks.processAssets.tapPromise({
          name: this.pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL
        },
        async () => this.run(compilation))
      })
    } else if (compiler.hooks) {
      // Webpack 4
      compiler.hooks.emit.tapPromise(this.pluginName, async compilation => this.run(compilation))
    }
  }

  private compilationEmitAsset (compilation: Compilation, file: string, content: string) {
    const source = new RawSource(content)
    if (compilation.emitAsset) {
      // Webpack 5
      compilation.emitAsset(file, source);
    } else {
      // Webpack 4
      compilation.assets[file] = source
    }
  }

  private async run (compilation: Compilation): Promise<void> {
    try {
      const config = await this.buildConfig()
      const disableSeo = config.disableSeoCondition ? config.disableSeoCondition() : false
      
      // Generate sitemap.xml
      let sitemapRelativePath: string | undefined = undefined;
      if (!disableSeo) {
        const sitemap = await generateSitemapFile(config.host, config.pages, config.languages)
        sitemapRelativePath = config.sitemapFileName ?? 'sitemap.xml'

        this.compilationEmitAsset(compilation, sitemapRelativePath, sitemap)
      }
      
      // Generate robots.txt
      const robotsFileContent = disableSeo
        ? generateRobotsFile([{ userAgent: '*', disallow: '/' }], config.host, sitemapRelativePath)
        : generateRobotsFile(config.policies, config.host, sitemapRelativePath)
      const robotsRelativePath = config.robotsFileName ?? 'robots.txt'
      
      this.compilationEmitAsset(compilation, robotsRelativePath, robotsFileContent)
    } catch (error) {
      compilation.errors.push(error as WebpackError)
    } 
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

