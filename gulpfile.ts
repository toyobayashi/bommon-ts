import { readFileSync, writeFileSync } from 'fs'
import * as gulp from 'gulp'
import * as _webpack from 'webpack'
import { spawn } from 'child_process'
import { rollup as _rollup, RollupOutput, watch as _watch, WatcherOptions } from 'rollup'
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

function _c (command: string): string {
  return process.platform === 'win32' ? `${command}.cmd` : command
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

export const rollup: gulp.TaskFunction = function rollup (): Promise<RollupOutput[]> {
  return Promise.all(rollupConfig.map(conf => _rollup(conf.input).then(bundle => bundle.write(conf.output))))
}

export const bundle: gulp.TaskFunction = gulp.parallel(...(config.bundle.map(task => exports[task])))

export const tsc: gulp.TaskFunction = function tsc (): Promise<void> {
  return _spawn(_c('tsc'), ['-p', 'tsconfig.json'])
}

export const watch: gulp.TaskFunction = function watch (cb): void {
  gulp.watch('src/**/*.ts', { ignoreInitial: false }, lint)
  _spawn(_c('tsc'), ['-w', '-p', 'tsconfig.json']).catch(err => console.log(err))
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
  return _spawn(_c('api-extractor'), ['run', '--local', '--verbose']).then(() => {
    if (config.globalDeclaration) {
      let dts = readFileSync(p(`typings/${config.library}.d.ts`), 'utf8')
      dts = dts.replace(/declare\s/g, '')
      dts = `declare namespace ${config.library} {\n${dts}`
      dts += '\n}\n'
      writeFileSync(p(`typings/${config.library}.global.d.ts`), dts, 'utf8')
    }
  })
}

export const doc: gulp.TaskFunction = function doc (): Promise<void> {
  const outputDir = p(config.output.doc || 'docs/api')
  return _spawn(_c('api-documenter'), ['markdown', '-i', './temp', '-o', outputDir]).then(() => {
    writeFileSync(p(outputDir, 'README.md'), readFileSync(p(outputDir, 'index.md'), 'utf8'), 'utf8')
  })
}

export const docs: gulp.TaskFunction = gulp.series(lint, tsc, dts, doc)

export const build: gulp.TaskFunction = gulp.series(lint, tsc, dts, doc, bundle)
