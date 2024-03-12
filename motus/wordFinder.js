const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const os = require('os');

const app = express();

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

// Trouve un mot aléatoire à partir d'un nombre
function getRandomWord() {
    const randomNumber = generateRandomNumber();
    return wordList[randomNumber];
}

// Affiche le mot aléatoire choisi
app.get('/word', (req, res) => {
    const randomWord = getRandomWord();
    res.send(randomWord);
});

// Obtient le nom de l'OS de la machine
const osName = os.platform();

// Définition de la route pour "/port"
app.get('/port', (req, res) => {
  const message = `MOTUS APP working on ${osName} port ${port}`;
  res.send(message);
});

// Healthcheck
app.on('request', (req, res) => {
    if (req.url === '/healthcheck' && req.method === 'GET') {
      // Répondre avec un code de statut HTTP 200
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('OK');
    }
  });

// Ignore requests for favicon.ico
app.get('/favicon.ico', (req, res) => res.status(204));

// Start the server
const port = process.env.PORT || 3000 
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port} \n`);
});
