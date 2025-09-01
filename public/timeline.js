// Load timeline data
async function loadTimeline() {
  try {
    console.log('Loading timeline data...');
    const response = await fetch('/api/data');
    console.log('API response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Timeline data received:', data);

    // Check if we have events
    if (!data.events || data.events.length === 0) {
      console.log('No events found in timeline data');
      showFallbackTimeline([]);
      return;
    }

    console.log('Initializing TimelineJS with', data.events.length, 'events');

    // Try to initialize TimelineJS
    try {
      if (typeof TL !== 'undefined' && TL.Timeline) {
        console.log('TimelineJS is available, initializing...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => {
            initializeTimeline(data);
          });
        } else {
          initializeTimeline(data);
        }
      } else {
        console.error('TimelineJS not available');
        showFallbackTimeline(data.events || []);
      }
    } catch (timelineError) {
      console.error('TimelineJS initialization error:', timelineError);
      showFallbackTimeline(data.events || []);
    }

  } catch (error) {
    console.error('Error loading timeline:', error);
    showFallbackTimeline([]);
  }
}

// Fallback timeline using simple HTML
function showFallbackTimeline(events) {
  console.log('Showing fallback timeline with', events.length, 'events');

  let html = '<div style="border: 1px solid #ccc; padding: 20px; margin: 20px 0; background: #f9f9f9;">';
  html += '<h3>Simple Timeline Fallback</h3>';

  if (events.length === 0) {
    html += '<p>No events to display. Add some events using the form above!</p>';
  } else {
    html += '<div style="display: flex; flex-direction: column; gap: 15px;">';
    events.forEach((event, index) => {
      const date = `${event.start_date.year}${event.start_date.month ? `-${event.start_date.month}` : ''}${event.start_date.day ? `-${event.start_date.day}` : ''}`;
      html += `
        <div style="border-left: 3px solid #007bff; padding-left: 15px; background: white; padding: 15px; border-radius: 5px;">
          <h4 style="margin: 0; color: #007bff;">${event.text.headline}</h4>
          <p style="margin: 5px 0; color: #666; font-size: 14px;">${date}</p>
          <p style="margin: 0;">${event.text.text}</p>
        </div>
      `;
    });
    html += '</div>';
  }

  html += '</div>';
  document.getElementById('timeline-embed').innerHTML = html;
}

// Load timeline on page load
console.log('Page loaded, calling loadTimeline');
loadTimeline();

// Function to initialize TimelineJS
function initializeTimeline(data) {
  try {
    if (window.timeline) {
      console.log('Updating existing timeline');
      window.timeline.updateData(data);
    } else {
      console.log('Creating new timeline');
      window.timeline = new TL.Timeline('timeline-embed', data, {
        debug: true,
        start_at_end: false,
        default_bg_color: '#f9f9f9'
      });
    }
  } catch (error) {
    console.error('Error in initializeTimeline:', error);
    throw error;
  }
}

// Handle form submission
document.getElementById('eventForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = {
    headline: document.getElementById('headline').value,
    text_content: document.getElementById('text_content').value,
    start_year: parseInt(document.getElementById('start_year').value),
    start_month: document.getElementById('start_month').value ? parseInt(document.getElementById('start_month').value) : null,
    start_day: document.getElementById('start_day').value ? parseInt(document.getElementById('start_day').value) : null,
    media_url: document.getElementById('media_url').value || null,
    media_caption: document.getElementById('media_caption').value || null,
    group_name: document.getElementById('group_name').value || null
  };
  
  try {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    const messageDiv = document.getElementById('message');
    
    if (response.ok) {
      messageDiv.textContent = result.message;
      messageDiv.className = 'success';
      document.getElementById('eventForm').reset();
      // Reload timeline to show new event
      loadTimeline();
    } else {
      messageDiv.textContent = result.error;
      messageDiv.className = 'error';
    }
  } catch (error) {
    console.error('Error adding event:', error);
    document.getElementById('message').textContent = 'Error adding event';
    document.getElementById('message').className = 'error';
  }
});
