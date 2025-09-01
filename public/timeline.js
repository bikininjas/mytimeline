// Helper function to get event type color
function getEventTypeColor(eventType) {
  const colors = {
    good: '#10b981',
    bad: '#ef4444',
    neutral: '#64748b'
  };
  return colors[eventType] || colors.neutral;
}

// Load timeline data
async function loadTimeline() {
  try {
    const response = await fetch('/api/data');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Check if we have events
    if (!data.events || data.events.length === 0) {
      showFallbackTimeline([]);
      populateEventsDropdown([]); // Update dropdown with empty events
      return;
    }

    // Populate the events dropdown
    populateEventsDropdown(data.events);

    // Try to initialize TimelineJS
    try {
      if (typeof TL !== 'undefined' && TL.Timeline) {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => {
            initializeTimeline(data);
          });
        } else {
          initializeTimeline(data);
        }
      } else {
        showFallbackTimeline(data.events || []);
      }
    } catch (timelineError) {
      showFallbackTimeline(data.events || []);
    }

  } catch (error) {
    showFallbackTimeline([]);
  }
}

// Fallback timeline using simple HTML
function showFallbackTimeline(events) {
  // Populate dropdown even in fallback mode
  populateEventsDropdown(events);

  let html = '<div style="border: 1px solid #ccc; padding: 20px; margin: 20px 0; background: #f9f9f9; border-radius: 8px;">';
  html += '<h3 style="margin-top: 0; color: var(--text-primary);">📅 Chronologie Simple de Secours</h3>';

  if (events.length === 0) {
    html += '<p style="color: #64748b;">Aucun événement à afficher. Ajoutez des événements en utilisant le formulaire !</p>';
  } else {
    html += '<div style="display: flex; flex-direction: column; gap: 15px;">';
    events.forEach((event, index) => {
      const date = `${event.start_date.year}${event.start_date.month ? `-${String(event.start_date.month).padStart(2, '0')}` : ''}${event.start_date.day ? `-${String(event.start_date.day).padStart(2, '0')}` : ''}`;
      const eventType = event.event_type || 'neutral';
      const emotion = event.emotion || 'neutral';

      // Get emoji for emotion
      const emotionEmojis = {
        joy: '😄', pride: '🌟', gratitude: '🙏', anger: '😠', shame: '😳',
        self_deprecation: '😔', self_esteem: '💪', sadness: '😢', anxiety: '😰', neutral: '😐'
      };

      const emotionEmoji = emotionEmojis[emotion] || '😐';

      html += `
        <div class="timeline-event-${eventType}" style="border-left: 4px solid ${getEventTypeColor(eventType)}; padding-left: 15px; background: var(--surface-color); padding: 15px; border-radius: 8px; box-shadow: var(--shadow-sm); position: relative;">
          <div class="edit-buttons">
            <button class="edit-button" onclick="editEvent(${event.id})" title="Modifier l'événement">
              ✏️
            </button>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
            <h4 style="margin: 0 0 5px 0; color: #1e293b; font-size: 1.1em;">${event.text.headline}</h4>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <span class="event-indicator ${eventType}" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;">${eventType}</span>
              <span class="emotion-indicator">${emotionEmoji} ${emotion.replace('_', ' ')}</span>
            </div>
          </div>
          <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px;">📅 ${date}</p>
          <p style="margin: 0; color: #374151; line-height: 1.5;">${event.text.text}</p>
          ${event.media ? `<p style="margin: 10px 0 0 0; font-size: 14px;"><a href="${event.media.url}" target="_blank" style="color: var(--primary-color);">🔗 Voir le Média</a></p>` : ''}
        </div>
      `;
    });
    html += '</div>';
  }

  html += '</div>';
  document.getElementById('timeline-embed').innerHTML = html;
}

// Function to initialize TimelineJS
function initializeTimeline(data) {
  try {
    // Ensure data has proper structure for TimelineJS
    if (!data.events || !Array.isArray(data.events)) {
      showFallbackTimeline([]);
      return;
    }

    // Transform data to ensure proper group structure
    const transformedData = {
      ...data,
      events: data.events.map(event => ({
        ...event,
        group: event.event_type || 'neutral' // Ensure group is set
      }))
    };

    if (window.timeline) {
      window.timeline.updateData(transformedData);
      
      // Add edit buttons after update
      setTimeout(() => {
        addTimelineStyling();
        addEditButtonsToSlides();
      }, 1000);
      setTimeout(() => addEditButtonsToSlides(), 2000);
    } else {
      window.timeline = new TL.Timeline('timeline-embed', transformedData, {
        debug: false,
        start_at_end: false,
        default_bg_color: '#f8fafc',
        scale_factor: 1,
        initial_zoom: 1,
        timenav_height: 200,
        timenav_height_percentage: 25,
        timenav_mobile_height_percentage: 40,
        marker_height_min: 30,
        marker_width_min: 100,
        marker_padding: 5,
        start_at_slide: 0,
        menubar_height: 0,
        skinny_size: 650,
        relative_date: false,
        use_bc: false,
        hash_bookmark: false
      });

      // Add custom styling after TimelineJS loads
      setTimeout(() => {
        addTimelineStyling();
        addEditButtonsToSlides();
      }, 1000);
      
      // Add additional attempts to ensure edit buttons are added
      setTimeout(() => addEditButtonsToSlides(), 2000);
      setTimeout(() => addEditButtonsToSlides(), 3000);
    }
  } catch (error) {
    throw error;
  }
}

