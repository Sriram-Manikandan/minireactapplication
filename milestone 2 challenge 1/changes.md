# Changes.md

## Original Feature: Motivation Mode

The original feature (`MotivationWidget.jsx`) displayed random motivational
quotes fetched from the backend, refreshing every 5 seconds.

### Why it was ineffective

- Quotes are passive — they do not help users act on their tasks
- A 5-second refresh interval wasted network resources unnecessarily
- Task completion rates did not improve with the feature active
- Users reported the feature as distracting and unhelpful
- It provided no information directly tied to the user's actual work

## What I Replaced It With: FocusWidget

I replaced `MotivationWidget` with `FocusWidget`, which combines two
productivity-focused features in the same sidebar space:

### 1. Progress Tracker
- Shows how many tasks have been completed out of the total (e.g. 3 / 7)
- Includes a visual progress bar that fills as tasks are completed
- Motivates users through real achievement, not passive quotes

### 2. Focus Timer (Pomodoro)
- 25-minute focused work session followed by a 5-minute break
- User can Start, Pause, and Reset the timer
- Based on the Pomodoro technique, a proven productivity method
- Encourages deep focus and prevents burnout

## How It Improves the Application

| Feature | Motivation Mode | FocusWidget |
|---|---|---|
| Tied to task completion | No | Yes |
| Encourages action | No | Yes |
| Wastes network resources | Yes (every 5s) | No |
| Proven productivity method | No | Yes (Pomodoro) |
| Shows real progress | No | Yes |

## Files Changed

- `client/src/components/MotivationWidget.jsx` → replaced by `FocusWidget.jsx`
- `client/src/pages/Dashboard.jsx` → updated import and usage
- `client/src/api/motivationApi.js` → no longer used (can be removed)