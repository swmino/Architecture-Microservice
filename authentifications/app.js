const redis = require('redis');
const express = require('express');
const app = express();
const cors = require('cors');
const crypto = require('crypto');
const port = process.env.PORT || 3000;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const session = require('express-session');
const jwt = require('jsonwebtoken');

const client = redis.createClient();

app.use(express.json());
client.on('error', err => console.log('Redis Client Error', err));
app.use(cors());

app.set('connexions', path.join(__dirname, 'connexions'));

app.set('trust proxy', 1);

app.use(session({
    secret: 'Mutos',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.get('/authorize', async (req, res) => {
    const client_id = req.query.client_id;
    const scope = req.query.scope;
    const redirect_uri = req.query.redirect_uri;

    if (!client_id || !scope || !redirect_uri) {
        res.sendFile(path.join(__dirname, 'connexions', 'erreur.html'));
    }

    req.session.client_id = client_id;
    req.session.scope = scope;
    req.session.redirect_uri = redirect_uri;
    await req.session.save();
    res.sendFile(path.join(__dirname, 'connexions', 'login.html'));
});

app.get('/login', async (req, res) => {
    res.sendFile(path.join(__dirname, 'connexions', 'login.html'));
});

app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, 'connexions', 'signin.html'));
});

app.get('/authorize_verif', async (req, res) => {
    const email = req.query.email;
    const password = req.query.password;
    try {
        const exist = await client.get(email);

        if (exist === null) {
            res.send(JSON.stringify({ state: 'error', message: ' Email incorrect' }));
        } else {
            const hash = crypto.createHash("sha256").update(password).digest("hex");
            if (exist === hash) {
                const code = uuidv4();
                let redirect_uri = req.session.redirect_uri + `?code=${code}`;
                await client.set(code, JSON.stringify({ email: email }));
                res.redirect(redirect_uri);
            } else {
                res.sendFile(path.join(__dirname, 'connexions', 'erreur.html'));
            }
        }
    } catch (error) {
        res.sendFile(path.join(__dirname, 'connexions', 'erreur.html'));
    }
});

app.get('/token', async (req, res) => {
    const code = req.query.code;
    if (!code) {
        res.sendFile(path.join(__dirname, 'connexions', 'erreur.html'));
    }

    const data = await client.get(code);

    if (!data) {
        res.sendFile(path.join(__dirname, 'connexions', 'erreur.html'));
    }

    const token = jwt.sign(JSON.parse(data), "okokokokok");

    res.send(token);
});

app.get('/signin_verif', async (req, res) => {
    const email = req.query.email;
    const password = req.query.password;
    const password2 = req.query.password2;
    if (password !== password2) {
        res.sendFile(path.join(__dirname, 'connexions', 'erreur.html'));
    }

    try {
        const exist = await client.get(email);

        if (exist !== null) {
            res.sendFile(path.join(__dirname, 'connexions', 'erreur.html'));
        } else {
            const hash = crypto.createHash("sha256").update(password).digest("hex");
            try {
                await client.set(email, hash);
                res.redirect(`/authorize?client_id=${req.session.client_id}&scope=${req.session.scope}&redirect_uri=${encodeURIComponent(req.session.redirect_uri)}`);
            } catch (error) {
                res.sendFile(path.join(__dirname, 'connexions', 'erreur.html'));
            }
        }
    } catch (error) {
        console.log(error);
        res.sendFile(path.join(__dirname, 'connexions', 'erreur.html'));
    }
});

app.get('/session', (req, res) => {
    res.send(req.session);
});

app.listen(port, async () => {
    await client.connect();
});
