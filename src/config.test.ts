import * as config from '@/config'

describe('config', () => {
  it('exports the agreed constants', () => {
    expect({ ...config }).toEqual({
      STORAGE_KEY: 'mettel.calendar.appointments.v1',
      WEEK_STARTS_ON: 1,
      STEP_MINUTES: 15,
      MIN_DURATION_MINUTES: 15,
      SLOT_SEARCH_DAYS: 1,
      DEFAULT_DURATION_MINUTES: 60,
      HOUR_HEIGHT_PX: 64,
      DEFAULT_SCROLL_HOUR: 8,
      TOUCH_DRAG_DELAY_MS: 250,
      TITLE_MAX_LENGTH: 80,
      NOTES_MAX_LENGTH: 500,
      COMPACT_CARD_MAX_MINUTES: 15,
      APPOINTMENT_COLORS: config.APPOINTMENT_COLORS,
      DEFAULT_APPOINTMENT_COLOR: 'blue',
    })
  })
})
