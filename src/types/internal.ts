export interface ScriptCache {
  [src: string]: 0 | Promise<void> | undefined
}
