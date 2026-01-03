import fs from 'fs'
import less from 'less'
import path from 'path'
import {config} from './config.ts'
import type {Config} from './config.ts'

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
  const {colors} = config
  if (!colors) {
    return source
  }

  let colorLess = ''
  Object.keys(colors).forEach((stateName) => {
    colorLess += `@${stateName}-color:${colors[stateName as keyof Config["colors"]]};`
  })
  return source + colorLess
}
