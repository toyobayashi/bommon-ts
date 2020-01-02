import { ScriptCache } from './types/internal'
import { ModuleMap, ModuleCache } from './types/export'

export const registeredModules: ModuleMap = {}

export const installedModules: ModuleCache = {}

export const asyncScripts: ScriptCache = {}
