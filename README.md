# Weekly Calendar

## Description

A single-page weekly calendar for managing appointments. Browse weeks, create,
edit and delete appointments, drag them to a new time or day, and drag the
bottom edge to resize. Overlapping appointments are detected and can be
resolved before they are saved. Data is kept in the browser's localStorage.

## Tech stack

- React 19, TypeScript, Vite
- Tailwind CSS 4 and shadcn/ui (Radix UI)
- react-hook-form for the appointment form
- dnd-kit for drag and drop
- Vitest and Testing Library for tests

## How to install

Requires [Bun](https://bun.sh).

```sh
bun install
bun dev
```

The app is served at http://localhost:5173 by default.

## How to use

- **Navigate**: use the arrows to move between weeks and **Today** to return to
  the current week.
- **Create**: click **New appointment**, fill in the title, date, start and end
  (and optional notes), then **Save**.
- **Edit / delete**: click an appointment to open it. Change the fields and
  **Save**, or choose **Delete** and confirm.
- **Move**: drag an appointment to another time slot or day. With the keyboard,
  focus it, press Space, use the arrow keys, then Space again to drop.
- **Resize**: drag the bottom edge of an appointment to change its end time.
- **Conflicts**: when an appointment overlaps another (or does not fit in the
  day), a dialog lists the overlaps and offers **Cancel** (discard the change),
  **Edit times** (back to the form) or **Move to ...** (the next free slot that
  day).
- **Persistence**: appointments are saved to localStorage automatically and are
  restored when you reload the page.

## Scripts

- `bun run dev`: start the dev server
- `bun run build`: type-check and build for production
- `bun run lint`: run ESLint
- `bun run typecheck`: run the TypeScript compiler without emitting
- `bun run test`: run the test suite once

## Project structure

```
src/
  components/
    appointments/  form, conflict and delete dialogs
    calendar/      week grid, day columns, cards, drag and resize
    layout/        app shell and navbar
    ui/            shadcn/ui primitives
  context/         calendar state provider and hook
  lib/             dates, time, conflicts, validation, storage
  types/           shared types
  App.tsx          composes the provider, layout and dialogs
```
