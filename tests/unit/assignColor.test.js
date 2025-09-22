import getRandomColor from '../../api/utils/assignColor.js'

import { test, expect } from 'vitest'

test('returns a string in HSL format', () => {
    const color = getRandomColor()
    // basic HSL format: hsl(<int>, <int>%, <int>%)
    expect(typeof color).toBe('string')
    expect(color).toMatch(/^hsl\(\d{1,3}, \d{1,3}%.*, \d{1,3}%\)$/)
})

test('returns values within reasonable ranges', () => {
    const color = getRandomColor()
    const match = color.match(/hsl\((\d{1,3}), (\d{1,3})%.*, (\d{1,3})%\)/)
    expect(match).not.toBeNull()

    const [, hStr, sStr, lStr] = match
    const h = Number(hStr)
    const s = Number(sStr)
    const l = Number(lStr)

    // hue should be 0-359 (function can wrap), saturation 0-100, lightness 0-100
    expect(h).toBeGreaterThanOrEqual(0)
    expect(h).toBeLessThanOrEqual(359)
    expect(s).toBeGreaterThanOrEqual(0)
    expect(s).toBeLessThanOrEqual(100)
    expect(l).toBeGreaterThanOrEqual(0)
    expect(l).toBeLessThanOrEqual(100)
})

