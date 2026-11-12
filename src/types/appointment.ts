export type Appointment = {
  id: string
  title: string
  /** Local wall-clock date-time, YYYY-MM-DDTHH:mm. */
  start: string
  /** Local wall-clock date-time, YYYY-MM-DDTHH:mm. Always after `start`. */
  end: string
  notes?: string
}

export type AppointmentInput = Omit<Appointment, 'id'>

/** The fields of the appointment form, before they are combined into date-times. */
export type AppointmentFormValues = {
  title: string
  /** YYYY-MM-DD */
  startDate: string
  /** HH:mm */
  startTime: string
  /** YYYY-MM-DD */
  endDate: string
  /** HH:mm */
  endTime: string
  notes?: string
}
