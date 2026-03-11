# 💖 My Daily Space

A beautiful personal daily space application with authentication, database persistence, and multiple user support.

## Features

- ✨ **Requests & Wishes** - Add and track personal requests
- 🌸 **Daily Feelings** - Track emotions with cute emojis
- 📅 **Availability Calendar** - Visual calendar with color-coded availability
- 🌟 **Bucket List** - Shared bucket list items
- 💾 **Database Persistence** - All data saved to SQLite database
- 🌐 **Direct Access** - No authentication required

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Session Management**: Express Sessions
- **Deployment**: Vercel-ready

## Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Access Application**
   Open http://localhost:3000 in your browser

## Production Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Deploy (zero configuration needed!)

### Manual Deployment

1. **Install Production Dependencies**
   ```bash
   npm install --production
   ```

2. **Start Production Server**
   ```bash
   npm start
   ```

## Database

The application uses SQLite for data persistence with the following tables:

- `users` - User authentication
- `requests` - User requests and wishes
- `feelings` - Daily feeling entries
- `availability` - Calendar availability data
- `bucket_list` - Shared bucket list items

Database file: `daily_space.db` (auto-created on first run)

## API Endpoints

### No authentication required - all endpoints are directly accessible

### Requests
- `GET /api/requests` - Get all user requests
- `POST /api/requests` - Create new request
- `PUT /api/requests/:id` - Update request (toggle completion)
- `DELETE /api/requests/:id` - Delete request

### Feelings
- `GET /api/feelings/:date` - Get feelings for specific date
- `POST /api/feelings` - Save feelings for date

### Availability
- `GET /api/availability` - Get all availability data
- `GET /api/availability/:date` - Get availability for specific date
- `POST /api/availability` - Save availability for date

### Bucket List
- `GET /api/bucket-list` - Get all bucket list items
- `POST /api/bucket-list` - Create new bucket list item
- `PUT /api/bucket-list/:id` - Update bucket list item
- `DELETE /api/bucket-list/:id` - Delete bucket list item

## Environment Variables

No environment variables required for basic setup. The application uses:

- **Port**: `process.env.PORT || 3000`
- **Session Secret**: Hardcoded (change in production)
- **Database**: SQLite file-based

## Security Notes

- No authentication required - direct access to all features
- Database is file-based SQLite (consider PostgreSQL for production)
- All data uses a single default user ID for simplicity

## License

MIT License - Feel free to customize for your personal use! 💕