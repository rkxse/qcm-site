// Sélecteurs
const subjectSelectionDiv = document.getElementById("subject-selection");
const subjectButtonsDiv = document.getElementById("subject-buttons");
const themeSelectionDiv = document.getElementById("theme-selection");
const selectedSubjectEl = document.getElementById("selected-subject");
const themeButtonsDiv = document.getElementById("theme-buttons");
const quizDiv = document.getElementById("quiz");
const themeTitleEl = document.getElementById("theme-title");
const questionContainer = document.getElementById("question-container");
const optionsContainer = document.getElementById("options-container");
const nextBtn = document.getElementById("next-btn");
const resultatDiv = document.getElementById("resultat");

// Matières et thèmes disponibles
const themes = {
  anglais: ["couldhave"],
  japonais: ["hiragana", "katakana"]
};

// Variables pour le quiz
let questions = [];
let currentQuestion = 0;
let score = 0;
let currentSubject = "";

// Fisher-Yates shuffle in-place (robuste)
function shuffleArrayInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// --- Générer les boutons matière ---
Object.keys(themes).forEach(subject => {
  const btn = document.createElement("button");
  btn.textContent = subject.charAt(0).toUpperCase() + subject.slice(1);
  btn.dataset.subject = subject;
  btn.addEventListener("click", () => afficherThemes(subject));
  subjectButtonsDiv.appendChild(btn);
});

// --- Afficher les QCM disponibles pour la matière ---
function afficherThemes(subject) {
  currentSubject = subject;
  subjectSelectionDiv.classList.add("hidden");
  themeSelectionDiv.classList.remove("hidden");

  selectedSubjectEl.textContent = "Matière : " + subject.toUpperCase();
  themeButtonsDiv.innerHTML = "";

  themes[subject].forEach(theme => {
    fetch(`data/${subject}/${theme}.json`)
      .then(res => {
        if (!res.ok) throw new Error(`Fichier JSON introuvable : ${theme}`);
        return res.json();
      })
      .then(data => {
        const button = document.createElement("button");
        button.textContent = data.title; // titre du QCM
        button.addEventListener("click", () => lancerQuiz(data));
        themeButtonsDiv.appendChild(button);
      })
      .catch(err => console.error("Erreur chargement JSON:", err));
  });
}

// --- Lancer le quiz ---
function lancerQuiz(data) {
  themeSelectionDiv.classList.add("hidden");
  quizDiv.classList.remove("hidden");

  themeTitleEl.textContent = `${data.title}`;

  // Mélanger les questions (pour tous les sujets)
  questions = shuffleArrayInPlace([...data.questions]);
  currentQuestion = 0;
  score = 0;

  afficherQuestion();
}

function afficherQuestion() {
  optionsContainer.innerHTML = "";
  const q = questions[currentQuestion];
  questionContainer.textContent = q.question;

  const originalOptions = [...q.options];
  const correctIndex = q.reponse;

  let optionsToShow;

  if (currentSubject === "japonais") {
    // Bonne réponse
    const correctAnswer = originalOptions[correctIndex];

    // Supprimer les doublons éventuels dans la liste des options
    const uniqueOptions = [...new Set(originalOptions)];

    // Séparer bonnes et mauvaises réponses
    const wrongAnswers = uniqueOptions.filter(opt => opt !== correctAnswer);

    // Mélanger les mauvaises réponses
    shuffleArrayInPlace(wrongAnswers);

    // Recréer un tableau : on mélange tout puis on replace la bonne réponse
    optionsToShow = [...wrongAnswers];

    // Choisir une position aléatoire pour insérer la bonne réponse
    const randomPos = Math.floor(Math.random() * (optionsToShow.length + 1));
    optionsToShow.splice(randomPos, 0, correctAnswer);

    // Mettre à jour l’index de la bonne réponse dans q
    q.reponse = randomPos;
  } else {
    // Autres matières : on mélange juste les questions, pas les réponses
    optionsToShow = originalOptions;
  }

  // Générer les boutons
  optionsToShow.forEach((option, i) => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.classList.add("option");
    btn.addEventListener("click", () => selectOption(i, btn));
    optionsContainer.appendChild(btn);
  });

  nextBtn.textContent = currentQuestion === questions.length - 1 ? "Terminer" : "Suivant";
  nextBtn.classList.add("hidden");
}


// --- Sélection d'une option ---
function selectOption(index, btn) {
  const q = questions[currentQuestion];
  Array.from(optionsContainer.children).forEach(b => b.disabled = true);

  if (index === q.reponse) {
    btn.classList.add("correct");
    score++;
  } else {
    btn.classList.add("wrong");
    // Mettre en surbrillance le bouton correct (utilise q.reponse)
    if (optionsContainer.children[q.reponse]) {
      optionsContainer.children[q.reponse].classList.add("correct");
    }
  }

  nextBtn.classList.remove("hidden");
}

// --- Passer à la question suivante ---
nextBtn.addEventListener("click", () => {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    afficherQuestion();
  } else {
    quizDiv.classList.add("hidden");
    resultatDiv.innerHTML = `
      <h2>Résultat</h2>
      Score : ${score} / ${questions.length} <br>
    `;

    // Bouton Recommencer
    const restartBtn = document.createElement("button");
    restartBtn.textContent = "Recommencer";
    restartBtn.addEventListener("click", () => {
      resultatDiv.classList.add("hidden");
      subjectSelectionDiv.classList.remove("hidden");
      currentQuestion = 0;
      score = 0;
    });
    resultatDiv.appendChild(restartBtn);

    resultatDiv.classList.remove("hidden");
  }
});
