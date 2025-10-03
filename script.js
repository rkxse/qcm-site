// Sélecteurs
const subjectSelection = document.getElementById("subject-selection");
const subjectButtonsDiv = document.getElementById("subject-buttons");
const quizDiv = document.getElementById("quiz");
const questionContainer = document.getElementById("question-container");
const optionsContainer = document.getElementById("options-container");
const nextBtn = document.getElementById("next-btn");
const resultatDiv = document.getElementById("resultat");

// Matières et thèmes disponibles (chaque thème correspond à un fichier JSON)
const themes = {
  anglais: ["couldhave"],
  japonais: ["hiragana"]
};

// Fonction pour mélanger un tableau
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

// --- Générer les boutons matière ---
Object.keys(themes).forEach(matiere => {
  const btn = document.createElement("button");
  btn.textContent = matiere.charAt(0).toUpperCase() + matiere.slice(1);
  btn.addEventListener("click", () => loadThemes(matiere));
  subjectButtonsDiv.appendChild(btn);
});

// --- Charger les thèmes pour une matière ---
function loadThemes(matiere) {
  subjectSelection.classList.add("hidden");

  const themeDiv = document.createElement("div");
  themeDiv.id = "theme-buttons-container";
  themeDiv.innerHTML = `<h2>Choisis un thème pour ${matiere} :</h2>`;
  document.body.appendChild(themeDiv);

  themes[matiere].forEach(theme => {
    const btn = document.createElement("button");
    btn.textContent = theme;
    btn.addEventListener("click", () => startQuizFromJSON(matiere, theme));
    themeDiv.appendChild(btn);
  });
}

// --- Démarrer le quiz depuis un fichier JSON ---
let currentQuiz = null;
let currentQuestion = 0;
let score = 0;

function startQuizFromJSON(matiere, theme) {
  fetch(`data/${matiere}/${theme}.json`)
    .then(res => {
      if (!res.ok) throw new Error("Fichier JSON introuvable");
      return res.json();
    })
    .then(data => {
      currentQuiz = data;
      currentQuestion = 0;
      score = 0;
      document.getElementById("theme-buttons-container").remove();
      quizDiv.classList.remove("hidden");
      afficherQuestion();
    })
    .catch(err => alert("⚠️ Erreur : " + err.message));
}

// --- Afficher une question ---
function afficherQuestion() {
  optionsContainer.innerHTML = "";
  const q = currentQuiz.questions[currentQuestion];

  questionContainer.textContent = q.question;

  const options = [...q.options];
  const correctAnswer = options[q.reponse];
  shuffleArray(options);
  q.reponse = options.indexOf(correctAnswer);

  options.forEach((option, i) => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.classList.add("option");
    btn.addEventListener("click", () => selectOption(i, btn));
    optionsContainer.appendChild(btn);
  });

  nextBtn.classList.add("hidden");
  nextBtn.textContent = currentQuestion === currentQuiz.questions.length - 1 ? "Terminer" : "Suivant";
}

// --- Quand l’utilisateur choisit une option ---
function selectOption(index, btn) {
  const q = currentQuiz.questions[currentQuestion];
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

// --- Passer à la question suivante ---
nextBtn.addEventListener("click", () => {
  currentQuestion++;
  if (currentQuestion < currentQuiz.questions.length) {
    afficherQuestion();
  } else {
    // Fin du quiz
    questionContainer.classList.add("hidden");
    optionsContainer.classList.add("hidden");
    nextBtn.classList.add("hidden");

    resultatDiv.innerHTML = `Ton score : ${score} / ${currentQuiz.questions.length} ✅<br><button id="restart-btn">Recommencer</button>`;
    resultatDiv.classList.remove("hidden");

    document.getElementById("restart-btn").addEventListener("click", () => {
      resultatDiv.classList.add("hidden");
      subjectSelection.classList.remove("hidden");
      currentQuiz = null;
      currentQuestion = 0;
      score = 0;
    });
  }
});
