import { cosmiconfig } from 'cosmiconfig'
import { Compiler, sources } from 'webpack'

export default class SeoWebpackPlugin {
  options: any

  apply (compiler: Compiler): void {
    const plugin = { name: this.constructor.name }

    compiler.hooks.compilation.tap(plugin, compilation => {
      compilation.hooks.additionalAssets.tapPromise(plugin, (): Promise<void> => {
        const robotstxtPromise = process.env.NODE_ENVIRONMENT === 'Production'
          ? robotstxt(this.options)
          : robotstxtDefault()

        return robotstxtPromise
          .then(contents => {
            const source = new sources.RawSource(contents)

            if (compilation.emitAsset) {
              compilation.emitAsset(this.options.filePath, source)
            } else {
              // Remove this after drop support for webpack@4
              compilation.assets[this.options.filePath] = source
            }
          })
          .catch(error => {
            compilation.errors.push(error)
          })
      })
    })
  }
}


const addLine = (name: string, rule: string): string => {
  let contents = ''

  if (rule && Array.isArray(rule) && rule.length > 0) {
    rule.forEach((item) => {
      contents += addLine(name, item)
    })
  } else {
    contents += `${name}:${rule.length > 0 ? ` ${rule}` : ''}\n`
  }

  return contents
}

const generatePoliceItem = (item: { userAgent: string, allow?: string, disallow?: string }, index: number) => {
  let contents = ''

  if (index !== 0) {
    contents += '\n'
  }

  contents += addLine('User-agent', item.userAgent)

  if (item.allow) {
    contents += addLine('Allow', item.allow)
  }

  if (item.disallow) {
    contents += addLine('Disallow', item.disallow)
  }

  return contents
}

const buildConfig = (): Promise<any> => {
  const searchPath = process.cwd()
  const configPath = null

  const configExplorer = cosmiconfig('robots-txt')
  const searchForConfig = configPath
    ? configExplorer.load(configPath)
    : configExplorer.search(searchPath)

  return searchForConfig.then((result) => {
    if (!result) {
      return {}
    }

    return result
  })
}

const robotstxt = ({
  policy = [
    {
      allow: '/',
      userAgent: '*',
    },
  ],
  sitemap = null,
} = {}): Promise<string> => {
  let options = {
    policy,
    sitemap,
  }

  return Promise.resolve()
    .then(() =>
      buildConfig().then((result) => {
        // Need avoid this behaviour in next major release
        // Load config file when it is passed or options were set
        options = Object.assign({}, options, result.config)

        return options
      }),
    )
    .then(
      () =>
        new Promise((resolve) => {
          let contents = ''

          options.policy.forEach((item, index) => {
            contents += generatePoliceItem(item, index)
          })

          if (options.sitemap) {
            contents += addLine('Sitemap', options.sitemap)
          }

          return resolve(contents)
        }),
    )
}

const robotstxtDefault = (): Promise<string> => {
  const options = {
    policy: [
      {
        disallow: '/',
        userAgent: '*',
      },
    ],
  }

  return Promise.resolve()
    .then(
      () =>
        new Promise((resolve) => {
          let contents = ''

          options.policy.forEach((item, index) => {
            contents += generatePoliceItem(item, index)
          })

          return resolve(contents)
        }),
    )
}
