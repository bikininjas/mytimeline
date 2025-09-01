# Timeline App 📅

An interactive web application for creating and viewing historical timelines with real-time event management.

![Timeline App](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![TimelineJS](https://img.shields.io/badge/TimelineJS-FF6B35?style=for-the-badge&logo=javascript&logoColor=white)

## ✨ Features

- **Interactive Timeline**: Beautiful, responsive timeline using TimelineJS
- **Color-Coded Events**: Visual differentiation with color-coded timeline markers based on event type
  - 🟢 **Positive Events** (good) - Green markers
  - 🔴 **Negative Events** (bad) - Red markers  
  - ⚪ **Neutral Events** (neutral) - Gray markers
- **French Interface**: Complete French localization for user interface while keeping backend in English
- **Optimized Layout**: Full-width timeline (90% screen width) positioned above a compact event entry form
- **Real-time Updates**: Add events and see them appear instantly with proper color coding
- **Remote Database**: SQLiteCloud integration for cloud-based data storage
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Enhanced Event Management**: Streamlined form with event type and emotion selection
- **Media Support**: Include images and videos with your timeline events
- **Date Formatting**: Proper handling of historical dates
- **Advanced Styling**: Custom CSS with TimelineJS integration for visual enhancements

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **SQLiteCloud** - Cloud database service
- **@sqlitecloud/drivers** - Database driver

### Frontend
- **HTML5** - Markup with French localization
- **CSS3** - Advanced styling with CSS variables and TimelineJS integration
- **JavaScript (ES6+)** - Enhanced client-side logic with dynamic color styling
- **TimelineJS** - Timeline visualization library with custom color-coded markers

### Development Tools
- **Bun** - Fast JavaScript runtime and package manager
- **Git** - Version control
- **SSH** - Secure deployment

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- Bun (latest)
- Git
- SQLiteCloud account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bikininjas/mytimeline.git
   cd timeline-app
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your SQLiteCloud credentials
   ```

4. **Start the development server**
   ```bash
   bun start
   # OR use the management script
   ./manage.sh start
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📋 Environment Variables

Create a `.env` file in the root directory:

```env
SQLITE_URL=sqlitecloud://your-project.sqlite.cloud:8860/your-database?apikey=your-api-key
```

## 🎯 Usage

### Server Management

The application includes a comprehensive management script for easy server control:

```bash
# Start server in background
./manage.sh start

# Check server status
./manage.sh status

# View server logs
./manage.sh logs

# Stop server
./manage.sh stop

# Restart server
./manage.sh restart

# Clean up logs
./manage.sh cleanup
```

**Management Script Features:**
- ✅ Background server operation
- ✅ Process monitoring and health checks
- ✅ Automatic PID management
- ✅ Colored status output
- ✅ Log file management
- ✅ Graceful server shutdown
- ✅ **Database management** (wipe all data)

### Database Management

```bash
# ⚠️  Completely wipe ALL database data (requires confirmation)
./manage.sh wipe-db
```

**Warning:** The `wipe-db` command will permanently delete ALL data from your database. This action cannot be undone. You'll be prompted to type 'yes' to confirm before the operation proceeds.

### Adding Events

1. Open the application in your browser
2. Scroll down to the "Ajouter un Nouvel Événement" form (compact layout below the timeline)
3. Fill in the required fields:
   - **Titre de l'Événement** (required) - Event title
   - **Description** (required) - Event description
   - **Année** (required) - Year
   - **Mois** (optional) - Month
   - **Jour** (optional) - Day
   - **Catégorie** (optional) - Event category
   - **Type d'Événement** (required) - Event type for color coding:
     - **Positif** (good) - Creates green timeline markers
     - **Négatif** (bad) - Creates red timeline markers
     - **Neutre** (neutral) - Creates gray timeline markers
   - **Émotion** (required) - Choose from various emotions (joie, tristesse, colère, etc.)
4. Click "Ajouter l'Événement"
5. The event will appear instantly on the timeline above with the appropriate color coding

### Viewing Timeline

- **Navigate**: Click and drag to move through time
- **Zoom**: Use mouse wheel to zoom in/out
- **Click Events**: Click on timeline events to see full details
- **Color Recognition**: Instantly identify event types by marker colors
- **Full Width**: Timeline takes 90% of screen width for better visibility
- **Responsive**: Timeline adapts to your screen size

## 🔌 API Endpoints

### GET /api/data
Returns timeline data in TimelineJS format
```json
{
  "events": [
    {
      "start_date": {
        "year": "1939",
        "month": "09",
        "day": "01"
      },
      "text": {
        "headline": "World War II Begins",
        "text": "Germany invades Poland..."
      }
    }
  ]
}
```

### POST /api/events
Add a new event to the timeline

**Request Body:**
```json
{
  "headline": "Event Title",
  "text_content": "Event description",
  "start_year": 2023,
  "start_month": 12,
  "start_day": 25,
  "media_url": "https://example.com/image.jpg",
  "media_caption": "Image caption",
  "group_name": "Historical Events",
  "event_type": "good",
  "emotion": "joy"
}
```

**Event Types for Color Coding:**
- `"good"` - Positive events (green markers)
- `"bad"` - Negative events (red markers)
- `"neutral"` - Neutral events (gray markers)

## 🗄️ Database Schema

### Events Table
```sql
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  headline TEXT NOT NULL,
  text_content TEXT NOT NULL,
  start_year INTEGER NOT NULL,
  start_month INTEGER,
  start_day INTEGER,
  media_url TEXT,
  media_caption TEXT,
  group_name TEXT,
  event_type TEXT NOT NULL,
  emotion TEXT NOT NULL
);
```

**Key Fields:**
- `event_type` - Determines timeline marker color ("good", "bad", "neutral")
- `emotion` - Additional emotional context for events

## 🏗️ Project Structure

```
timeline-app/
├── server.js              # Express server with French API responses
├── package.json           # Dependencies and scripts
├── bun.lock              # Bun lockfile
├── .env                  # Environment variables
├── .gitignore           # Git ignore rules
├── README.md            # This file
├── manage.sh            # Enhanced server management script
└── public/
    ├── index.html       # Main HTML page (French interface)
    ├── timeline.css     # Enhanced styles with color variables and TimelineJS integration
    └── timeline.js      # Client-side logic with color coding and dynamic styling
```

## 🎨 Color Coding System

The application features an advanced color coding system that provides visual differentiation for different types of events on the timeline:

### Color Scheme
- **🟢 Green (`#10b981`)** - Positive events (event_type: "good")
  - Examples: Graduations, promotions, achievements, celebrations
- **🔴 Red (`#ef4444`)** - Negative events (event_type: "bad")  
  - Examples: Accidents, losses, conflicts, disasters
- **⚪ Gray (`#64748b`)** - Neutral events (event_type: "neutral")
  - Examples: Regular meetings, routine activities, general milestones

### Technical Implementation
- **CSS Variables**: Centralized color management with CSS custom properties
- **TimelineJS Integration**: Custom styling targeting `.tl-timemarker` and `.tl-timemarker-content-container` classes
- **Dynamic Styling**: JavaScript functions automatically apply colors based on event data
- **Override System**: Aggressive CSS rules with `!important` flags ensure proper color display
- **Multi-approach Detection**: Multiple JavaScript methods detect and style timeline markers

### Visual Benefits
- **Instant Recognition**: Users can quickly identify event types by color
- **Enhanced Navigation**: Color patterns help with timeline browsing
- **Improved UX**: Visual hierarchy makes information more accessible
- **Consistent Design**: Unified color scheme across all timeline elements

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Start production server
npm start
```

### Code Style

- Use ES6+ features
- Follow standard JavaScript naming conventions
- Keep functions small and focused
- Add comments for complex logic

## 🚀 Deployment

### Local Development

The application includes a comprehensive management script for easy server control:

```bash
# Start server in background
./manage.sh start

# Check server status
./manage.sh status

# View server logs
./manage.sh logs

# Stop server
./manage.sh stop

# Restart server
./manage.sh restart

# Clean up logs
./manage.sh cleanup
```

### Google Cloud Run

Deploy to Google Cloud Run with automatic CI/CD via GitHub Actions.

**Setup Requirements:**
1. Your GCP project should already be configured
2. Ensure Cloud Run and Artifact Registry APIs are enabled
3. Create an Artifact Registry repository named `timeline-app` in `us-central1`
4. Create a Secret Manager secret named `SQLITECLOUD_TIMELINE_CONNECTION_STRING` with your database URL
5. The following organization secrets should already be configured:
   - `GCP_PROJECT_ID` - Your GCP project ID
   - `GCS_GH_SVC_ACCOUNT_JSON_KEY` - Service account key for GitHub Actions
   - `SQLITECLOUD_TIMELINE_CONNECTION_STRING` - Your SQLiteCloud database connection string

**Deployment:**
- Push to `main` or `master` branch triggers automatic deployment
- Uses minimal resources: 128Mi RAM, 0.08 CPU, max 1 instance
- Deploys to `us-central1` region

The GitHub Actions workflow will automatically:
- Build Docker image using Bun Alpine
- Push to Google Artifact Registry
- Deploy to Cloud Run with minimal resource allocation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌐 Internationalization

### French Localization
The application features complete French localization for the user interface:

- **Form Labels**: All form fields use French terminology
- **Button Text**: Action buttons display French text ("Ajouter l'Événement")
- **Placeholders**: Input fields show French placeholder text
- **Messages**: System messages and feedback in French
- **Event Types**: French options (Positif, Négatif, Neutre)
- **Emotions**: French emotion labels (joie, tristesse, colère, etc.)

### Backend Language
- **API Responses**: Server responses in French for user-facing messages
- **Database**: Field names remain in English for technical consistency
- **Code Comments**: Mixed French/English documentation

## 📈 Recent Improvements

### Version 2.0 Features
- ✅ **Complete French Interface**: Full localization while maintaining English backend
- ✅ **Color-Coded Timeline**: Visual event type differentiation with green/red/gray markers
- ✅ **Enhanced Layout**: 90% width timeline positioned above compact form
- ✅ **Advanced Styling**: CSS variables and TimelineJS integration
- ✅ **Dynamic Color System**: JavaScript-driven color application with multiple detection methods
- ✅ **Improved Database Schema**: Added event_type and emotion fields
- ✅ **Enhanced Management Script**: Better server control and database management

### Technical Enhancements
- **CSS Architecture**: Modular design with CSS custom properties
- **JavaScript Optimization**: Enhanced DOM manipulation and styling functions
- **Database Integration**: Improved data structure for better categorization
- **Responsive Design**: Better mobile and tablet compatibility
- **Performance**: Optimized color detection and application algorithms

## 🙏 Acknowledgments

- [TimelineJS](https://timeline.knightlab.com/) - Beautiful timeline visualization
- [SQLiteCloud](https://sqlitecloud.io/) - Cloud database service
- [Express.js](https://expressjs.com/) - Web framework
- [Bun](https://bun.sh/) - Fast JavaScript runtime

## 📞 Support

If you have any questions or issues:

1. Check the [Issues](https://github.com/bikininjas/mytimeline/issues) page
2. Create a new issue with detailed information
3. Contact the maintainers

---

**Made with ❤️ using Node.js, Express, and TimelineJS**</content>
<parameter name="filePath">/home/seb/GITRepos/timeline-app/README.md
