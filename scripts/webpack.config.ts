import { Configuration } from 'webpack'
import p from './path'
import config from './config'

const TerserWebpackPlugin = require('terser-webpack-plugin')

function getWebpackConfig (minimize: boolean): Configuration {
  const webpackConfig: Configuration = {
    target: config.webpackTarget || 'web',
    mode: 'production',
    entry: {
      [config.library + (minimize ? '.min' : '')]: [p(config.entry)]
    },
    output: {
      path: p(config.output.webpack),
      filename: '[name].js',
      library: config.library,
      libraryTarget: config.webpackLibraryTarget || 'umd'
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json']
    },
    module: {
      rules: [
        {
          test: /\.ts(x)?$/,
          use: [
            {
              loader: require.resolve('ts-loader'),
              options: {
                configFile: p(config.tsconfig)
              }
            }
          ]
        }
      ]
    },
    optimization: {
      minimize,
      ...(minimize ? {
        minimizer: [
          new TerserWebpackPlugin({ ...(config.terserOptions ? ({ terserOptions: config.terserOptions }) : {}) })
        ]
      } : {})
    }
  }

  return webpackConfig
}

export default getWebpackConfig
