export type Appointment = {
  id: string
  title: string
  /** YYYY-MM-DD */
  date: string
  /** HH:mm */
  start: string
  /** HH:mm */
  end: string
  notes?: string
}

export type AppointmentInput = Omit<Appointment, 'id'>
