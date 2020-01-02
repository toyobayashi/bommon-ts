import { ModuleFormat } from 'rollup'
import { LibraryTarget, Configuration as WebpackConfiguration } from 'webpack'
import { MinifyOptions } from 'terser'

export type Bundler = 'webpack' | 'rollup'

export type KeyType<T, U extends keyof T> = T[U]

export interface Configuration {
  entry: string
  output: {
    webpack: string
    rollup: string
    doc?: string
  }
  bundle: Bundler[]
  library: string
  tsconfig: string
  rollupFormat?: ModuleFormat
  webpackLibraryTarget?: LibraryTarget
  webpackTarget?: KeyType<WebpackConfiguration, 'target'>
  rollupESModule?: boolean
  terserOptions?: MinifyOptions
  globalDeclaration?: boolean
}

const config: Configuration = {
  entry: 'src/index.ts',
  output: {
    webpack: 'dist/webpack',
    rollup: 'dist',
    doc: 'docs/api'
  },
  bundle: ['rollup'],
  library: 'bommon',
  tsconfig: 'tsconfig.production.json',
  rollupFormat: 'umd',
  webpackLibraryTarget: 'umd',
  webpackTarget: 'web',
  rollupESModule: false,
  terserOptions: {
    ie8: true
  },
  globalDeclaration: true
}

export default config