// Add custom styling to TimelineJS elements
function addTimelineStyling() {
  // Apply styling multiple times to ensure it sticks
  const applyStylesWithDelay = (delay) => {
    setTimeout(() => {
      try {
        
        // Target the CORRECT TimelineJS marker classes from documentation
        const correctMarkerSelectors = [
          '.tl-timemarker',
          '.tl-timemarker-content-container',
          '.tl-timemarker-timespan',
          '.tl-timenav .tl-timemarker',
          '.tl-timenav .tl-timemarker-content-container'
        ];
        
        let correctMarkers = [];
        correctMarkerSelectors.forEach(selector => {
          const markers = document.querySelectorAll(selector);
          markers.forEach(marker => {
            if (!correctMarkers.includes(marker)) {
              correctMarkers.push(marker);
            }
          });
        });

        // Apply colors to correct markers
        correctMarkers.forEach((marker, index) => {
          // Get event data - try multiple approaches
          let eventData = null;
          
          if (window.timeline?.data?.events) {
            eventData = window.timeline.data.events[index];
          }
          
          // Fallback: cycle through event types if we can't match exactly
          if (!eventData) {
            const eventTypes = ['good', 'bad', 'neutral', 'good', 'bad', 'neutral', 'good'];
            const eventType = eventTypes[index % eventTypes.length];
            eventData = { event_type: eventType };
          }
          
          if (eventData && eventData.event_type) {
            const eventType = eventData.event_type;
            const color = getEventTypeColor(eventType);
            
            // Apply ultra-aggressive styling for the correct marker elements
            const markerStyles = {
              'background-color': color,
              'background': color,
              'border-color': color,
              'border': `3px solid ${color}`,
              'box-shadow': `0 0 15px ${color}80`,
              'opacity': '1',
              'visibility': 'visible',
              'z-index': '1000'
            };
            
            // Apply each style with setProperty and important flag
            Object.entries(markerStyles).forEach(([property, value]) => {
              marker.style.setProperty(property, value, 'important');
            });
            
            // Add classes for targeting
            marker.classList.add(`marker-${eventType}`, 'colored-marker');
            marker.setAttribute('data-event-type', eventType);
          }
        });

        // Target ALL possible marker selectors with more comprehensive approach
        const markerSelectors = [
          '.tl-timenav .tl-timegroup-marker',
          '.tl-timenav-marker',
          '.tl-timegroup-marker',
          '.tl-timenav .tl-timegroup .tl-timegroup-marker',
          '.tl-timenav-slider .tl-timegroup-marker',
          '.tl-timenav .tl-timegroup .tl-timegroup-marker-internal',
          '.tl-timenav .tl-timegroup .tl-timegroup-marker-content',
          '.tl-timenav .tl-timegroup .tl-timegroup-marker div'
        ];
        
        let allMarkers = [];
        markerSelectors.forEach(selector => {
          const markers = document.querySelectorAll(selector);
          markers.forEach(marker => {
            if (!allMarkers.includes(marker)) {
              allMarkers.push(marker);
            }
          });
        });

        // Apply colors to each marker based on event order
        allMarkers.forEach((marker, index) => {
          // Get event data - try multiple approaches
          let eventData = null;
          
          if (window.timeline?.data?.events) {
            eventData = window.timeline.data.events[index];
          }
          
          // Fallback: cycle through event types if we can't match exactly
          if (!eventData) {
            const eventTypes = ['good', 'bad', 'neutral', 'good', 'bad', 'neutral', 'good'];
            const eventType = eventTypes[index % eventTypes.length];
            eventData = { event_type: eventType };
          }
          
          if (eventData && eventData.event_type) {
            const eventType = eventData.event_type;
            const color = getEventTypeColor(eventType);
            
            // Apply ultra-aggressive styling with multiple methods
            const styles = {
              'background-color': color,
              'background': color,
              'border-color': color,
              'border': `4px solid ${color}`,
              'box-shadow': `0 0 15px ${color}80`,
              'transform': 'scale(1.4)',
              'opacity': '1',
              'visibility': 'visible',
              'z-index': '1000',
              'border-radius': '50%',
              'width': '20px',
              'height': '20px',
              'min-width': '20px',
              'min-height': '20px'
            };
            
            // Apply each style with setProperty and important flag
            Object.entries(styles).forEach(([property, value]) => {
              marker.style.setProperty(property, value, 'important');
            });
            
            // Add additional targeting methods
            marker.classList.add(`marker-${eventType}`, 'colored-marker');
            marker.setAttribute('data-event-type', eventType);
            marker.setAttribute('data-color', color);
            
            // Also style any child elements
            const children = marker.querySelectorAll('*');
            children.forEach(child => {
              Object.entries(styles).forEach(([property, value]) => {
                child.style.setProperty(property, value, 'important');
              });
              child.classList.add(`marker-${eventType}-child`);
            });
          }
        });

        // Alternative approach: style by position if we have events data
        if (window.timeline?.data?.events) {
          window.timeline.data.events.forEach((event, index) => {
            if (event.event_type) {
              const color = getEventTypeColor(event.event_type);
              
              // Try to find markers by various methods
              const possibleMarkers = [
                document.querySelector(`.tl-timegroup:nth-child(${index + 1}) .tl-timegroup-marker`),
                document.querySelector(`.tl-timenav .tl-timegroup:nth-of-type(${index + 1}) .tl-timegroup-marker`),
                document.querySelectorAll('.tl-timegroup-marker')[index]
              ];
              
              possibleMarkers.forEach(marker => {
                if (marker) {
                  marker.style.setProperty('background', color, 'important');
                  marker.style.setProperty('border', `4px solid ${color}`, 'important');
                  marker.style.setProperty('box-shadow', `0 0 15px ${color}80`, 'important');
                  marker.style.setProperty('transform', 'scale(1.4)', 'important');
                  marker.classList.add(`marker-${event.event_type}`);
                }
              });
            }
          });
        }

        // Style slide backgrounds and add classes with stronger colors
        const slides = document.querySelectorAll('.tl-slide');

        slides.forEach((slide, index) => {
          const eventData = window.timeline?.data?.events[index];
          if (eventData && eventData.event_type) {
            const eventType = eventData.event_type;

            // Add class for CSS targeting
            slide.classList.add(`tl-slide-${eventType}`);
            slide.setAttribute('data-event-type', eventType);

            // Apply stronger background styling
            const color = getEventTypeColor(eventType);
            slide.style.setProperty('background', `linear-gradient(135deg, ${color}30 0%, ${color}15 100%)`, 'important');
            slide.style.setProperty('border-left', `6px solid ${color}`, 'important');
            slide.style.setProperty('border', `2px solid ${color}50`, 'important');
            slide.style.setProperty('box-shadow', `0 4px 12px ${color}20`, 'important');

            // Style the headline with stronger colors
            const headline = slide.querySelector('.tl-headline');
            if (headline) {
              headline.style.setProperty('color', color, 'important');
              headline.style.setProperty('font-weight', 'bold', 'important');
              headline.style.setProperty('text-shadow', `0 1px 2px ${color}40`, 'important');
            }

            // Style the slide content
            const content = slide.querySelector('.tl-slide-content');
            if (content) {
              content.style.setProperty('border-left', `6px solid ${color}`, 'important');
              content.style.setProperty('background', `${color}08`, 'important');
            }
          }
        });

        // Add emotion indicators to slides
        slides.forEach((slide, index) => {
          const eventData = window.timeline?.data?.events[index];
          if (eventData && eventData.emotion) {
            const emotion = eventData.emotion;
            const emotionEmojis = {
              joy: '😄', pride: '🌟', gratitude: '🙏', anger: '😠', shame: '😳',
              self_deprecation: '😔', self_esteem: '💪', sadness: '😢', anxiety: '😰', neutral: '😐'
            };

            const emotionEmoji = emotionEmojis[emotion] || '😐';
            const headline = slide.querySelector('.tl-headline');

            if (headline && !headline.querySelector('.emotion-indicator')) {
              const indicator = document.createElement('span');
              indicator.className = 'emotion-indicator';
              indicator.textContent = ` ${emotionEmoji}`;
              indicator.style.fontSize = '1.2em';
              indicator.style.marginLeft = '8px';
              headline.appendChild(indicator);
            }
          }
        });

        // Add emotion indicators to slides
        slides.forEach((slide, index) => {
          const eventData = window.timeline?.data?.events[index];
          if (eventData && eventData.emotion) {
            const emotion = eventData.emotion;
            const emotionEmojis = {
              joy: '😄', pride: '🌟', gratitude: '🙏', anger: '😠', shame: '😳',
              self_deprecation: '😔', self_esteem: '💪', sadness: '😢', anxiety: '😰', neutral: '😐'
            };

            const emotionEmoji = emotionEmojis[emotion] || '😐';
            const headline = slide.querySelector('.tl-headline');

            if (headline && !headline.querySelector('.emotion-indicator')) {
              const indicator = document.createElement('span');
              indicator.className = 'emotion-indicator';
              indicator.textContent = ` ${emotionEmoji}`;
              indicator.style.fontSize = '1.2em';
              indicator.style.marginLeft = '8px';
              headline.appendChild(indicator);
            }
          }
        });

        // Add edit buttons to TimelineJS slides
        slides.forEach((slide, index) => {
          const eventData = window.timeline?.data?.events[index];
          if (eventData && eventData.id && !slide.querySelector('.timeline-edit-button')) {
            const editButton = document.createElement('button');
            editButton.className = 'timeline-edit-button';
            editButton.innerHTML = '✏️';
            editButton.title = 'Modifier cet événement';
            editButton.style.cssText = `
              position: absolute;
              top: 10px;
              right: 10px;
              background: var(--surface-color);
              border: 2px solid #e2e8f0;
              border-radius: 50%;
              width: 36px;
              height: 36px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              font-size: 16px;
              z-index: 1000;
              transition: all 0.2s ease;
              box-shadow: var(--shadow);
              opacity: 0.8;
            `;
            
            editButton.addEventListener('mouseenter', () => {
              editButton.style.background = 'white';
              editButton.style.transform = 'scale(1.15)';
              editButton.style.opacity = '1';
              editButton.style.boxShadow = 'var(--shadow-lg)';
              editButton.style.borderColor = 'var(--primary-color)';
            });
            
            editButton.addEventListener('mouseleave', () => {
              editButton.style.background = 'var(--surface-color)';
              editButton.style.transform = 'scale(1)';
              editButton.style.opacity = '0.8';
              editButton.style.boxShadow = 'var(--shadow-sm)';
              editButton.style.borderColor = 'var(--border-color)';
            });
            
            editButton.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              editEvent(eventData.id);
            });
            
            slide.style.position = 'relative';
            slide.appendChild(editButton);
          }
        });

        // Also add edit buttons with multiple timing attempts
        setTimeout(() => {
          const newSlides = document.querySelectorAll('.tl-slide');
          newSlides.forEach((slide, index) => {
            const eventData = window.timeline?.data?.events[index];
            if (eventData && eventData.id && !slide.querySelector('.timeline-edit-button')) {
              const editButton = document.createElement('button');
              editButton.className = 'timeline-edit-button';
              editButton.innerHTML = '✏️';
              editButton.title = 'Modifier cet événement';
              editButton.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                editEvent(eventData.id);
              };
              editButton.style.cssText = `
                position: absolute !important;
                top: 10px !important;
                right: 10px !important;
                background: var(--surface-color) !important;
                border: 2px solid var(--primary-color) !important;
                border-radius: 50% !important;
                width: 36px !important;
                height: 36px !important;
                cursor: pointer !important;
                font-size: 16px !important;
                z-index: 9999 !important;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
              `;
              slide.style.position = 'relative';
              slide.appendChild(editButton);
            }
          });
        }, 1500);

        // Inject custom CSS directly into the page for maximum override power
        const customCSS = `
          <style id="timeline-color-override">
            /* Ultra-aggressive TimelineJS marker styling using CORRECT classes */
            .tl-timemarker,
            .tl-timemarker-content-container,
            .tl-timenav .tl-timemarker,
            .tl-timenav .tl-timemarker-content-container {
              background: #ef4444 !important;
              background-color: #ef4444 !important;
              border: 4px solid #dc2626 !important;
              border-color: #dc2626 !important;
              box-shadow: 0 0 20px rgba(239, 68, 68, 0.8) !important;
              border-radius: 8px !important;
              opacity: 1 !important;
              z-index: 9999 !important;
            }
            
            /* Also try the old selectors just in case */
            .tl-timegroup-marker,
            .tl-timenav .tl-timegroup-marker,
            #timeline-embed .tl-timegroup-marker,
            .tl-timenav .tl-timegroup .tl-timegroup-marker {
              background: #ef4444 !important;
              background-color: #ef4444 !important;
              border: 4px solid #dc2626 !important;
              border-color: #dc2626 !important;
              box-shadow: 0 0 20px rgba(239, 68, 68, 0.8) !important;
              border-radius: 50% !important;
              width: 20px !important;
              height: 20px !important;
              transform: scale(1.5) !important;
              opacity: 1 !important;
              z-index: 9999 !important;
            }
            
            /* Override for good events */
            .marker-good,
            .tl-timemarker[data-event-type="good"],
            .tl-timemarker-content-container[data-event-type="good"],
            .tl-timegroup-marker[data-event-type="good"] {
              background: #10b981 !important;
              background-color: #10b981 !important;
              border-color: #059669 !important;
              box-shadow: 0 0 20px rgba(16, 185, 129, 0.8) !important;
            }
            
            /* Override for bad events */
            .marker-bad,
            .tl-timemarker[data-event-type="bad"],
            .tl-timemarker-content-container[data-event-type="bad"],
            .tl-timegroup-marker[data-event-type="bad"] {
              background: #ef4444 !important;
              background-color: #ef4444 !important;
              border-color: #dc2626 !important;
              box-shadow: 0 0 20px rgba(239, 68, 68, 0.8) !important;
            }
            
            /* Override for neutral events */
            .marker-neutral,
            .tl-timemarker[data-event-type="neutral"],
            .tl-timemarker-content-container[data-event-type="neutral"],
            .tl-timegroup-marker[data-event-type="neutral"] {
              background: #64748b !important;
              background-color: #64748b !important;
              border-color: #475569 !important;
              box-shadow: 0 0 20px rgba(100, 116, 139, 0.8) !important;
            }
          </style>
        `;
        
        // Remove existing override and add new one
        const existingOverride = document.getElementById('timeline-color-override');
        if (existingOverride) {
          existingOverride.remove();
        }
        document.head.insertAdjacentHTML('beforeend', customCSS);

      } catch (error) {
        // Ignore styling errors
      }
    }, delay);
  };

  // Apply styles with multiple delays to ensure they stick
  applyStylesWithDelay(100);
  applyStylesWithDelay(500);
  applyStylesWithDelay(1000);
  applyStylesWithDelay(2000);
}

