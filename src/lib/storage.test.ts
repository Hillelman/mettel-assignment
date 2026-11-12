import { STORAGE_KEY } from '@/config'
import type { Appointment } from '@/types/appointment'
import { loadAppointments, saveAppointments } from './storage'

const valid: Appointment = {
  id: 'a',
  title: 'Dentist',
  start: '2026-11-09T09:00',
  end: '2026-11-09T10:00',
  notes: 'Bring forms',
}

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('round-trips valid data', () => {
    saveAppointments([valid])
    expect(loadAppointments()).toEqual([valid])
  })

  it('returns an empty list when nothing is stored', () => {
    expect(loadAppointments()).toEqual([])
  })

  it('returns an empty list for malformed JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(loadAppointments()).toEqual([])
  })

  it('returns an empty list for a non-array value', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ a: 1 }))
    expect(loadAppointments()).toEqual([])
  })

  it('drops invalid entries', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([valid, { ...valid, id: 'b', end: '2026-11-09T08:00' }, null, 'x']),
    )
    expect(loadAppointments()).toEqual([valid])
  })

  it('migrates v1 entries to date-times', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { id: 'a', title: 'Dentist', date: '2026-11-09', start: '09:00', end: '10:00', notes: 'Bring forms' },
        { id: 'b', title: 'Late', date: '2026-11-09', start: '22:00', end: '24:00' },
        { id: 'c', title: 'New year', date: '2026-12-31', start: '23:00', end: '24:00' },
      ]),
    )
    expect(loadAppointments()).toEqual([
      valid,
      { id: 'b', title: 'Late', start: '2026-11-09T22:00', end: '2026-11-10T00:00' },
      { id: 'c', title: 'New year', start: '2026-12-31T23:00', end: '2027-01-01T00:00' },
    ])
  })

  it('drops malformed v1 entries', () => {
    const v1 = { id: 'a', title: 'Dentist', date: '2026-11-09', start: '09:00', end: '10:00' }
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { ...v1, end: '08:00' },
        { ...v1, id: 'b', end: '25:00' },
        { ...v1, id: 'c', date: '2026-02-30' },
        { ...v1, id: 'd', start: '24:00', end: '24:00' },
      ]),
    )
    expect(loadAppointments()).toEqual([])
  })

  it('does not throw when localStorage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('full')
    })
    expect(loadAppointments()).toEqual([])
    expect(() => saveAppointments([valid])).not.toThrow()
  })
})
