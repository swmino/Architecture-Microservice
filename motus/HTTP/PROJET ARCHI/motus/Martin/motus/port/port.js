const os = require('os');

// Obtient le nom de l'OS de la machine
const osName = os.platform();

// Port sur lequel l'application écoute
const port = 5000; // Mettez ici le port de votre application

// Phrase finale
const message = `MOTUS APP working on ${osName} port ${port}`;

console.log(message);