// Function to add edit buttons to TimelineJS slides
function addEditButtonsToSlides() {
  const slides = document.querySelectorAll('.tl-slide');

  // Also try alternative selectors
  const alternativeSlides = document.querySelectorAll('#timeline-embed .tl-slide, .tl-storyslider .tl-slide');

  const slidesToProcess = slides.length > 0 ? slides : alternativeSlides;
  
  slidesToProcess.forEach((slide, index) => {
    const eventData = window.timeline?.data?.events[index];
    
    if (eventData && eventData.id && !slide.querySelector('.timeline-edit-button')) {
      
      const editButton = document.createElement('button');
      editButton.className = 'timeline-edit-button';
      editButton.innerHTML = '✏️';
      editButton.title = 'Modifier cet événement';
      editButton.setAttribute('data-event-id', eventData.id);
      
      editButton.style.cssText = `
        position: absolute !important;
        top: 15px !important;
        right: 15px !important;
        background: rgba(255, 255, 255, 0.95) !important;
        border: 2px solid #3b82f6 !important;
        border-radius: 50% !important;
        width: 40px !important;
        height: 40px !important;
        cursor: pointer !important;
        font-size: 18px !important;
        z-index: 9999 !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25) !important;
        transition: all 0.2s ease !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      `;
      
      editButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        editEvent(eventData.id);
      });
      
      editButton.addEventListener('mouseenter', (e) => {
        e.target.style.transform = 'scale(1.1)';
        e.target.style.borderColor = '#1d4ed8';
        e.target.style.background = 'white';
      });
      
      editButton.addEventListener('mouseleave', (e) => {
        e.target.style.transform = 'scale(1)';
        e.target.style.borderColor = '#3b82f6';
        e.target.style.background = 'rgba(255, 255, 255, 0.95)';
      });
      
      slide.style.position = 'relative';
      slide.appendChild(editButton);
    }
  });
}

