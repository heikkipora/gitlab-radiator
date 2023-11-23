import {config} from './config.js'
import fs from 'fs'
import less from 'less'
import path from 'path'

const filename = path.join('public', 'client.less')

export async function serveLessAsCss(req, res) {
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

function withColorOverrides(source) {
  let colorLess = ''
  Object.keys(config.colors).forEach((stateName) => {
    colorLess += `@${stateName}-color:${config.colors[stateName]};`
  })
  return source + colorLess
}
