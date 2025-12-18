# Money Tracker

A modern personal finance app for tracking lending, borrowing, transactions, and personal expenses.

## Features

- Track money lent, borrowed, received, and repaid
- Personal expense management by category and month
- Secure end-to-end encryption for sensitive data
- Export transactions and expenses to PDF
- Responsive UI with dashboard and sidebar navigation

## Getting Started

1. Clone the repo
2. Run `npm install`
3. Add your backend URL to `.env`
4. Run `npm run dev`

---

## Trips (Beta)

A simple trip management feature to create shared trips with friends and track shared expenses.

- Create a trip from the UI (`/trips`) and invite others using the generated invite code or invite link.
- Invitees can join via the invite code (in UI or by opening the invite link).
- Add expenses to a trip; by default expenses are split equally among trip members, or provide custom splits through the API.

Backend endpoints (under `/trips`):

- `POST /trips` — create trip (body: `{ name, description, memberIds? }`)
- `POST /trips/join` — join by invite code (body: `{ inviteCode }`)
- `GET /trips` — list trips for the logged-in user
- `GET /trips/:id` — get trip details (including balances and expenses)
- `POST /trips/:id/expense` — add an expense to a trip (body: `{ amount, description, splits? }`)

UI:
- Route: `/trips` — list trips, create trip, join by code, view balances and add expenses.

This is an initial implementation; feel free to suggest improvements (per-user custom splits, settling suggestions, payments, notifications).


## Author

**Ganesh Waykar**  
[GitHub Profile](https://github.com/ganesh-waykar-2812)  
Email: ganeshwaykar2812@gmail.com

## License

MIT
