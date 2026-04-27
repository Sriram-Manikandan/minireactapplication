# Challenge Findings

## 1. How the Productivity Score Currently Works

The score is stored as a raw integer in a `Score` database table. It is updated through side-effects in `taskController.js` — creating a task adds +5 to the stored value, and completing a task adds +10. When the score is fetched via `GET /score`, `scoreController.js` reads the stored value and then calls `calculateMomentumBonus` from `scoreHelper.js`, which multiplies the count of completed tasks by 3.75 and adds that on top before returning the final number to the client.

## 2. Issues Discovered

- **Score inflates on every page load** — `calculateMomentumBonus` is recalculated and added to the stored DB value on every `GET /score` request, so simply refreshing the dashboard permanently grows the score.
- **Creating a task awards points** — the controller adds +5 to the score when a task is created, which has nothing to do with productivity.
- **Score never decreases** — deleting a task or unchecking it does not reduce the score, so points only ever go up.
- **Important tasks not implemented** — the client requirement explicitly mentions important tasks, but the `Task` model has no `important` field, the form has no way to mark a task as important, and the score makes no distinction between task types.
- **Status label is hardcoded** — `ScoreWidget` always displays "High Energy Today" regardless of the actual score value.

## 3. Proposed Improvements

- Remove the `Score` table entirely and compute the score fresh from task data on every request, so it is always consistent with actual task state.
- Define a clear, transparent scoring rule: completing a regular task earns **10 pts**, completing an important task earns **20 pts**.
- Remove all score side-effects from `taskController.js` so that creating or deleting tasks does not directly manipulate a score value.
- Add an `important` field to the `Task` model and expose it through the API.
- Add a star toggle to `TaskForm` (on creation) and `TaskCard` (after creation) so users can mark tasks as important.
- Make the status label in `ScoreWidget` dynamic so it reflects the user's actual score level.

## 4. Implementation Details

- **`schema.prisma`** — added `important Boolean @default(false)` to the `Task` model and removed the `Score` model entirely.
- **`scoreHelper.js`** — replaced `calculateMomentumBonus` with `calculateScore`, which filters completed tasks and sums 20 pts for important tasks and 10 pts for regular ones.
- **`scoreController.js`** — now fetches all tasks and passes them to `calculateScore`, returning the result directly with no DB score table involved.
- **`taskController.js`** — removed all score increment logic from `createTask`, `updateTask`, and `deleteTask`; `createTask` and `updateTask` now accept and persist the `important` field.
- **`api.js`** — updated `createTask` to accept and send `important`, and updated `updateTaskStatus` to optionally send `important` in the patch payload.
- **`TaskForm.jsx`** — added a star toggle that lets users mark a task as important before creating it, with a hint showing the point value.
- **`TaskCard.jsx`** — added a star button to toggle importance on existing tasks and an "Important" badge displayed on marked tasks.
- **`ScoreWidget.jsx`** — status label is now derived from the score value (Getting Started → Building Momentum → High Energy Today → On Fire 🔥), and a breakdown shows points earned from important vs regular completed tasks.