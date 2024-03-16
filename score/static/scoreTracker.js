const express = require('express');
const bodyParser = require('body-parser');
const redis = require('redis');
const app = express();
app.use(bodyParser.json());
app.use(express.static('static'));


const client = redis.createClient()


client.on('error', err => console.log('Redis Client Error', err));
client.on('connect', () => {
    console.log('Redis client connected');
});






console.log("Je suis dans scoreTracker");

app.post('/setscore', async (req, res) => { 
    console.log("on est dans le set score du  scoretracker")

    const { playerName, score } = req.body;

    await client.get('playerStats', playerName, (err, playerStats) => {
        if (err) {
            console.error('Erreur lors de la récupération des statistiques du joueur:', err);
            res.status(500).send('Erreur lors de la récupération des statistiques du joueur.');
            return;
        }

        let stats = JSON.parse(playerStats) || { totalWordsFound: 0, totalAttempts: 0 }; // Convertir en JS

        stats.totalWordsFound++;
        stats.totalAttempts += score;
        stats.averageAttemptsPerWord = stats.totalAttempts / stats.totalWordsFound;
        console.log("on va save wsh")

        // Enregistrer les statistiques mises à jour dans Redis
        client.set('playerStats', playerName, JSON.stringify(stats));

        res.send('Statistiques mises à jour avec succès.');
    });
});

app.get('/getscore', async (req, res) => {
    console.log("on est dans le get score du scoretracker");

    const playerName = req.query.playerName;
    console.log(playerName)

    try {
        const playerStats = await new Promise((resolve, reject) => {
            console.log("on est dans la promesse");
            client.get('playerStats', playerName, (err, playerStats) => {
                console.log("on est dans le get de playerstats");

                if (err) {
                    reject(err);
                } else {
                    resolve(playerStats);
                }
            });
        });

        if (!playerStats) {
            res.status(404).send('Statistiques introuvables pour ce joueur.');
            return;
        }

        const stats = JSON.parse(playerStats);
        res.json(stats);
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).send('Erreur lors de la récupération des statistiques.');
    }
});


app.get('/score', async (req,res) => {
    res.sendFile(__dirname + '/score.html')
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
