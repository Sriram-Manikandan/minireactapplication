# Changes.md

## Existing Features Reviewed

### Features Kept
- **Neighborhood Feed** — Kept. Core to community communication, lets residents share updates.
- **Issue Reporting** — Kept. Essential for reporting local problems like broken streetlights.

### Features Removed
- **Task Assignment** — Removed. This is a workplace/corporate tool not suited for neighbors.
  - Deleted: `client/src/pages/Tasks.jsx`
  - Deleted: `client/src/components/TaskCard.jsx`
  - Deleted: `server/controllers/tasks.js`

- **Metrics Dashboard** — Removed. Analytics dashboards serve business teams not residents.
  - Deleted: `client/src/pages/Dashboard.jsx`
  - Deleted: `server/controllers/metrics.js`

- **Contributor Leaderboard** — Removed. Gamification creates competition not community spirit.
  - Deleted: `client/src/pages/Leaderboard.jsx`

## New Features Added

### Community Events
- Added: `client/src/pages/Events.jsx`
- Added: `server/routes/Events.js`
- Residents can post and view local events like neighborhood cleanups,
gatherings, or festivals. Helps neighbors coordinate in-person activities.

### Local Recommendations
- Added: `client/src/pages/Recommendations.jsx`
- Added: `server/routes/recommendations.js`
- Residents can recommend trusted local services like plumbers, electricians,
or bakeries. Helps the community share knowledge about reliable local businesses.

## How These Changes Improve the Product
The removed features were designed for productivity teams, not neighbors.
The new features directly support the platform's goal of helping residents
communicate, coordinate, and support each other locally.

## Deployment Links
- Frontend: Running locally on http://localhost:5173
- Backend: Running locally on http://localhost:5000