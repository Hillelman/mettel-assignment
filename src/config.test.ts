import * as config from '@/config'

describe('config', () => {
  it('exports the agreed constants', () => {
    expect({ ...config }).toEqual({
      STORAGE_KEY: 'mettel.calendar.appointments.v1',
      WEEK_STARTS_ON: 1,
      STEP_MINUTES: 15,
      MIN_DURATION_MINUTES: 15,
      SLOT_SEARCH_DAYS: 7,
      DEFAULT_DURATION_MINUTES: 60,
      HOUR_HEIGHT_PX: 48,
      DEFAULT_SCROLL_HOUR: 8,
      TOUCH_DRAG_DELAY_MS: 250,
      TITLE_MAX_LENGTH: 80,
      NOTES_MAX_LENGTH: 500,
      COMPACT_CARD_MAX_MINUTES: 15,
      APPOINTMENT_COLORS: config.APPOINTMENT_COLORS,
    })
  })

  it('has exactly 10 unique colors, each with a label', () => {
    const { APPOINTMENT_COLORS } = config
    expect(APPOINTMENT_COLORS).toHaveLength(10)
    expect(new Set(APPOINTMENT_COLORS.map((color) => color.id)).size).toBe(10)
    expect(APPOINTMENT_COLORS.map((color) => color.id)).toEqual([
      'blue',
      'sky',
      'teal',
      'green',
      'lime',
      'amber',
      'orange',
      'red',
      'pink',
      'violet',
    ])
    for (const color of APPOINTMENT_COLORS) {
      expect(color.label.length).toBeGreaterThan(0)
    }
  })
})
