const express = require('express');
const bodyParser = require('body-parser');
const redis = require('redis');
const app = express();
app.use(bodyParser.json());
app.use(express.static('static'));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Autoriser toutes les sources (à adapter selon vos besoins)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Autoriser les méthodes HTTP spécifiées
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Autoriser les en-têtes spécifiés
    next();
});


// Créer un client Redis
const client = redis.createClient();

// Fonction pour se connecter à Redis, port 6379 par défault
const connectToRedis = async () => {
    try {
        await client.connect();
        console.log('Connected to Redis');
    } catch (error) {
        console.error('Failed to connect to Redis:', error.message);
    }
};

connectToRedis();

const setKeyInRedis = async (key, value) => {
    try {
        await client.set(key, value);
        console.log(`Key ${key} set successfully in Redis`);
        let value_new = await client.get(key);
        console.log("VERIFICATION :", value_new)


    } catch (error) {
        console.error(`Failed to set key ${key} in Redis:`, error.message);
    }
};

const getKeyFromRedis = async (playerName) => {
    try {
        let value = await client.get(playerName);
        if (value === null) {
            // Si la clé n'existe pas, initialiser avec des valeurs par défaut
            console.log(`La clé ${playerName} n'existe pas dans Redis. Initialisation avec des valeurs par défaut.`);
            const defaultValue = { totalWordsFound: 0, totalAttempts: 0, averageAttemptsPerWord: 0 };
            await setKeyInRedis(playerName, JSON.stringify(defaultValue));
            value = JSON.stringify(defaultValue);
        }
        console.log(`Value for key ${playerName} from Redis:`, value);
        return value;
    } catch (error) {
        console.error(`Failed to get value for key ${playerName} from Redis:`, error.message);
        throw error; // Rejeter l'erreur pour la gérer en dehors de la fonction si nécessaire
    }
};




app.post('/setscore', async (req, res) => {
    console.log(req.body);
    const { playerName, attemptsToFind } = req.body;


    try {
        let playerStats = await getKeyFromRedis(playerName);
        let stats = playerStats ? JSON.parse(playerStats) : { totalWordsFound: 0, totalAttempts: 0, averageAttemptsPerWord: 0 };

        stats.totalWordsFound++;
        stats.totalAttempts += attemptsToFind;
        stats.averageAttemptsPerWord = stats.totalAttempts / (stats.totalWordsFound || 1);

        console.log("Statistiques mises à jour :", stats);

        await setKeyInRedis(playerName, JSON.stringify(stats));
        
        res.send('Statistiques mises à jour avec succès.');
    } catch (error) {
        console.error('Erreur lors de la mise à jour des statistiques du joueur:', error);
        res.status(500).send('Erreur lors de la mise à jour des statistiques du joueur.');
    }
});


app.get('/getscore', async (req, res) => {

    const playerName = req.query.playerName;
    console.log("LE PLAYERNAME ENVOYE DANS DANS GET SCORE")
    console.log(playerName)

    try {
        const playerStats = await getKeyFromRedis(playerName);

        if (!playerStats) {
            res.status(404).send('Statistiques introuvables pour ce joueur que vous essayer de get.');
            return;
        }

        if (playerStats === null) {
            res.status(404).send(`Statistiques introuvables pour le joueur ${playerName}.`);
            return;
        }
        console.log("LES STATS:", playerStats)

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

app.get('/motus', async (req,res) => {
    res.sendFile(__dirname + '/index.html')
});





const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});