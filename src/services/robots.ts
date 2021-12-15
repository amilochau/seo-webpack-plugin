import { PolicyItem } from '../models/options'

const addLine = (name: string, rule: string): string => {
  let content = ''

  if (rule && Array.isArray(rule) && rule.length > 0) {
    rule.forEach((item) => {
      content += addLine(name, item)
    })
  } else {
    content += `${name}:${rule.length > 0 ? ` ${rule}` : ''}\n`
  }

  return content
}

const generatePolicyItem = (item: PolicyItem, index: number) => {
  let content = ''

  if (index !== 0) {
    content += '\n'
  }

  content += addLine('User-agent', item.userAgent)

  if (item.allow) {
    content += addLine('Allow', item.allow)
  }

  if (item.disallow) {
    content += addLine('Disallow', item.disallow)
  }

  return content
}

export const generateRobotsFile = (policies: PolicyItem[], sitemap: string): string => {
  let content = ''

  policies.forEach((policy, index) => {
    content += generatePolicyItem(policy, index)
  })

  if (sitemap) {
    content += addLine('Sitemap', sitemap)
  }

  return content
}
