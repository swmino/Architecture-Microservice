const express = require('express');
const fs = require('fs');

const app = express();

const words = fs.readFileSync('data/liste_francais_utf8.txt', 'utf-8').split('\n');
app.get('/word', (req, res) => {
  const word = words[126]; 
  res.send(word);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
