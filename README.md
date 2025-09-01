# Timeline App 📅

An interactive web application for creating and viewing historical timelines with real-time event management.

![Timeline App](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![TimelineJS](https://img.shields.io/badge/TimelineJS-FF6B35?style=for-the-badge&logo=javascript&logoColor=white)

## ✨ Features

- **Interactive Timeline**: Beautiful, responsive timeline using TimelineJS
- **Real-time Updates**: Add events and see them appear instantly
- **Remote Database**: SQLiteCloud integration for cloud-based data storage
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Event Management**: Easy-to-use form for adding historical events
- **Media Support**: Include images and videos with your timeline events
- **Date Formatting**: Proper handling of historical dates

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **SQLiteCloud** - Cloud database service
- **@sqlitecloud/drivers** - Database driver

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling
- **JavaScript (ES6+)** - Client-side logic
- **TimelineJS** - Timeline visualization library

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

### Adding Events

1. Open the application in your browser
2. Scroll down to the "Add New Event" form
3. Fill in the required fields:
   - **Headline** (required)
   - **Description** (required)
   - **Year** (required)
   - **Month** (optional)
   - **Day** (optional)
   - **Media URL** (optional)
   - **Media Caption** (optional)
   - **Group** (optional)
4. Click "Add Event"
5. The event will appear instantly on the timeline above

### Viewing Timeline

- **Navigate**: Click and drag to move through time
- **Zoom**: Use mouse wheel to zoom in/out
- **Click Events**: Click on timeline events to see full details
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
  "group_name": "Historical Events"
}
```

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
  group_name TEXT
);
```

## 🏗️ Project Structure

```
timeline-app/
├── server.js              # Express server
├── package.json           # Dependencies and scripts
├── bun.lock              # Bun lockfile
├── .env                  # Environment variables
├── .gitignore           # Git ignore rules
├── README.md            # This file
└── public/
    ├── index.html       # Main HTML page
    ├── timeline.css     # Styles
    └── timeline.js      # Client-side logic
```

## 🔧 Development

### Available Scripts

```bash
# Start development server
bun start

# Install dependencies
bun install

# Add new dependency
bun add package-name

# Remove dependency
bun remove package-name
```

### Code Style

- Use ES6+ features
- Follow standard JavaScript naming conventions
- Keep functions small and focused
- Add comments for complex logic

## 🚀 Deployment

### Environment Setup

1. Set up your production environment variables
2. Ensure SQLiteCloud database is accessible
3. Configure your web server (nginx, Apache, etc.)

### Build for Production

```bash
# Install production dependencies only
bun install --production

# Start production server
NODE_ENV=production bun start
```

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
