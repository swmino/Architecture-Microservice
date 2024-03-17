const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const os = require('os');
const path = require('path');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const session = require('express-session');

const app = express();

app.use(express.static('static'));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Autoriser toutes les sources (à adapter selon vos besoins)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Autoriser les méthodes HTTP spécifiées
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Autoriser les en-têtes spécifiés
  next();
});

/*
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'secret-key' // pour signer cookie de connexion
}));



function Logged(req, res, next) {


    if (!req.session.user && req.path !== '/handleAuthorizationResponse') { // pas de session utilisateur
      // Redirection vers le serveur d'authentification
        const authentOpenId = process.env.AUTHENT_OPENID || 'http://localhost:3002';
        const redirectUri = encodeURIComponent('http://localhost:3000/handleAuthorizationResponse');
        const redirectUrl = `${authentOpenId}/authorize?clientid=motusapp&scope=openid&redirect_uri=${redirectUri}`;
        return res.redirect(redirectUrl);
    }
    next();
}

app.use(Logged);

// Route handleAuthorizationResponse qui permet la déclaration d'un utilisateur (aprés succes de l'authentification)
app.get('/handleAuthorizationResponse', (req, res) => {

    const code = req.query.code;

    if (!code) {
        return res.status(400).send('Missing authorization code');
    }

    // jeton  à décoder pour définir l'utilisateur de la session 
    axios.get(`http://localhost:3002/token?code=${code}`)
        .then(response => {
            const data = response.data;
            const decoded = jwt.verify(data.id_token, 'secret-key');    // code est dans la bdd d'authentification ou non

            const username = decoded.result;
            req.session.user = username;
            res.redirect('http://localhost:3000');
        
        })
        .catch(error => {
            console.error('Erreur lors de la requête Axios :', error); // Ajoutez ce log pour afficher l'erreur
            res.status(500).send('Erreur echange de code pour le token');
        });
});
*/






const wordList = fs.readFileSync('data/liste_francais.txt', 'utf-8').split('\n').map(word => word.trim());

function generateRandomNumber() {
    const date = new Date().toISOString().slice(0, 10); 
    const hash = crypto.createHash('sha256').update(date).digest('hex'); 
    const randomSeed = parseInt(hash.slice(0, 16), 16); 
    return randomSeed % wordList.length; 
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


// Start the server
const port = process.env.PORT || 3000 
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port} \n`);
});
