import { arc1Modules } from './arc1'
import { arc2Modules } from './arc2'
import { arc3Modules } from './arc3'
import { arc4Modules } from './arc4'
import { arc5Modules } from './arc5'
import type { Module } from '@/types'

export const curriculum: Module[] = [
  ...arc1Modules,
  ...arc2Modules,
  ...arc3Modules,
  ...arc4Modules,
  ...arc5Modules,
]

export { arc1Modules, arc2Modules, arc3Modules, arc4Modules, arc5Modules }

/** Flat list of all 26 modules — alias for curriculum */
export const allModules = curriculum
