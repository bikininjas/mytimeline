const express = require('express');
require('dotenv').config();
const { Database } = require("@sqlitecloud/drivers");
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Ensure table exists
async function ensureTable() {
  const db = new Database(process.env.SQLITE_URL);
  try {
    await db.sql(`CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      headline TEXT NOT NULL,
      text_content TEXT NOT NULL,
      start_year INTEGER NOT NULL,
      start_month INTEGER,
      start_day INTEGER,
      media_url TEXT,
      media_caption TEXT,
      group_name TEXT,
      event_type TEXT DEFAULT 'neutral',
      emotion TEXT DEFAULT 'neutral'
    )`);
  } catch (error) {
    console.log('Table creation error (may already exist):', error.message);
  } finally {
    db.close();
  }
}
ensureTable();

// API route for TimelineJS data
app.get('/api/data', async (req, res) => {
  let db = null;
  try {
    db = new Database(process.env.SQLITE_URL);
    const result = await db.sql('SELECT * FROM events');
    const rows = result;
    // Transform DB rows to TimelineJS JSON structure
    const events = rows.map(row => {
      const emotionEmojis = {
        joy: '😄', pride: '🌟', gratitude: '🙏', anger: '😠', shame: '😳',
        self_deprecation: '😔', self_esteem: '💪', sadness: '😢', anxiety: '😰', neutral: '😐'
      };

      const emotionEmoji = emotionEmojis[row.emotion] || '😐';
      const emotionText = row.emotion ? ` ${emotionEmoji} ${row.emotion.replace('_', ' ')}` : '';

      return {
        start_date: {
          year: row.start_year.toString(),
          month: row.start_month ? row.start_month.toString().padStart(2, '0') : undefined,
          day: row.start_day ? row.start_day.toString().padStart(2, '0') : undefined
        },
        text: {
          headline: row.headline + emotionText,
          text: row.text_content
        },
        media: row.media_url ? {
          url: row.media_url,
          caption: row.media_caption || ''
        } : undefined,
        group: row.event_type || 'neutral',
        event_type: row.event_type || 'neutral',
        emotion: row.emotion || 'neutral'
      };
    });
    const timelineData = {
      events: events
    };
    res.json(timelineData);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    db?.close();
  }
});

// API route to add new event
app.post('/api/events', express.json(), async (req, res) => {
  const { headline, text_content, start_year, start_month, start_day, media_url, media_caption, group_name, event_type, emotion } = req.body;

  if (!headline || !text_content || !start_year) {
    return res.status(400).json({ error: 'Le titre, le contenu textuel et l\'année de début sont requis' });
  }

  let db = null;
  try {
    db = new Database(process.env.SQLITE_URL);

    // Build SQL string with proper escaping
    const sql = `INSERT INTO events (headline, text_content, start_year, start_month, start_day, media_url, media_caption, group_name, event_type, emotion)
                 VALUES ('${headline.replace(/'/g, "''")}', '${text_content.replace(/'/g, "''")}', ${start_year},
                         ${start_month || 'NULL'}, ${start_day || 'NULL'},
                         ${media_url ? `'${media_url.replace(/'/g, "''")}'` : 'NULL'},
                         ${media_caption ? `'${media_caption.replace(/'/g, "''")}'` : 'NULL'},
                         ${group_name ? `'${group_name.replace(/'/g, "''")}'` : 'NULL'},
                         '${(event_type || 'neutral').replace(/'/g, "''")}',
                         '${(emotion || 'neutral').replace(/'/g, "''")}')`;

    await db.sql(sql);
    res.json({ success: true, message: 'Événement ajouté avec succès' });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    db?.close();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
