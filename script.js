const subjectButtons = document.querySelectorAll("#subject-buttons button");
const subjectSelectionDiv = document.getElementById("subject-selection");
const themeSelectionDiv = document.getElementById("theme-selection");
const selectedSubjectEl = document.getElementById("selected-subject");
const themeButtonsDiv = document.getElementById("theme-buttons");
const quizDiv = document.getElementById("quiz");
const themeTitleEl = document.getElementById("theme-title");
const questionContainer = document.getElementById("question-container");
const optionsContainer = document.getElementById("options-container");
const nextBtn = document.getElementById("next-btn");
const resultatDiv = document.getElementById("resultat");

let questions = [];
let currentQuestion = 0;
let score = 0;

// 📌 Les thèmes disponibles (liés aux fichiers JSON dans /data/)
const themes = {
  anglais: ["couldhave"],
  maths: ["probabilites"],
  histoire: ["revolution"]
};

// Choisir une matière
subjectButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const subject = btn.dataset.subject;
    afficherThemes(subject);
  });
});

function afficherThemes(subject) {
  subjectSelectionDiv.classList.add("hidden");
  themeSelectionDiv.classList.remove("hidden");

  selectedSubjectEl.textContent = "Matière : " + subject.toUpperCase();
  themeButtonsDiv.innerHTML = "";

  themes[subject].forEach(theme => {
    // Charger le JSON juste pour récupérer le titre
    fetch(`data/${subject}/${theme}.json`)
      .then(res => res.json())
      .then(data => {
        const button = document.createElement("button");
        button.textContent = data.title; // Utilise le titre du JSON
        button.addEventListener("click", () => lancerQuiz(data));
        themeButtonsDiv.appendChild(button);
      })
      .catch(err => console.error("Erreur chargement JSON:", err));
  });
}


function chargerTheme(subject, theme) {
  fetch(`data/${subject}/${theme}.json`)
    .then(res => res.json())
    .then(data => {
      lancerQuiz(data);
    })
    .catch(err => console.error("Erreur chargement JSON:", err));
}

function lancerQuiz(data) {
  themeSelectionDiv.classList.add("hidden");
  quizDiv.classList.remove("hidden");

  themeTitleEl.textContent = data.title;
  questions = data.questions;
  currentQuestion = 0;
  score = 0;

  afficherQuestion();
}

function afficherQuestion() {
  optionsContainer.innerHTML = "";
  const q = questions[currentQuestion];
  questionContainer.textContent = q.question;

  q.options.forEach((option, i) => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.addEventListener("click", () => selectOption(i, btn));
    optionsContainer.appendChild(btn);
  });

  nextBtn.textContent = currentQuestion === questions.length - 1 ? "Terminer" : "Suivant";
  nextBtn.classList.add("hidden");
}

function selectOption(index, btn) {
  const q = questions[currentQuestion];
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

nextBtn.addEventListener("click", () => {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    afficherQuestion();
  } else {
    quizDiv.classList.add("hidden");
    resultatDiv.innerHTML = `
      <h2>Résultat</h2>
      Score : ${score} / ${questions.length} <br>
      <button onclick="location.reload()">Recommencer</button>
    `;
    resultatDiv.classList.remove("hidden");
  }
});