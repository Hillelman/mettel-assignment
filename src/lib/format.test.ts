import { formatCardRange, formatRangeFrom, formatRangeWithDates } from './format'

describe('format', () => {
  it('shows the date once for a range inside one day', () => {
    expect(formatRangeWithDates('2026-11-09T10:00', '2026-11-09T11:00')).toBe(
      'Mon, Nov 9, 10:00 – 11:00',
    )
  })

  it('shows both dates for a range across days', () => {
    expect(formatRangeWithDates('2026-11-09T10:00', '2026-11-10T02:00')).toBe(
      'Mon, Nov 9, 10:00 – Tue, Nov 10, 02:00',
    )
  })

  it('shows times only inside the reference date', () => {
    expect(formatRangeFrom('2026-11-09T10:00', '2026-11-09T11:00', '2026-11-09')).toBe(
      '10:00–11:00',
    )
    expect(formatRangeFrom('2026-11-10T10:00', '2026-11-10T11:00', '2026-11-09')).toBe(
      'Tue, Nov 10, 10:00 – 11:00',
    )
    expect(formatRangeFrom('2026-11-09T23:00', '2026-11-10T01:00', '2026-11-09')).toBe(
      'Mon, Nov 9, 23:00 – Tue, Nov 10, 01:00',
    )
  })

  it('formats card text with and without dates', () => {
    expect(formatCardRange('2026-11-09T09:30', '2026-11-09T11:00')).toBe('09:30 – 11:00')
    expect(formatCardRange('2026-11-09T09:30', '2026-11-09T11:00', ' to ')).toBe(
      '09:30 to 11:00',
    )
    expect(formatCardRange('2026-11-09T22:00', '2026-11-10T02:00')).toBe(
      'Mon, Nov 9, 22:00 – Tue, Nov 10, 02:00',
    )
  })
})
