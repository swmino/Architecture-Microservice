// COTE CLIENT



// Fonction pour effacer le contenu de l'input de texte
function clearInput() {
  document.getElementById('mot').value = '';
}

// Sélectionner le formulaire
const motusForm = document.getElementById('motusForm');

// Sélectionner la div de résultat
const resDiv = document.querySelector('.res');
// Sélectionner la div du message
const messageDiv = document.querySelector('.message');

// Écouter l'événement de soumission du formulaire
motusForm.addEventListener('submit', function(event) {
    // Empêcher le comportement par défaut du formulaire
    event.preventDefault();

    // Récupérer la valeur de l'input texte
    const motInput = document.getElementById('mot');
    const motValeur = motInput.value.toLowerCase(); // Convertir en minuscules pour la comparaison

    // Effectuer une requête AJAX pour récupérer le contenu de la page "/word"
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/word', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            // Récupérer le mot de la réponse et le convertir en minuscules pour la comparaison
            const motPageWord = xhr.responseText.trim().toLowerCase();
 
            // Initialiser la chaîne de résultats
            let resultat = '';

            // Parcourir chaque lettre du mot entré par l'utilisateur
            for (let i = 0; i < motValeur.length; i++) {
                const lettre = motValeur[i];
                const indexDansMot = motPageWord.indexOf(lettre);

                if (indexDansMot === -1) {
                    // La lettre n'est pas du tout présente
                    resultat += `<span class="incorrect">${lettre}</span>`;
                } else if (indexDansMot === i) {
                    // La lettre est présente et se trouve à la bonne place
                    resultat += `<span class="correct">${lettre}</span>`;
                } else {
                    // La lettre est présente mais ne se trouve pas à la bonne place
                    resultat += `<span class="partial">${lettre}</span>`;
                }
            }

            // Vérifier si le mot est correct
            const estCorrect = motValeur === motPageWord;

            // Si le mot est correct, afficher le message de félicitations
            if (estCorrect) {
                // Cacher le formulaire
                motusForm.style.display = 'none';
                // Afficher le message de félicitations avec le mot correct dans la div du message
                messageDiv.textContent = "Félicitations, le mot était " + motPageWord;
            } else {
                // Afficher le résultat dans la div de résultat
                resDiv.innerHTML += "<br>" + resultat;
            }
        } else {
            console.error('La requête vers /word a échoué.');
        }
    };
    xhr.send();
});

// Fonction pour enregistrer le score du joueur
function setScore() {
    // Récupérer le nom du joueur (remplacez playerName par la méthode appropriée pour obtenir le nom du joueur)
    const playerName = document.getElementById('playerName').value;

    // Créer un objet avec les données du score
    const scoreData = {
        playerName: playerName,
        // Autres données du score à envoyer
    };

    // Effectuer une requête AJAX pour enregistrer le score
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/setscore', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log('Score enregistré avec succès.');
        } else {
            console.error('Erreur lors de l\'enregistrement du score.');
        }
    };
    xhr.send(JSON.stringify(scoreData));
}

// Fonction pour récupérer le score d'un joueur
function getScore(playerName) {
    // Effectuer une requête AJAX pour récupérer le score du joueur
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/getscore?playerName=${playerName}`, true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            const score = xhr.responseText;
            console.log(`Le score de ${playerName} est ${score}.`);
        } else {
            console.error('Erreur lors de la récupération du score.');
        }
    };
    xhr.send();
}