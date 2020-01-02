import { join, isAbsolute } from 'path'

export default (...args: string[]): string => {
  if (!args.length) return join(__dirname, '..')
  return isAbsolute(args[0]) ? join(...args) : join(__dirname, '..', ...args)
}
