import { STORAGE_KEY } from '@/config'
import type { Appointment } from '@/types/appointment'
import { loadAppointments, saveAppointments } from './storage'

const valid: Appointment = {
  id: 'a',
  title: 'Dentist',
  date: '2026-11-09',
  start: '09:00',
  end: '10:00',
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
      JSON.stringify([valid, { ...valid, id: 'b', end: '08:00' }, null, 'x']),
    )
    expect(loadAppointments()).toEqual([valid])
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
