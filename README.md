# Conflict-Aware Scheduler

A single-page weekly calendar for managing appointments and guarantee no overlapping. Create, edit and delete appointments, drag them to a new time in 15-minute steps, and resize them to adjust the duration. Conflicts in appointments are detected and can be resolved before they are saved. Data is kept in the browser's localStorage.

<img width="1680" height="1002" alt="Screenshot 2026-11-12 at 15 53 22" src="https://github.com/user-attachments/assets/6f72b1a0-e66e-47ed-bc82-3deb9f2a8d5d" />

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

- **Navigate**: use the arrows to move between weeks and **Today** to return to the current week.
- **Create**: click **New appointment** or an empty hour, fill in the title, start and end date and time (and optional notes), then **Save**. The form checks the values only when you press **Save**, and clears each error as soon as you fix that field.
- **Edit / delete**: click an appointment to open it. Change the fields and **Save**, or choose **Delete** and confirm.
- **Move**: drag an appointment to another time or day. It snaps to 15-minute steps and keeps its duration. Dragging any segment of a multi-day appointment moves the whole appointment. With the keyboard, focus it, press Space, use Up and Down for 15 minutes and Left and Right for one day, then Space again to drop.
- **Resize**: drag the top edge to change the start or the bottom edge to change the end, also into another day's column to make it span days. Edges snap to 15 minutes and keep at least 15 minutes between them.
- **Conflicts**: when an appointment overlaps another, a dialog lists the overlaps and offers **Cancel** (discard the change), **Edit times** (back to the form) or **Move to ...** (the nearest free slot within a week).
- **Persistence**: appointments are saved to localStorage automatically and are restored when you reload the page.

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
