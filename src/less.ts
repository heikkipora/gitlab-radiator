import {config} from './config.ts'
import fs from 'fs'
import less from 'less'
import path from 'path'

const filename = path.join('public', 'client.less')

export async function serveLessAsCss(req: any, res: any) {
  try {
    const source = await fs.promises.readFile(filename, 'utf-8')
    const {css} = await less.render(withColorOverrides(source), {filename})
    res.setHeader('content-type', 'text/css')
    res.send(css)
  } catch (err) {
    console.error('Failed to render client.less', err)
    res.sendStatus(500)
  }
}

function withColorOverrides(source: string) {
  let colorLess = ''
  Object.keys(config.colors).forEach((stateName) => {
    colorLess += `@${stateName}-color:${config.colors[stateName]};`
  })
  return source + colorLess
}
