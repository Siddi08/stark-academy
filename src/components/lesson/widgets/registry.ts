import type { ComponentType } from 'react'
import { BinaryCounter } from './BinaryCounter'
import { BitToggler } from './BitToggler'

export interface WidgetPlacement {
  /** Render after this section index (0 = intro, 1 = first ## section, etc.) */
  afterSection: number
  Widget: ComponentType
}

/**
 * Maps lesson IDs to inline interactive widgets.
 * Each entry renders its Widget immediately after the specified section —
 * before any checkpoint for that section.
 */
export const LESSON_WIDGETS: Record<string, WidgetPlacement[]> = {
  '1-1': [
    { afterSection: 2, Widget: BinaryCounter }, // after "Bits, Bytes, and the Number System"
    { afterSection: 3, Widget: BitToggler },    // after "Reading Binary Numbers"
  ],
}
