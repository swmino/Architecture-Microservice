const express = require('express');
const redis = require('redis');
const session = require('express-session');
const bodyParser = require('body-parser');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');


const app = express();

app.use(bodyParser.json());
app.use(express.static('static'));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Autoriser toutes les sources (à adapter selon vos besoins)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Autoriser les méthodes HTTP spécifiées
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Autoriser les en-têtes spécifiés
    next();
});


const client = redis.createClient({
    port: 6380 
});

// Fonction pour se connecter à Redis
const connectToRedis = async () => {
    try {
        await client.connect();
        console.log('Connected to Redis');
    } catch (error) {
        console.error('Failed to connect to Redis:', error.message);
    }
};

connectToRedis();

app.use(bodyParser.urlencoded({ extended: true }));




app.get('/authorize', (req, res) => {
    console.log("on est dans le authorize")
    const { clientid, scope, redirect_uri } = req.query;
    if (!clientid || clientid !== 'motusapp' || !scope || !redirect_uri) {
        return res.status(400).json({ error: 'Invalid parameters' });
    }

    // Construction du chemin absolu vers le fichier login.html
    const loginFilePath = path.join(__dirname, 'static', 'login.html');
    
    // Lecture du contenu du fichier login.html
    fs.readFile(loginFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier login.html :', err);
            return res.status(500).send('Erreur lors de la lecture du fichier login.html');
        }
        // Remplacer le placeholder {redirect_uri} par la valeur de redirect_uri dans le contenu HTML
        const modifiedData = data.replace(/\$\{redirect_uri\}/g, redirect_uri); // Envoyer le contenu du fichier login.html modifié dans la réponse
        res.send(modifiedData);
    });
});




// Vérification dans la bdd auth que la combinaison username/password existe
app.post('/login', async (req, res) => {
    console.log("On est dans le login")
    const { username, password, redirect_uri } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const result = await client.get(username);
        if (result) {
            if (result === password) {
                // Génération d'un code
                const code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                const setUrl = `http://localhost:3002/set/${code}/${username}`;
                await axios.get(setUrl);
                res.redirect(`${redirect_uri}?code=${code}`);
            } else {
                res.status(401).send('Mot de passe introuvable');
            }
        } else {
            res.status(401).send('Nom d\'utilisateur introuvable');
        }
    } catch (err) {
        res.status(500).send('Erreur lors de la récupération du nom d\'utilisateur');
    }

});

// génération d'un jwt
app.get('/token', async (req, res) => {
    console.log("On est dans la partie creation du token")

    const code = req.query.code;
    if (!code) {
        return res.status(400).json({ error: 'Missing code' });
    }
    try {
        const result = await client.get(code);
        if (result) {
            // Générer le jeton d'identité (id_token) avec les informations nécessaires
            const id_token = jwt.sign({ result }, 'secret-key');

            // Envoyer le jeton d'identité dans la réponse
            res.json({ id_token });
        } else {
            res.status(401).send('jeton incorrect');
        }
    } catch (err) {
        res.status(500).send('Erreur lors de la récupération du jeton');
    }
});

// page d'inscription
app.get('/signin_page', (req, res) => {
    console.log("On renvoie vers la signin page pour s'enregistrer")

    res.sendFile(path.join(__dirname, 'static', 'signin.html'));
});

// traitement de l'inscription
app.post('/signup', async (req, res) => {
    console.log("Traitement de l'inscription")

    const { username, password, confirm_password } = req.body;

    console.log(req.body)
    // Vérifier si les mots de passe correspondent
    if (password !== confirm_password) {
        return res.status(400).send('Les mots de passe ne correspondent pas');
    }

    try {

        // Enregistrer l'utilisateur dans le service d'authentification
        await axios.get(`http://localhost:3002/set/${username}/${password}`);

        // Rediriger l'utilisateur vers la page d'accueil après l'enregistrement réussi
        res.redirect(`http://localhost:3000`);
    } catch (error) {
        res.status(500).send('Erreur lors de l\'enregistrement de l\'utilisateur');
    }
});


// Partie pour la récupération et l'enregistrement dans la base de données Redis

const setKeyInRedis = async (key, value) => {
    console.log("set pour bdd utilisateur")
    try {
        await client.set(key, value);
        console.log(`User ${key} set successfully in Redis`);
        let value_new = await client.get(key);
        console.log("VERIFICATION :", value_new)


    } catch (error) {
        console.error(`Failed to set key ${key} in Redis:`, error.message);
    }
};

const getKeyFromRedis = async (username) => {
    console.log("get pour bdd utiliasteur")
    try {
        let value = await client.get(username);
        console.log(`Password for ${username} from Redis:`, value);
        return value;
    } catch (error) {
        console.error(`Failed to get value for key ${playerName} from Redis:`, error.message);
        throw error; // Rejeter l'erreur pour la gérer en dehors de la fonction si nécessaire
    }
};

// Ajout d'un nouvelle utilisateur dans la bdd
app.get('/set/:key/:value', async (req, res) => {
    console.log("je rentre dans le set")
    const { key, value } = req.params;
    try {
        const value = await setKeyInRedis(key,value);
        // Envoyer la valeur récupérée au client
        res.status(200).send(value);
    } catch (error) {
        // En cas d'erreur, envoyer une réponse d'erreur au client
        res.status(500).send('Erreur lors de ajout de lutilisateur dans la bdd');
    }
});


// récupérer la valeur d'une clé
app.get('/get/:key', async (req, res) => {
    const { key } = req.params; 
    try {
        const value = await getKeyFromRedis(key);
        // Envoyer la valeur récupérée au client
        res.status(200).send(value);
    } catch (error) {
        // En cas d'erreur, envoyer une réponse d'erreur au client
        res.status(500).send('Erreur lors de la récupération du password');
    }
});




const port = process.env.PORT || 3000 

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port} \n`);
})