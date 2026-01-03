# RSVP Server

Backend API server for managing RSVP submissions and guest lists.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update the `.env` file with your MongoDB connection string.

4. Initialize the admin user:
```bash
npm run init-admin
```

This creates a default admin user (username: `admin`, password: `JohnseanKristine2026`).

5. Migrate guestlist data from JSON to MongoDB (optional):
```bash
npm run migrate-guestlist
```

This will transfer all guests from `guestlist.json` to the MongoDB database.

## Running

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Submissions
- `GET /api/submissions` - Get all submissions
- `GET /api/submissions/:guestName` - Get submission by guest name
- `POST /api/submissions` - Create or update submission
- `PUT /api/submissions/bulk` - Update all submissions
- `DELETE /api/submissions/:guestName` - Delete submission

### Guestlist
- `GET /api/guestlist` - Get all guests
- `POST /api/guestlist` - Add new guests
- `POST /api/guestlist/import` - Import guestlist (merge with existing)
- `PUT /api/guestlist` - Update entire guestlist
- `DELETE /api/guestlist/:name` - Delete guest

### Admin Authentication
- `POST /api/admin/login` - Authenticate admin user
- `POST /api/admin/setup` - Create or update admin user
- `GET /api/admin/check` - Check if admin exists

### Health Check
- `GET /api/health` - Server health status

## MongoDB Collections

The database uses three collections:
- `admin` - Stores admin user credentials (hashed passwords)
- `submissions` - Stores RSVP responses
- `guestlist` - Stores authorized guest names

