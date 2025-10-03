let currentQuiz = null;
let currentQuestion = 0;
let score = 0;

// Sélecteurs avec les bons ID
const subjectSelection = document.getElementById("subject-selection");
const subjectButtonsDiv = document.getElementById("subject-buttons");
const themesDiv = document.getElementById("theme-selection");
const themeButtonsDiv = document.getElementById("theme-buttons");
const quizDiv = document.getElementById("quiz");
const questionContainer = document.getElementById("question-container");
const optionsContainer = document.getElementById("options-container");
const nextBtn = document.getElementById("next-btn");
const resultatDiv = document.getElementById("resultat");

// Matières et thèmes disponibles
const themes = {
  anglais: ["couldhave"],
  japonais: ["hiragana"]
};

// Fonction pour mélanger un tableau
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Ajouter événements aux boutons matière
document.querySelectorAll("#subject-buttons button").forEach(btn => {
  btn.addEventListener("click", () => {
    let matiere = btn.dataset.subject;
    loadThemes(matiere);
  });
});

// Charger les thèmes d’une matière
function loadThemes(matiere) {
  subjectSelection.classList.add("hidden");
  themesDiv.classList.remove("hidden");

  document.getElementById("selected-subject").textContent =
    "Thèmes disponibles pour : " + matiere.charAt(0).toUpperCase() + matiere.slice(1);

  themeButtonsDiv.innerHTML = "";
  themes[matiere].forEach(theme => {
    fetch(`data/${matiere}/${theme}.json`)
      .then(res => {
        if (!res.ok) throw new Error(`Impossible de charger ${theme}.json`);
        return res.json();
      })
      .then(data => {
        let btn = document.createElement("button");
        btn.textContent = data.title || theme;
        btn.onclick = () => startQuiz(matiere, theme);
        themeButtonsDiv.appendChild(btn);
      })
      .catch(err => alert("⚠️ Erreur : " + err.message));
  });
}

// Démarrer un quiz
function startQuiz(matiere, theme) {
  themesDiv.classList.add("hidden");
  quizDiv.classList.remove("hidden");

  fetch(`data/${matiere}/${theme}.json`)
    .then(res => {
      if (!res.ok) throw new Error(`Fichier ${theme}.json introuvable`);
      return res.json();
    })
    .then(data => {
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error("Format JSON invalide : pas de questions trouvées.");
      }

      data.questions = shuffleArray(data.questions);

      currentQuiz = data;
      currentQuestion = 0;
      score = 0;
      afficherQuestion();
    })
    .catch(err => alert("⚠️ Erreur : " + err.message));
}

// Afficher une question
function afficherQuestion() {
  optionsContainer.innerHTML = "";
  let q = currentQuiz.questions[currentQuestion];

  questionContainer.textContent = q.question;

  let options = [...q.options];
  let correctIndex = q.reponse;
  let correctAnswer = options[correctIndex];
  options = shuffleArray(options);
  q.reponse = options.indexOf(correctAnswer);

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

  Array.from(optionsContainer.children).forEach(b => (b.disabled = true));

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
