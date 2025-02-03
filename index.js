let highScore = 0;
let currentScore = 0;
const pointPerWin = 5;
const pointPerLoose = 2;
let userChosenValue = null;
let correctColorValue = null;

const constants = {
  highScore: "highScore",
};

// target html elements
const masterBox = document.querySelector(".game-board .main-color-box");
const optionsBoxContainer = document.querySelector(".game-board .options");
const checkGuessButton = document.querySelector(".game-buttons .check-guess");
const restartGameButton = document.querySelector(".game-buttons .restart-game");
const highScoreDoc = document.querySelector(
  ".score-container .high-score span"
);
const currentScoreDoc = document.querySelector(
  ".score-container .current-score span"
);
const gameInstructionModal = document.querySelector(".game-instruction-modal");
const letPlayBtn = document.querySelector(
  ".game-instruction-modal .lets-play-btn"
);
const gameNotificationModal = document.querySelector(
  ".game-notification-modal"
);
const gameNotificationModalContent = document.querySelector(
  ".game-notification-modal div"
);

restartGameButton.addEventListener("click", () => {
  restartGame();
});

function restartGame() {
  window.location.reload();
}

// generate colors
const mainColor = "";
const similarColors = [];

// get high sore from local db
const highScoreExist = window.localStorage.getItem(constants.highScore);
console.log({ highScoreExist });
highScore = highScoreExist ? JSON.parse(highScoreExist) : 0;

function renderScores() {
  highScoreDoc.textContent = highScore;
  currentScoreDoc.textContent = currentScore;
}

function generateAndRenderColors() {
  gameNotificationModal.style.display = "none";
  AudioClass.pauseAllAudio();

  const colorGen =
    "#" + (Math.random().toString(16) + "000000").substring(2, 8);
  correctColorValue = colorGen;

  console.log("colorGen", colorGen);

  let similarColors = generateSimilarColors(colorGen, 5);
  console.log("sim cols", similarColors);
  similarColors.push(colorGen);

  // randomize / sort the similarColors to place the right one at a random place
  similarColors = similarColors.sort();

  console.log("all colors", similarColors);

  masterBox.style.backgroundColor = colorGen;

  // render option boxes
  let html = "";
  for (const singleCol of similarColors) {
    html += `<button class="option-box box" style="background-color: ${singleCol}" value="${singleCol}" onClick="setChosenOption(this.value)" data-testid="colorOption"></button>`;
  }

  optionsBoxContainer.innerHTML = html;
}

function generateSimilarColors(baseColor, count) {
  const similarColors = [];

  // Convert hex to RGB
  let r = parseInt(baseColor.slice(1, 3), 16);
  let g = parseInt(baseColor.slice(3, 5), 16);
  let b = parseInt(baseColor.slice(5, 7), 16);

  for (let i = 0; i < count; i++) {
    // Apply larger controlled variations for more noticeable differences
    const newR = Math.min(
      255,
      Math.max(0, r + Math.floor(Math.random() * 150 - 75))
    );
    const newG = Math.min(
      255,
      Math.max(0, g + Math.floor(Math.random() * 150 - 75))
    );
    const newB = Math.min(
      255,
      Math.max(0, b + Math.floor(Math.random() * 150 - 75))
    );

    // Convert back to hex and format with leading zeros
    const colorVariation = `#${newR.toString(16).padStart(2, "0")}${newG
      .toString(16)
      .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
    similarColors.push(colorVariation);
  }
  return similarColors;
}

function setChosenOption(value) {
  console.log({ value });
  userChosenValue = value;
}

function validateUserChoice() {
  console.log("validate user choice", { userChosenValue, correctColorValue });

  const continueGameBtn = ` <button
          class="button-general"
          style="margin: 0"
          onclick="generateAndRenderColors()"
        >
          Continue
        </button>`;

  if (userChosenValue === correctColorValue) {
    currentScore += pointPerWin;
    gameNotificationModalContent.innerHTML = ` <h2>😁</h2>
          <h3 data-testid="gameStatus">Correct</h3>
          <p>Correct answer, you got +${pointPerWin} points</p>${continueGameBtn}`;
    AudioClass.winAudio.playAudio();
  } else {
    if (currentScore - pointPerLoose > 0) {
      currentScore -= pointPerLoose;
      gameNotificationModalContent.innerHTML = ` <h2>😒</h2>
          <h3 data-testid="gameStatus">Wrong</h3>
          <p>Wrong Answer, you lost -${pointPerLoose} points</p>${continueGameBtn}`;
    } else {
      currentScore = 0;
      gameNotificationModalContent.innerHTML = ` <h2>😒</h2>
          <h3>Game Over</h3>
          <p>You lost, try again</p>
          <button class="button-general"
          style="margin: 0"
          onclick="restartGame()">Restart Game</button>`;
    }
    AudioClass.looseAudio.playAudio();
  }

  gameNotificationModal.style.display = "flex";

  if (currentScore > highScore) {
    highScore = currentScore;
    window.localStorage.setItem(constants.highScore, String(highScore));
  }

  renderScores();
}

renderScores();

// hide instruction modal once the let's play button is clicked
letPlayBtn.addEventListener("click", () => {
  gameInstructionModal.style.display = "none";
  generateAndRenderColors();
});

const audiosInstances = [];
const AudioClass = {
  winAudio: {
    playAudio: () => {
      const winAudioDoc = document.getElementById("winSound");
      winAudioDoc.currentTime = 0;
      winAudioDoc.play();
      audiosInstances.push(winAudioDoc);
    },
  },
  looseAudio: {
    playAudio: () => {
      const loseAudioDoc = document.getElementById("failedSound");
      loseAudioDoc.currentTime = 0;
      loseAudioDoc.play();
      audiosInstances.push(loseAudioDoc);
    },
  },
  pauseAllAudio: () => {
    for (const instance of audiosInstances) {
      instance.pause();
    }
  },
};
