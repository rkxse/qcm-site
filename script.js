let currentQuiz = null;
let currentQuestion = 0;
let score = 0;

// Sélecteurs
const matieresDiv = document.getElementById("matieres");
const themesDiv = document.getElementById("themes");
const quizDiv = document.getElementById("quiz");
const questionContainer = document.getElementById("question-container");
const optionsContainer = document.getElementById("options-container");
const nextBtn = document.getElementById("next-btn");
const resultatDiv = document.getElementById("resultat");

// Fonction pour mélanger un tableau
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Charger la liste des matières
function loadMatieres() {
  // Ici tu listes tes matières disponibles (ajoute selon tes besoins)
  const matieres = ["anglais", "japonais"];
// 📌 Les thèmes disponibles (liés aux fichiers JSON dans /data/)
const themes = {
  anglais: ["couldhave"],
  japonais: ["hiragana"]
};

  matieresDiv.innerHTML = "<h2>Choisis une matière :</h2>";
  matieres.forEach(matiere => {
    let btn = document.createElement("button");
    btn.textContent = matiere.charAt(0).toUpperCase() + matiere.slice(1);
    btn.onclick = () => loadThemes(matiere);
    matieresDiv.appendChild(btn);
  });
}

// Charger les thèmes d’une matière
function loadThemes(matiere) {
  matieresDiv.classList.add("hidden");
  themesDiv.classList.remove("hidden");

  // Liste des thèmes par matière (ajoute ici ce que tu veux)
  const themes = {
    anglais: ["couldhave"],
    japonais: ["hiragana"]
  };

  themesDiv.innerHTML = "<h2>Choisis un thème :</h2>";
  themes[matiere].forEach(theme => {
    fetch(`data/${matiere}/${theme}.json`)
      .then(res => res.json())
      .then(data => {
        let btn = document.createElement("button");
        btn.textContent = data.title; // utiliser le titre du JSON
        btn.onclick = () => startQuiz(matiere, theme);
        themesDiv.appendChild(btn);
      });
  });
}

// Démarrer un quiz
function startQuiz(matiere, theme) {
  themesDiv.classList.add("hidden");
  quizDiv.classList.remove("hidden");

  fetch(`data/${matiere}/${theme}.json`)
    .then(response => response.json())
    .then(data => {
      // Mélanger les questions
      data.questions = shuffleArray(data.questions);

      currentQuiz = data;
      currentQuestion = 0;
      score = 0;
      afficherQuestion();
    });
}

// Afficher une question
function afficherQuestion() {
  optionsContainer.innerHTML = "";
  let q = currentQuiz.questions[currentQuestion];

  questionContainer.textContent = q.question;

  // Mélanger les options
  let options = [...q.options];
  let correctIndex = q.reponse;
  let correctAnswer = options[correctIndex];
  options = shuffleArray(options);
  q.reponse = options.indexOf(correctAnswer); // réajuster l’index correct

  options.forEach((option, i) => {
    let btn = document.createElement("button");
    btn.textContent = option;
    btn.classList.add("option");
    btn.addEventListener("click", () => selectOption(i, btn));
    optionsContainer.appendChild(btn);
  });

  nextBtn.classList.add("hidden");
  if (currentQuestion === currentQuiz.questions.length - 1) {
    nextBtn.textContent = "Terminer";
  } else {
    nextBtn.textContent = "Suivant";
  }
}

// Quand l’utilisateur choisit une option
function selectOption(index, btn) {
  let q = currentQuiz.questions[currentQuestion];

  // désactiver toutes les options
  Array.from(optionsContainer.children).forEach(b => b.disabled = true);

  if (index === q.reponse) {
    btn.classList.add("correct");
    score++;
  } else {
    btn.classList.add("wrong");
    optionsContainer.children[q.reponse].classList.add("correct");
  }

  nextBtn.classList.remove("hidden");
}

// Passer à la question suivante
nextBtn.addEventListener("click", () => {
  currentQuestion++;
  if (currentQuestion < currentQuiz.questions.length) {
    afficherQuestion();
  } else {
    questionContainer.classList.add("hidden");
    optionsContainer.classList.add("hidden");
    nextBtn.classList.add("hidden");
    resultatDiv.textContent = `Ton score : ${score} / ${currentQuiz.questions.length} ✅`;
    resultatDiv.classList.remove("hidden");
  }
});

// Démarrer au choix des matières
loadMatieres();