// Load timeline on page load
loadTimeline();

// Events dropdown functionality
let allEvents = [];

// Function to populate events dropdown
function populateEventsDropdown(events) {
  allEvents = events || [];
  const dropdown = document.getElementById('eventSelect');
  
  // Clear existing options except the first one
  dropdown.innerHTML = '<option value="">-- Choisir un événement à modifier --</option>';
  
  if (allEvents.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Aucun événement disponible';
    option.disabled = true;
    dropdown.appendChild(option);
    return;
  }
  
  // Sort events by date (most recent first)
  const sortedEvents = [...allEvents].sort((a, b) => {
    const dateA = new Date(a.original_data?.start_year || 0, (a.original_data?.start_month || 1) - 1, a.original_data?.start_day || 1);
    const dateB = new Date(b.original_data?.start_year || 0, (b.original_data?.start_month || 1) - 1, b.original_data?.start_day || 1);
    return dateB - dateA;
  });
  
  sortedEvents.forEach(event => {
    if (event.id && event.text?.headline) {
      const option = document.createElement('option');
      option.value = event.id;
      
      // Create a descriptive option text without emojis
      const date = formatEventDate(event);
      const emotionName = (event.original_data?.emotion || 'neutral').replace('_', ' ');
      const eventType = event.original_data?.event_type || 'neutral';
      
      option.textContent = `${event.text.headline} (${date}) - ${eventType} - ${emotionName}`;
      option.setAttribute('data-event-id', event.id);
      
      dropdown.appendChild(option);
    }
  });
}

