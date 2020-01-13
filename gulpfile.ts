import { readFileSync, writeFileSync, existsSync } from 'fs'
import * as gulp from 'gulp'
import * as _webpack from 'webpack'
import { spawn } from 'child_process'
import { rollup as _rollup, watch as _watch, WatcherOptions } from 'rollup'
import config from './scripts/config'
import getWebpackConfig from './scripts/webpack.config'
import getRollupConfig from './scripts/rollup.config'
import p from './scripts/path'
const eslint = require('gulp-eslint')

const webpackConfig = [getWebpackConfig(false), getWebpackConfig(true)]
const rollupConfig = [getRollupConfig(false), getRollupConfig(true)]

const webpackToStringOptions: _webpack.Stats.ToStringOptions = {
  colors: true,
  modules: false,
  entrypoints: false
}

function _spawn (command: string, args: string[]): Promise<void> {
  return new Promise<void>((resolve) => {
    const cp = spawn(command, args, {
      env: process.env,
      cwd: p(),
      stdio: 'inherit'
    })
    cp.once('exit', () => {
      resolve()
    })
  })
}

function runNpmBin (bin: string, args: string[]): Promise<void> {
  const localBin = p(`node_modules/.bin/${bin}${process.platform === 'win32' ? '.cmd' : ''}`)
  if (existsSync(localBin)) {
    return _spawn(localBin, args)
  }
  return _spawn(`${bin}${process.platform === 'win32' ? '.cmd' : ''}`, args)
}

export const lint: gulp.TaskFunction = function lint (): NodeJS.ReadWriteStream {
  return gulp.src('src/**/*.ts')
    .pipe(eslint())
    .pipe(eslint.format())
}

export const webpack: gulp.TaskFunction = function webpack (cb): void {
  _webpack(webpackConfig, (err, stats) => {
    if (err) {
      cb(err)
      return
    }
    console.log(stats.toString(webpackToStringOptions))
    cb()
  })
}

export const rollup: gulp.TaskFunction = function rollup (): Promise<void> {
  return Promise.all(rollupConfig.map(conf => _rollup(conf.input).then(bundle => bundle.write(conf.output)))).then(() => {
    if (config.replaceESModule) {
      rollupConfig.forEach(conf => {
        let code = readFileSync(p(conf.output.file as string), 'utf8')
        code = code.replace(/(.\s*)?Object\.defineProperty\s*\(\s*(.*?)\s*,\s*(['"])__esModule['"]\s*,\s*\{\s*value\s*:\s*(.*?)\s*\}\s*\)\s*;?/g, (_match, token, exp, quote, value) => {
          const iifeTemplate = (content: string, replaceVar?: string): string => {
            if (replaceVar) {
              return `(function(${replaceVar}){${content.replace(new RegExp(exp, 'g'), replaceVar)}})(${exp})`
            }
            return `(function(){${content}})()`
          }
          const content = (iife: boolean): string => `try{${iife ? 'return ' : ''}Object.defineProperty(${exp},${quote}__esModule${quote},{value:${value}})}catch(_){${iife ? 'return ' : ''}${exp}.__esModule=${value}${iife ? `,${exp}` : ''}}`
          const _token = token && token.trim()
          if (!_token) return content(false)
          if (_token === '{' || _token === ';') {
            return `${token}${content(false)}`
          } else if (_token === ')' || /^[a-zA-Z$_][a-zA-Z\d_]*$/.test(_token)) {
            return `${token};${content(false)}`
          } else {
            return `${token}${iifeTemplate(content(true), exp === 'this' ? 'e' : '')}`
          }
        })
        writeFileSync(p(conf.output.file as string), code, 'utf8')
      })
    }
  })
}

export const bundle: gulp.TaskFunction = gulp.parallel(...(config.bundle.map(task => exports[task])))

export const tsc: gulp.TaskFunction = function tsc (): Promise<void> {
  return runNpmBin('tsc', ['-p', 'tsconfig.json'])
}

export const watch: gulp.TaskFunction = function watch (cb): void {
  gulp.watch('src/**/*.ts', { ignoreInitial: false }, lint)
  runNpmBin('tsc', ['-w', '-p', 'tsconfig.json']).catch(err => console.log(err))
  if (config.bundle.includes('webpack')) {
    _webpack(webpackConfig).watch({ aggregateTimeout: 200 }, (_err, stats) => console.log(stats.toString(webpackToStringOptions)))
  }
  if (config.bundle.includes('rollup')) {
    _watch(rollupConfig.map(conf => ({
      ...conf.input,
      output: conf.output,
      watch: {
        clearScreen: false,
        include: ['src/**/*.ts']
      } as WatcherOptions
    })))
  }
  setTimeout(cb, 200)
}

export const dts: gulp.TaskFunction = function dts (): Promise<void> {
  return runNpmBin('api-extractor', ['run', '--local', '--verbose']).then(() => {
    const dtsPath = p(`typings/${config.library}.d.ts`)
    const dts = readFileSync(dtsPath, 'utf8')
    const format = config.format || 'umd'
    if (format === 'umd') {
      const umddts = `${dts}\nexport as namespace ${config.library}\n`
      writeFileSync(dtsPath, umddts, 'utf8')
    } else if (format === 'cjs') {
      let cjsDts = dts.replace(/declare\s/g, '')
      cjsDts = cjsDts.replace(/export default (\S+);/g, 'export { $1 as default }')
      cjsDts = `declare namespace ${config.library} {\n${cjsDts}`
      cjsDts += `\n}\nexport = ${config.library}\n`
      writeFileSync(dtsPath, cjsDts, 'utf8')
    } else if (format === 'iife') {
      let globalDts = dts.replace(/declare\s/g, '')
      globalDts = globalDts.replace(/export default (\S+);/g, 'export { $1 as default }')
      globalDts = `declare namespace ${config.library} {\n${globalDts}`
      globalDts += '\n}\n'
      writeFileSync(dtsPath, globalDts, 'utf8')
    }
  })
}

export const doc: gulp.TaskFunction = function doc (): Promise<void> {
  const outputDir = p(config.output.doc || 'docs/api')
  return runNpmBin('api-documenter', ['markdown', '-i', './temp', '-o', outputDir]).then(() => {
    writeFileSync(p(outputDir, 'README.md'), readFileSync(p(outputDir, 'index.md'), 'utf8'), 'utf8')
  })
}

export const docs: gulp.TaskFunction = gulp.series(lint, tsc, dts, doc)

export const build: gulp.TaskFunction = gulp.series(lint, tsc, dts, doc, bundle)
