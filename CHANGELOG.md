# Changelog

All notable changes to the Timeline App project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-09-01

### Added
- **French Localization**: Complete French interface for all user-facing elements
  - Form labels, buttons, placeholders in French
  - Event type options (Positif, Négatif, Neutre)
  - French emotion labels (joie, tristesse, colère, etc.)
  - API responses in French while keeping backend in English
- **Color-Coded Timeline Markers**: Visual differentiation based on event type
  - Green markers for positive events (good)
  - Red markers for negative events (bad)
  - Gray markers for neutral events (neutral)
- **Enhanced Database Schema**: New fields for better event categorization
  - `event_type` field for color coding system
  - `emotion` field for additional context
- **Advanced CSS System**: Modern styling architecture
  - CSS custom properties for color management
  - Enhanced TimelineJS integration
  - Responsive design improvements
- **Dynamic Color Application**: JavaScript-driven styling system
  - Multiple marker detection approaches
  - Automatic color assignment based on event data
  - CSS injection for maximum override power

### Changed
- **Layout Restructure**: Improved user interface design
  - Timeline positioned at top taking 90% screen width
  - Compact form layout below timeline
  - Vertical flexbox arrangement replacing grid layout
- **Timeline Styling**: Enhanced visual appearance
  - Custom CSS targeting TimelineJS classes (.tl-timemarker, .tl-timemarker-content-container)
  - Aggressive override rules for consistent color display
  - Improved responsive behavior
- **Form Design**: Streamlined and more compact
  - Better spacing and alignment
  - French labels and placeholders
  - Enhanced usability

### Technical Improvements
- **CSS Architecture**: Modular design with CSS variables
- **JavaScript Optimization**: Enhanced DOM manipulation functions
- **Database Integration**: Improved data structure and validation
- **Performance**: Optimized color detection algorithms
- **Code Quality**: Better documentation and comments

### Fixed
- **Color Display Issues**: Resolved TimelineJS styling conflicts
  - Correct CSS class targeting
  - Proper override hierarchy
  - Consistent color application
- **Layout Problems**: Fixed responsive design issues
- **Language Consistency**: Proper French localization implementation

## [1.0.0] - 2025-08-30

### Added
- **Initial Release**: Basic timeline application
- **TimelineJS Integration**: Interactive timeline visualization
- **Express Server**: Node.js backend with API endpoints
- **SQLiteCloud Database**: Cloud-based data storage
- **Event Management**: Basic CRUD operations for timeline events
- **Management Script**: Server control and monitoring utilities
- **Responsive Design**: Mobile and desktop compatibility

### Core Features
- Interactive timeline with zoom and navigation
- Event creation form
- Real-time updates
- Media support for events
- Date formatting for historical events
- RESTful API endpoints

---

## Legend

- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Vulnerability fixes
