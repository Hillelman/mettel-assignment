export const STORAGE_KEY = "mettel.calendar.appointments.v1";
/** 0 = Sunday, 1 = Monday */
export const WEEK_STARTS_ON: 0 | 1 = 1;
export const STEP_MINUTES = 15;
export const MIN_DURATION_MINUTES = 15;
export const SLOT_SEARCH_DAYS = 1;
export const DEFAULT_DURATION_MINUTES = 60;
export const HOUR_HEIGHT_PX = 64;
export const DEFAULT_SCROLL_HOUR = 8;
export const TOUCH_DRAG_DELAY_MS = 250;
export const TITLE_MAX_LENGTH = 80;
export const NOTES_MAX_LENGTH = 500;
export const COMPACT_CARD_MAX_MINUTES = 15;
export const APPOINTMENT_COLORS = [
  { id: "blue", label: "Blue" },
  { id: "sky", label: "Sky" },
  { id: "teal", label: "Teal" },
  { id: "green", label: "Green" },
  { id: "lime", label: "Lime" },
  { id: "amber", label: "Amber" },
  { id: "orange", label: "Orange" },
  { id: "red", label: "Red" },
  { id: "pink", label: "Pink" },
  { id: "violet", label: "Violet" },
] as const;

export type AppointmentColor = (typeof APPOINTMENT_COLORS)[number]["id"];
