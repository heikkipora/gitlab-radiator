#!/usr/bin/env node

process.env.NODE_ENV = 'production'

await import('../src/app.js')
