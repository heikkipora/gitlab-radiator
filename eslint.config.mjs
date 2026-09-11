import { fixupPluginRules } from '@eslint/compat'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

// eslint-plugin-react 7.x still uses the ESLint 8 rule API (e.g. context.getFilename),
// which was removed in ESLint 10. Wrap its rules with @eslint/compat until the plugin
// ships native ESLint 10 support.
const fixedReact = fixupPluginRules(react)

export default [
  ...tseslint.configs.recommended,
  {
    ...react.configs.flat.recommended,
    plugins: { react: fixedReact }
  },
  reactHooks.configs.flat.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser
      }
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
]
