// COTE SERVEUR

const express = require('express'); // pour crée appli web
const bodyParser = require('body-parser'); // Pour traiter les données json
const redis = require('redis'); // pour redis

const app = express();
const client = redis.createClient();

app.use(bodyParser.json());

// Route post pour enregistrer le score d'un joueur
app.post('/setscore', (req, res) => { 
    const { playerName, word, correctLetters, incorrectLetters } = req.body; // On recupere ça quand une route post est lancé 

    // Calcul du score
    const score = (correctLetters.length * 10) - (incorrectLetters.length * 5);

    // Enregistrer le score du joueur dans la base de données Redis
    client.set(playerName, score);

    res.send('Score enregistré avec succès.');
});

// Route pour récupérer le score d'un joueur et lui afficher
app.get('/getscore', (req, res) => {
    const playerName = req.query.playerName;

    // Récupérer le score du joueur depuis la base de données Redis
    client.get(playerName, (err, score) => {
        if (err) {
            res.status(500).send('Erreur lors de la récupération du score.');
        } else if (score === null) {
            res.status(404).send('Score introuvable pour ce joueur.');
        } else {
            res.send(`Le score de ${playerName} est ${score}.`);
        }
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
