# RSVP Server

Backend API server for managing RSVP submissions and guest lists.

## Structure

```
rsvp-server/
├── api/                    # Vercel serverless functions
│   ├── _db.js              # MongoDB connection helper
│   ├── submissions.js      # Submissions API
│   ├── submissions/
│   │   └── bulk.js         # Bulk operations
│   ├── guestlist.js        # Guestlist API
│   ├── guestlist/
│   │   └── import.js       # Import endpoint
│   ├── admin/
│   │   ├── login.js        # Admin login
│   │   ├── setup.js        # Admin setup
│   │   └── check.js        # Check admin exists
│   └── health.js           # Health check
├── routes/                 # Express routes (for standalone server)
│   ├── submissions.js
│   ├── guestlist.js
│   └── admin.js
├── scripts/                # Utility scripts
│   ├── initAdmin.js        # Initialize admin user
│   └── migrateGuestlist.js # Migrate guestlist data
├── index.js                # Express server (for local dev)
└── package.json
```

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

## Running Locally (Express Server)

For local development, you can run the Express server:

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The API will be available at `http://localhost:3001/api`

## Vercel Deployment (Separate Project)

This server should be deployed as a **separate Vercel project**.

### Setup Steps:

1. **Create a new Vercel project** for `rsvp-server`:
   - Go to Vercel dashboard
   - Import the repository
   - Set the **Root Directory** to `rsvp-server`
   - Or deploy from the `rsvp-server` folder directly

2. **Set Environment Variables** in Vercel:
   - `MONGODB_URI` = `mongodb+srv://justinejusi98_db_user:QMXbwUXOrYvXPHMo@rsvp.porkr0i.mongodb.net`

3. **Deploy**:
   - Vercel will automatically detect the `api/` directory
   - Serverless functions will be deployed automatically

4. **Update Frontend**:
   - After deployment, update `utils/apiConfig.ts` with your rsvp-server Vercel URL
   - Or set `VITE_API_URL` environment variable in the frontend Vercel project

## API Endpoints

### Admin Authentication
- `POST /api/admin/login` - Authenticate admin user
- `POST /api/admin/setup` - Create or update admin user
- `GET /api/admin/check` - Check if admin exists

### Submissions
- `GET /api/submissions` - Get all submissions
- `GET /api/submissions?guestName=:name` - Get submission by guest name
- `POST /api/submissions` - Create or update submission
- `PUT /api/submissions/bulk` - Bulk update submissions
- `DELETE /api/submissions?guestName=:name` - Delete submission

### Guestlist
- `GET /api/guestlist` - Get all guests
- `POST /api/guestlist` - Add new guests
- `POST /api/guestlist/import` - Import guestlist (merge with existing)
- `PUT /api/guestlist` - Update entire guestlist
- `DELETE /api/guestlist?name=:name` - Delete guest

### Health Check
- `GET /api/health` - Server health status

## MongoDB Collections

The database uses three collections:
- `admin` - Stores admin user credentials (hashed passwords)
- `submissions` - Stores RSVP responses
- `guestlist` - Stores authorized guest names
