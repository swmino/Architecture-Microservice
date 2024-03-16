document.getElementById('motusForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent default form submission
  
  // Récupérer le mot saisi
  var motSaisi = document.getElementById('mot').value.toLowerCase();
  
  // Mot à deviner
  var motADeviner = "motus"; // Changez ceci pour modifier le mot à deviner
  
  // Vérifier chaque lettre du mot saisi
  for (var i = 0; i < motADeviner.length; i++) {
    var lettreADeviner = motADeviner[i];
    var lettreSaisie = motSaisi[i];
    
    // Vérifier si la lettre est correcte et à la bonne place
    if (lettreSaisie === lettreADeviner) {
      document.getElementById('mot').classList.add('green');
    }
    // Vérifier si la lettre est correcte mais à la mauvaise place
    else if (motADeviner.includes(lettreSaisie)) {
      document.getElementById('mot').classList.add('orange');
    }
  }
});