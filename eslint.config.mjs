import globals from 'globals'
import js from '@eslint/js'
import mocha from 'eslint-plugin-mocha'
import path from 'node:path'
import react from 'eslint-plugin-react'
import {fileURLToPath} from 'node:url'
import {FlatCompat} from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
})

export default [...compat.extends('eslint:recommended'), {
  plugins: {
    mocha,
    react
  },

  languageOptions: {
    globals: {
      ...globals.mocha,
      ...globals.node
    },

    ecmaVersion: 2022,
    sourceType: 'module'
  },
}]