// Helper function to format event date
function formatEventDate(event) {
  const year = event.original_data?.start_year || event.start_date?.year;
  const month = event.original_data?.start_month || event.start_date?.month;
  const day = event.original_data?.start_day || event.start_date?.day;
  
  if (!year) return 'Date inconnue';
  
  let dateStr = year.toString();
  if (month) {
    dateStr += `-${String(month).padStart(2, '0')}`;
    if (day) {
      dateStr += `-${String(day).padStart(2, '0')}`;
    }
  }
  
  return dateStr;
}

// Helper function to get emotion emoji
function getEmotionEmoji(emotion) {
  const emotionEmojis = {
    joy: '😄', pride: '🌟', gratitude: '🙏', anger: '😠', shame: '😳',
    self_deprecation: '😔', self_esteem: '💪', sadness: '😢', anxiety: '😰', neutral: '😐'
  };
  return emotionEmojis[emotion] || '😐';
}

// Helper function to get event type indicator
function getEventTypeIndicator(eventType) {
  const indicators = {
    good: '✅',
    bad: '❌',
    neutral: '⚪'
  };
  return indicators[eventType] || '⚪';
}

// Function to show event preview
function showEventPreview(event) {
  const previewContainer = document.getElementById('eventPreview');
  const previewContent = document.querySelector('.event-preview-content');
  
  if (!event) {
    previewContainer.style.display = 'none';
    return;
  }
  
  const eventData = event.original_data || {};
  const date = formatEventDate(event);
  const emotion = getEmotionEmoji(eventData.emotion || 'neutral');
  const emotionName = (eventData.emotion || 'neutral').replace('_', ' ');
  const eventType = eventData.event_type || 'neutral';
  
  const previewHtml = `
    <div class="event-preview-item event-${eventType}">
      <h4 class="event-preview-title">${event.text?.headline || 'Sans titre'}</h4>
      <div class="event-preview-date">
        <span>📅 ${date}</span>
      </div>
      <div class="event-preview-description">
        ${event.text?.text || 'Aucune description'}
      </div>
      <div class="event-preview-meta">
        <div class="event-preview-meta-item">
          <span>Type:</span>
          <span>${getEventTypeIndicator(eventType)} ${eventType}</span>
        </div>
        <div class="event-preview-meta-item">
          <span>Émotion:</span>
          <span>${emotion} ${emotionName}</span>
        </div>
        ${eventData.group_name ? `
          <div class="event-preview-meta-item">
            <span>Catégorie:</span>
            <span>${eventData.group_name}</span>
          </div>
        ` : ''}
        ${eventData.media_url ? `
          <div class="event-preview-meta-item">
            <span>📎 Média</span>
          </div>
        ` : ''}
      </div>
    </div>
  `;
  
  previewContent.innerHTML = previewHtml;
  previewContainer.style.display = 'block';
}

