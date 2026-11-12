import { describe, expect, it, vi } from 'vitest'

vi.mock('@/config', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/config')>()),
  WEEK_STARTS_ON: 0,
}))

const { startOfWeek, toISODate } = await import('./dates')

describe('startOfWeek with WEEK_STARTS_ON = 0', () => {
  it('starts the week on Sunday', () => {
    expect(toISODate(startOfWeek(new Date(2026, 10, 15)))).toBe('2026-11-15')
    expect(toISODate(startOfWeek(new Date(2026, 10, 14)))).toBe('2026-11-08')
    expect(toISODate(startOfWeek(new Date(2026, 10, 9)))).toBe('2026-11-08')
  })
})
