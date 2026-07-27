import "./styles.css";
import { Player, ComputerPlayer } from "./player";
import {
  initUI,
  setStatus,
  setRandomizeEnabled,
  setEnemyBoardLocked,
  renderPlayerBoard,
  renderEnemyBoard,
} from "./dom";

const COMPUTER_DELAY = 550;

let human;
let computer;
let gameOver;
let firstShotFired;
let awaitingComputer;

function startNewGame() {
  human = new Player("You");
  computer = new ComputerPlayer();
  human.board.placeFleetRandomly();
  computer.board.placeFleetRandomly();
  gameOver = false;
  firstShotFired = false;
  awaitingComputer = false;
  setRandomizeEnabled(true);
  setEnemyBoardLocked(false);
  setStatus("Place your fleet, then fire at enemy waters.");
  render();
}

function render() {
  renderPlayerBoard(human.board);
  renderEnemyBoard(computer.board, gameOver);
}

function describe(result, target) {
  if (result === "miss") return `splash into empty water near ${target}.`;
  if (result === "hit") return `direct hit at ${target}!`;
  return `${target} - ship destroyed!`;
}

function coordsLabel([row, col]) {
  return `${String.fromCharCode(65 + row)}${col + 1}`;
}

function endGame(winnerIsHuman) {
  gameOver = true;
  setEnemyBoardLocked(true);
  setRandomizeEnabled(false);
  setStatus(
    winnerIsHuman
      ? "Victory! The enemy fleet is at the bottom of the sea."
      : "Defeat - your fleet has been sunk.",
  );
  render();
}

function handlePlayerAttack(row, col) {
  if (gameOver || awaitingComputer) return;

  const result = computer.board.receiveAttack([row, col]);
  if (result === "repeat" || result === "invalid") return;

  firstShotFired = true;
  setRandomizeEnabled(false);
  setStatus(`Your shot: ${describe(result, coordsLabel([row, col]))}`);
  render();

  if (computer.board.allSunk()) {
    endGame(true);
    return;
  }

  awaitingComputer = true;
  setEnemyBoardLocked(true);
  setTimeout(computerTurn, COMPUTER_DELAY);
}

function computerTurn() {
  const { coords, result } = computer.attack(human.board);
  setStatus(`Enemy shot: ${describe(result, coordsLabel(coords))}`);
  render();

  if (human.board.allSunk()) {
    endGame(false);
    return;
  }

  awaitingComputer = false;
  setEnemyBoardLocked(false);
}

initUI({
  onAttack: handlePlayerAttack,
  onRandomize() {
    if (firstShotFired || gameOver) return;
    human.board.placeFleetRandomly();
    render();
  },
  onNewGame: startNewGame,
});

startNewGame();