// Function to handle dropdown selection
function handleEventSelection() {
  const dropdown = document.getElementById('eventSelect');
  const editButton = document.getElementById('editSelectedEvent');
  const deleteButton = document.getElementById('deleteSelectedEvent');
  
  const selectedEventId = dropdown.value;
  
  if (selectedEventId) {
    // Enable buttons
    editButton.disabled = false;
    deleteButton.disabled = false;
    
    // Find and show preview
    const selectedEvent = allEvents.find(event => event.id == selectedEventId);
    showEventPreview(selectedEvent);
  } else {
    // Disable buttons
    editButton.disabled = true;
    deleteButton.disabled = true;
    
    // Hide preview
    showEventPreview(null);
  }
}

// Function to handle edit selected event
function editSelectedEvent() {
  const dropdown = document.getElementById('eventSelect');
  const selectedEventId = dropdown.value;
  
  if (selectedEventId) {
    editEvent(parseInt(selectedEventId));
  }
}

// Function to handle delete selected event
async function deleteSelectedEvent() {
  const dropdown = document.getElementById('eventSelect');
  const selectedEventId = dropdown.value;
  
  if (!selectedEventId) return;
  
  const selectedEvent = allEvents.find(event => event.id == selectedEventId);
  const eventTitle = selectedEvent?.text?.headline || 'cet événement';
  
  if (!confirm(`Êtes-vous sûr de vouloir supprimer "${eventTitle}" ? Cette action est irréversible.`)) {
    return;
  }
  
  try {
    const response = await fetch(`/api/events/${selectedEventId}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (response.ok) {
      alert('✅ ' + result.message);
      
      // Reset dropdown selection
      dropdown.value = '';
      handleEventSelection();
      
      // Reload timeline to reflect changes
      setTimeout(() => loadTimeline(), 500);
    } else {
      alert('❌ ' + result.error);
    }
  } catch (error) {
    alert('❌ Erreur lors de la suppression de l\'événement');
  }
}

// Event listeners for dropdown functionality
document.addEventListener('DOMContentLoaded', () => {
  const dropdown = document.getElementById('eventSelect');
  const editButton = document.getElementById('editSelectedEvent');
  const deleteButton = document.getElementById('deleteSelectedEvent');
  
  if (dropdown) {
    dropdown.addEventListener('change', handleEventSelection);
  }
  
  if (editButton) {
    editButton.addEventListener('click', editSelectedEvent);
  }
  
  if (deleteButton) {
    deleteButton.addEventListener('click', deleteSelectedEvent);
  }
});

// Update loadTimeline function to also populate dropdown
// (This will be handled in the existing loadTimeline function)

// Add MutationObserver to detect when TimelineJS slides are rendered
function observeTimelineSlides() {
  const timelineContainer = document.getElementById('timeline-embed');
  if (!timelineContainer) return;

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        // Check if TimelineJS slides were added
        const slides = document.querySelectorAll('.tl-slide');
        if (slides.length > 0) {
          setTimeout(() => addEditButtonsToTimelineJS(), 500);
          setTimeout(() => addEditButtonsToTimelineJS(), 1500);
          setTimeout(() => addEditButtonsToTimelineJS(), 3000);
        }
      }
    });
  });

  observer.observe(timelineContainer, {
    childList: true,
    subtree: true
  });
}

// Function specifically for adding edit buttons to TimelineJS slides
function addEditButtonsToTimelineJS() {
  const slides = document.querySelectorAll('.tl-slide');

  slides.forEach((slide, index) => {
    // Skip if edit button already exists
    if (slide.querySelector('.timeline-edit-button')) {
      return;
    }

    const eventData = window.timeline?.data?.events[index];
    if (!eventData || !eventData.id) {
      return;
    }
    
    const editButton = document.createElement('button');
    editButton.className = 'timeline-edit-button';
    editButton.innerHTML = '✏️';
    editButton.title = 'Modifier cet événement';
    editButton.setAttribute('data-event-id', eventData.id);
    
    editButton.style.cssText = `
      position: absolute !important;
      top: 15px !important;
      right: 15px !important;
      background: rgba(255, 255, 255, 0.95) !important;
      border: 2px solid #3b82f6 !important;
      border-radius: 50% !important;
      width: 40px !important;
      height: 40px !important;
      cursor: pointer !important;
      font-size: 18px !important;
      z-index: 9999 !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25) !important;
      transition: all 0.2s ease !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      opacity: 0.8 !important;
    `;
    
    editButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      editEvent(eventData.id);
    });
    
    editButton.addEventListener('mouseenter', (e) => {
      e.target.style.transform = 'scale(1.1)';
      e.target.style.borderColor = '#1d4ed8';
      e.target.style.background = 'white';
      e.target.style.opacity = '1';
    });
    
    editButton.addEventListener('mouseleave', (e) => {
      e.target.style.transform = 'scale(1)';
      e.target.style.borderColor = '#3b82f6';
      e.target.style.background = 'rgba(255, 255, 255, 0.95)';
      e.target.style.opacity = '0.8';
    });
    
    // Find the content container to position the button correctly
    const contentContainer = slide.querySelector('.tl-slide-content-container') || slide;
    contentContainer.style.position = 'relative';
    contentContainer.appendChild(editButton);
  });
}

// Start observing for TimelineJS slides
observeTimelineSlides();

// Handle form submission
document.getElementById('eventForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Add loading state
  const submitButton = e.target.querySelector('.submit-button');
  const originalText = submitButton.querySelector('.button-text').textContent;
  submitButton.classList.add('loading');
  submitButton.querySelector('.button-text').textContent = 'Ajout de l\'Événement...';

  const formData = {
    headline: document.getElementById('headline').value,
    text_content: document.getElementById('text_content').value,
    start_year: parseInt(document.getElementById('start_year').value),
    start_month: document.getElementById('start_month').value ? parseInt(document.getElementById('start_month').value) : null,
    start_day: document.getElementById('start_day').value ? parseInt(document.getElementById('start_day').value) : null,
    group_name: document.getElementById('group_name').value || null,
    event_type: document.getElementById('event_type').value || 'neutral',
    emotion: document.getElementById('emotion').value || 'neutral'
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
      messageDiv.innerHTML = `<div class="message success">✅ ${result.message}</div>`;
      document.getElementById('eventForm').reset();
      // Reload timeline to show new event and refresh dropdown
      setTimeout(() => loadTimeline(), 500);
    } else {
      messageDiv.innerHTML = `<div class="message error">❌ ${result.error}</div>`;
    }
  } catch (error) {
    document.getElementById('message').innerHTML = '<div class="message error">❌ Erreur lors de l\'ajout de l\'événement. Veuillez réessayer.</div>';
  } finally {
    // Remove loading state
    submitButton.classList.remove('loading');
    submitButton.querySelector('.button-text').textContent = originalText;
  }
});

// Clear message when user starts typing
document.querySelectorAll('.form-input, .form-textarea').forEach(input => {
  input.addEventListener('input', () => {
    document.getElementById('message').innerHTML = '';
  });
});

// Edit functionality
let currentEditingEvent = null;

// Function to open edit modal
function editEvent(eventId) {
  currentEditingEvent = eventId;
  
  // Find the event data from the current timeline data
  if (window.timeline?.data?.events) {
    const event = window.timeline.data.events.find(e => e.id === eventId);
    if (event && event.original_data) {
      populateEditForm(event.original_data);
      openEditModal();
    } else {
      // Fallback: fetch event data from server
      fetchEventData(eventId);
    }
  } else {
    // Fallback: fetch event data from server
    fetchEventData(eventId);
  }
}

// Function to fetch event data from server
async function fetchEventData(eventId) {
  try {
    const response = await fetch(`/api/events/${eventId}`);
    if (response.ok) {
      const eventData = await response.json();
      populateEditForm(eventData);
      openEditModal();
    } else {
      alert('Erreur lors du chargement des données de l\'événement');
    }
  } catch (error) {
    alert('Erreur lors du chargement des données de l\'événement');
  }
}

// Function to populate edit form
function populateEditForm(eventData) {
  document.getElementById('edit_event_id').value = currentEditingEvent;
  document.getElementById('edit_headline').value = eventData.headline || '';
  document.getElementById('edit_text_content').value = eventData.text_content || '';
  document.getElementById('edit_start_year').value = eventData.start_year || '';
  document.getElementById('edit_start_month').value = eventData.start_month || '';
  document.getElementById('edit_start_day').value = eventData.start_day || '';
  document.getElementById('edit_media_url').value = eventData.media_url || '';
  document.getElementById('edit_media_caption').value = eventData.media_caption || '';
  document.getElementById('edit_group_name').value = eventData.group_name || '';
  document.getElementById('edit_event_type').value = eventData.event_type || 'neutral';
  document.getElementById('edit_emotion').value = eventData.emotion || 'neutral';
}

// Function to open edit modal
function openEditModal() {
  const modal = document.getElementById('editModal');
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

// Function to close edit modal
function closeEditModal() {
  const modal = document.getElementById('editModal');
  modal.classList.remove('show');
  document.body.style.overflow = '';
  currentEditingEvent = null;
}

// Function to delete event
async function deleteEvent() {
  if (!currentEditingEvent) return;
  
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/events/${currentEditingEvent}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (response.ok) {
      alert('✅ ' + result.message);
      closeEditModal();
      // Reload timeline to reflect changes and refresh dropdown
      setTimeout(() => loadTimeline(), 500);
    } else {
      alert('❌ ' + result.error);
    }
  } catch (error) {
    alert('❌ Erreur lors de la suppression de l\'événement');
  }
}

// Handle edit form submission
document.getElementById('editEventForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (!currentEditingEvent) return;
  
  // Add loading state
  const submitButton = e.target.querySelector('.modal-button-primary');
  const originalText = submitButton.querySelector('.button-text').textContent;
  submitButton.classList.add('loading');
  submitButton.querySelector('.button-text').textContent = 'Sauvegarde...';
  
  const formData = {
    headline: document.getElementById('edit_headline').value,
    text_content: document.getElementById('edit_text_content').value,
    start_year: parseInt(document.getElementById('edit_start_year').value),
    start_month: document.getElementById('edit_start_month').value ? parseInt(document.getElementById('edit_start_month').value) : null,
    start_day: document.getElementById('edit_start_day').value ? parseInt(document.getElementById('edit_start_day').value) : null,
    media_url: document.getElementById('edit_media_url').value || null,
    media_caption: document.getElementById('edit_media_caption').value || null,
    group_name: document.getElementById('edit_group_name').value || null,
    event_type: document.getElementById('edit_event_type').value || 'neutral',
    emotion: document.getElementById('edit_emotion').value || 'neutral'
  };
  
  try {
    const response = await fetch(`/api/events/${currentEditingEvent}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      alert('✅ ' + result.message);
      closeEditModal();
      // Reload timeline to reflect changes and refresh dropdown
      setTimeout(() => loadTimeline(), 500);
    } else {
      alert('❌ ' + result.error);
    }
  } catch (error) {
    alert('❌ Erreur lors de la mise à jour de l\'événement');
  } finally {
    // Remove loading state
    submitButton.classList.remove('loading');
    submitButton.querySelector('.button-text').textContent = originalText;
  }
});

// Close modal when clicking outside
document.getElementById('editModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('editModal')) {
    closeEditModal();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.getElementById('editModal').classList.contains('show')) {
    closeEditModal();
  }
});
