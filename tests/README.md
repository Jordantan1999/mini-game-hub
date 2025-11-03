# Game Data Manager Tests

This directory contains tests for the GameDataManager functionality.

## Test Files

### `validate-data.js`
A Node.js script that validates the game data structure and tests basic Game class functionality.

**Usage:**
```bash
node tests/validate-data.js
```

**What it tests:**
- JSON data structure validation
- Required fields presence
- Data type validation
- Basic Game class functionality
- Error handling

### `test-runner.html`
A browser-based test runner that provides comprehensive testing of the GameDataManager class.

**Usage:**
1. Open `test-runner.html` in a web browser
2. Tests will run automatically and display results

**What it tests:**
- Game class constructor and methods
- GameDataManager data loading
- Caching functionality with localStorage
- Error handling for network failures
- Search and filtering functionality
- Cache expiration logic

### `game-list-view-tests.html`
A comprehensive test suite for the GameListView component functionality.

**Usage:**
1. Open `game-list-view-tests.html` in a web browser
2. Tests will run automatically and display results

**What it tests:**
- GameListView component initialization
- Game card rendering and structure
- Pagination functionality and navigation
- Search and filtering integration
- Responsive behavior across breakpoints
- Accessibility features (ARIA labels, keyboard navigation)
- Star rating display
- Empty state and error handling
- URL-based pagination support

### `game-detail-view-tests.html`
A comprehensive test suite for the GameDetailView component functionality.

**Usage:**
1. Open `game-detail-view-tests.html` in a web browser
2. Tests will run automatically and display results

**What it tests:**
- GameDetailView component initialization and game loading
- Game detail rendering with comprehensive information display
- Screenshots gallery with navigation and thumbnail functionality
- System requirements display and formatting
- External links handling with security attributes
- Social sharing functionality for multiple platforms
- Copy link functionality with clipboard API and fallback
- Navigation between game detail and list views
- Accessibility features and semantic HTML structure
- SEO metadata updates for individual game pages
- Error handling for missing games and network failures
- Responsive behavior and mobile compatibility

## Test Coverage

The tests cover:
- ✅ Data structure validation
- ✅ Game object creation and validation
- ✅ Data loading and caching
- ✅ Error handling
- ✅ Search functionality
- ✅ Cache management (TTL, expiration)
- ✅ localStorage integration
- ✅ GameListView component functionality
- ✅ Game card rendering and layout
- ✅ Pagination system
- ✅ Responsive grid behavior
- ✅ Accessibility compliance
- ✅ User interaction handling
- ✅ GameDetailView component functionality
- ✅ Game detail rendering and navigation
- ✅ Screenshots gallery with navigation
- ✅ External links and social sharing
- ✅ SEO metadata management
- ✅ Copy link functionality with fallbacks
- ✅ Error states and edge cases

## Running Tests

### Command Line (Node.js)
```bash
# Validate data structure and basic functionality
node tests/validate-data.js
```

### Browser Testing
1. Start a local server (optional, for CORS if needed):
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   ```

2. Open test files in your browser:
   - `tests/test-runner.html` - GameDataManager tests
   - `tests/game-list-view-tests.html` - GameListView component tests
   - `tests/game-detail-view-tests.html` - GameDetailView component tests
3. View test results in the browser

## Test Results

All tests should pass, indicating:
- Game data is properly structured
- GameDataManager can load and cache data
- Error handling works correctly
- Search and filtering functions properly
- Cache management operates as expected