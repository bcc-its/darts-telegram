import Game from "./js/Game";
import { ENCRYPTION_ENABLE, BOARD_RINGS, MAX_ARROWS } from "./js/Settings";

import "./js/animate.js";
import "./style.css";

const STATE_IDLE = 10;
const STATE_PLAYING_THROW_START = 13;
const STATE_PLAYING_THROW_FINISHED = 14;

let Score = 0;
let Arrows = 3;
const Darts = new Game("canvas");

const loadingbox = document.getElementById("loading");
const controlsBox = document.getElementById("controls");

const totalScoreCount = document.getElementById("totalScoreCount");
const scoreLabel = document.getElementById("scoreLabel");
const buttons = document.getElementById("buttons");
const playBtn = document.getElementById("playBtn");
const arrowCounter = document.getElementById("arrowCounterSpan");

function setState(state) {
  switch (state) {
    case STATE_PLAYING_THROW_START:
      buttons.classList.add("hide");
      Darts.play();
      break;
    case STATE_PLAYING_THROW_FINISHED:
      if (Arrows === 0) {
        sendScore(Score);
        setState(STATE_IDLE);
      } else {
        setState(STATE_PLAYING_THROW_START);
      }
      break;
    case STATE_IDLE:
      Darts.pause();
      Darts.stopBoardMovement();
      buttons.classList.remove("hide");
      break;
  }

  setUI();
}

playBtn.addEventListener("click", startPlay);
playBtn.addEventListener("touchstart", startPlay);
function startPlay(e) {
  resetScore();
  Darts.startBoardMovement();
  setState(STATE_PLAYING_THROW_START);
  e.preventDefault();
  e.stopPropagation();
}

function setUI() {
  totalScoreCount.innerText = Score;
  arrowCounter.innerHTML = Arrows;
}

function handleThrowStart(e) {
  if (!e.isTrusted) return;
  Darts.startThrow(e);
}

function handleThrowEnd(e) {
  if (!e.isTrusted || Darts.isPaused()) return;

  const points = Darts.endThrow(e);

  if (points === false) {
    return;
  }

  calculatePoints(points);

  setTimeout(function () {
    setState(STATE_PLAYING_THROW_FINISHED);
  }, 500);
}

function calculatePoints(points) {
  Score = Score + points;
  Arrows = points === BOARD_RINGS ? MAX_ARROWS : Arrows - 1;
}

function sendScore() {
  // send score to telegram
}

function resetScore() {
  Arrows = MAX_ARROWS;
  Score = 0;
}

function gameError(e) {
  loadingbox.classList.add("error");
  console.log(e);
}

function animate() {
  Darts.draw();
  requestAnimFrame(animate);
}

function init() {
  Darts.init();
  Darts.startBoardMovement();
  resetScore();
  document.addEventListener("mousedown", handleThrowStart, false);
  document.addEventListener("touchmove", handleThrowStart, false);
  document.addEventListener("mouseup", handleThrowEnd, false);
  document.addEventListener("touchend", handleThrowEnd, false);

  setState(STATE_IDLE);

  controlsBox.classList.remove("hide");
  animate();
  setTimeout(() => {
    loadingbox.classList.add("hide");
  }, 500);
}

// check for IE
if (!!window.MSInputMethodContext && !!document.documentMode) {
  gameError();
} else {
  init();
}
