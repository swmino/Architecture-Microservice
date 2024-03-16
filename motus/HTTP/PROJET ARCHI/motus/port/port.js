const os = require('os');

// Obtient le nom de l'OS de la machine
const osName = os.platform();

const port = 5000; 

const message = `MOTUS APP working on ${osName} port ${port}`;

console.log(message);
