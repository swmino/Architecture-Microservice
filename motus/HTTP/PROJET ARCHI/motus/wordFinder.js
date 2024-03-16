const express = require('express');
const fs = require('fs');
const crypto = require('crypto');

const app = express();

// Serve static files from the 'public' folder
app.use(express.static('static'));

// Read the word list from the text file and store it in an array variable
const wordList = fs.readFileSync('data/liste_francais.txt', 'utf-8').split('\n').map(word => word.trim());

// Generate a deterministic random number based on the current date
function generateRandomNumber() {
    const date = new Date().toISOString().slice(0, 10); // Get current date in YYYY-MM-DD format
    const hash = crypto.createHash('sha256').update(date).digest('hex'); // Generate SHA-256 hash
    const randomSeed = parseInt(hash.slice(0, 16), 16); // Extract the first 16 characters and convert to integer
    return randomSeed % wordList.length; // Modulo operation to get a number within the range of wordList length
}

// Get a random word based on the generated random number
function getRandomWord() {
    const randomNumber = generateRandomNumber();
    return wordList[randomNumber];
}

// API endpoint to return a random word
app.get('/word', (req, res) => {
    const randomWord = getRandomWord();
    res.send(randomWord);
});

// Ignore requests for favicon.ico
app.get('/favicon.ico', (req, res) => res.status(204));

// Start the server
const port = process.env.PORT || 5000 
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port} \n`);
});
