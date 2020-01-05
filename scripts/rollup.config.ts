import * as rollup from 'rollup'
import p from './path'
import config from './config'
import { terser as rollupTerser } from 'rollup-plugin-terser'
const rollupTypescript: typeof import('@rollup/plugin-typescript').default = require('@rollup/plugin-typescript')
const rollupJSON: typeof import('@rollup/plugin-json').default = require('@rollup/plugin-json')
const rollupCommonJS: typeof import('@rollup/plugin-commonjs').default = require('@rollup/plugin-commonjs')
const rollupReplace: typeof import('@rollup/plugin-replace').default = require('@rollup/plugin-replace')
const rollupNodeResolve: typeof import('@rollup/plugin-node-resolve').default = require('@rollup/plugin-node-resolve')

export default function getRollupConfig (minify: boolean): { input: rollup.InputOptions; output: rollup.OutputOptions } {
  const outputFilename = minify ? p(config.output.rollup, `${config.library}.min.js`) : p(config.output.rollup, `${config.library}.js`)
  const format = config.format || 'umd'
  return {
    input: {
      input: p(config.entry),
      plugins: [
        rollupNodeResolve(),
        rollupTypescript({
          tsconfig: p(config.tsconfig)
        }),
        rollupJSON(),
        rollupReplace({
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        }),
        rollupCommonJS({
          extensions: ['.js', '.ts']
        }),
        ...(minify ? [rollupTerser({
          ...(config.terserOptions || {}),
          module: (config.terserOptions && config.terserOptions.module) || (['es', 'esm', 'module']).includes(format)
        })] : [])
      ]
    },
    output: {
      file: outputFilename,
      format: format,
      name: config.library,
      exports: 'named'
    }
  }
}
