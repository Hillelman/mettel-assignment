export const HOURS = Array.from({ length: 24 }, (_, hour) => hour)

/** Shared by day headers and the gutter spacer so the rows line up. */
export const DAY_HEADER_HEIGHT_CLASS = 'h-14'

/**
 * Room below the last hour line, so the gutter's 24:00 label is not clipped by
 * the scroll container. Used by the gutter and every day column.
 */
export const GRID_BOTTOM_PAD_CLASS = 'h-3'
