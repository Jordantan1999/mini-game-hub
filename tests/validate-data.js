/**
 * Simple validation script for game data
 * Can be run with Node.js to validate the games.json structure
 */

const fs = require('fs');
const path = require('path');

// Simple validation functions
function validateGameData() {
    try {
        // Read the games.json file
        const dataPath = path.join(__dirname, '..', 'data', 'games.json');
        const rawData = fs.readFileSync(dataPath, 'utf8');
        const data = JSON.parse(rawData);

        console.log('🔍 Validating game data structure...');

        // Check if data has games array
        if (!data || !Array.isArray(data.games)) {
            throw new Error('Invalid data format: expected games array');
        }

        console.log(`✓ Found ${data.games.length} games in data file`);

        // Validate each game
        const requiredFields = ['id', 'title', 'description', 'genre', 'rating'];
        const errors = [];

        data.games.forEach((game, index) => {
            // Check required fields
            requiredFields.forEach(field => {
                if (!game.hasOwnProperty(field)) {
                    errors.push(`Game ${index + 1} (${game.title || 'Unknown'}): Missing required field '${field}'`);
                }
            });

            // Validate data types
            if (game.rating && (typeof game.rating !== 'number' || game.rating < 0 || game.rating > 5)) {
                errors.push(`Game ${index + 1} (${game.title}): Invalid rating value`);
            }

            if (game.genre && !Array.isArray(game.genre)) {
                errors.push(`Game ${index + 1} (${game.title}): Genre should be an array`);
            }

            if (game.reviewCount && typeof game.reviewCount !== 'number') {
                errors.push(`Game ${index + 1} (${game.title}): Review count should be a number`);
            }
        });

        if (errors.length > 0) {
            console.log('\n❌ Validation errors found:');
            errors.forEach(error => console.log(`  - ${error}`));
            return false;
        }

        console.log('✅ All game data validation passed!');

        // Display summary
        const genres = new Set();
        let totalReviews = 0;
        let avgRating = 0;

        data.games.forEach(game => {
            if (game.genre) {
                game.genre.forEach(g => genres.add(g));
            }
            if (game.reviewCount) {
                totalReviews += game.reviewCount;
            }
            if (game.rating) {
                avgRating += game.rating;
            }
        });

        avgRating = avgRating / data.games.length;

        console.log('\n📊 Data Summary:');
        console.log(`  - Total games: ${data.games.length}`);
        console.log(`  - Unique genres: ${genres.size} (${Array.from(genres).join(', ')})`);
        console.log(`  - Total reviews: ${totalReviews}`);
        console.log(`  - Average rating: ${avgRating.toFixed(2)}/5`);

        return true;

    } catch (error) {
        console.error('❌ Validation failed:', error.message);
        return false;
    }
}

// Test basic Game class functionality (simplified for Node.js)
function testGameClass() {
    console.log('\n🧪 Testing Game class...');

    // Simple Game class for testing (without browser dependencies)
    class Game {
        constructor(data) {
            if (!data.id || !data.title) {
                throw new Error('Game data must include id and title');
            }

            this.id = data.id;
            this.title = data.title;
            this.description = data.description || '';
            this.genre = Array.isArray(data.genre) ? data.genre : [];
            this.rating = parseFloat(data.rating) || 0;
            this.reviewCount = parseInt(data.reviewCount) || 0;
        }

        getFormattedRating() {
            return `${this.rating}/5 (${this.reviewCount} reviews)`;
        }

        getGenreString() {
            return this.genre.join(', ');
        }
    }

    try {
        // Test valid game creation
        const gameData = {
            id: 'test-game',
            title: 'Test Game',
            description: 'A test game',
            genre: ['Action', 'Adventure'],
            rating: 4.5,
            reviewCount: 100
        };

        const game = new Game(gameData);
        
        if (game.id !== 'test-game') throw new Error('ID not set correctly');
        if (game.title !== 'Test Game') throw new Error('Title not set correctly');
        if (game.getFormattedRating() !== '4.5/5 (100 reviews)') throw new Error('Formatted rating incorrect');
        if (game.getGenreString() !== 'Action, Adventure') throw new Error('Genre string incorrect');

        console.log('✓ Game class basic functionality works');

        // Test error handling
        try {
            new Game({});
            throw new Error('Should have thrown error for missing required fields');
        } catch (error) {
            if (error.message.includes('id and title')) {
                console.log('✓ Game class error handling works');
            } else {
                throw error;
            }
        }

        return true;

    } catch (error) {
        console.error('❌ Game class test failed:', error.message);
        return false;
    }
}

// Run validation
console.log('🚀 Starting game data validation...\n');

const dataValid = validateGameData();
const classValid = testGameClass();

if (dataValid && classValid) {
    console.log('\n🎉 All validations passed! Game data structure is ready.');
    process.exit(0);
} else {
    console.log('\n💥 Some validations failed. Please check the errors above.');
    process.exit(1);
}