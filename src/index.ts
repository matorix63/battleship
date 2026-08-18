import "./styles.css";
import { Player, ComputerPlayer } from "./player";
import type { AttackResult, Coords } from "./types";
import {
  initUI,
  setStatus,
  setRandomizeEnabled,
  setEnemyBoardLocked,
  renderPlayerBoard,
  renderEnemyBoard,
} from "./dom";

const COMPUTER_DELAY = 550;

interface GameState {
  human: Player;
  computer: ComputerPlayer;
  gameOver: boolean;
  firstShotFired: boolean;
  awaitingComputer: boolean;
}

function createGame(): GameState {
  const human = new Player("You");
  const computer = new ComputerPlayer();
  human.board.placeFleetRandomly();
  computer.board.placeFleetRandomly();
  return {
    human,
    computer,
    gameOver: false,
    firstShotFired: false,
    awaitingComputer: false,
  };
}

let state: GameState = createGame();

function render(): void {
  renderPlayerBoard(state.human.board);
  renderEnemyBoard(state.computer.board, state.gameOver);
}

function startNewGame(): void {
  state = createGame();
  setRandomizeEnabled(true);
  setEnemyBoardLocked(false);
  setStatus("Place your fleet, then fire at enemy waters.");
  render();
}

function describe(result: AttackResult, target: string): string {
  if (result === "miss") return `splash into empty water near ${target}.`;
  if (result === "hit") return `direct hit at ${target}!`;
  return `${target} - ship destroyed!`;
}

function coordsLabel([row, col]: Coords): string {
  return `${String.fromCharCode(65 + row)}${col + 1}`;
}

function endGame(winnerIsHuman: boolean): void {
  state.gameOver = true;
  setEnemyBoardLocked(true);
  setRandomizeEnabled(false);
  setStatus(
    winnerIsHuman
      ? "Victory! The enemy fleet is at the bottom of the sea."
      : "Defeat - your fleet has been sunk.",
  );
  render();
}

function computerTurn(): void {
  const { coords, result } = state.computer.attack(state.human.board);
  setStatus(`Enemy shot: ${describe(result, coordsLabel(coords))}`);
  render();

  if (state.human.board.allSunk()) {
    endGame(false);
    return;
  }

  state.awaitingComputer = false;
  setEnemyBoardLocked(false);
}

function handlePlayerAttack(row: number, col: number): void {
  if (state.gameOver || state.awaitingComputer) return;

  const result = state.computer.board.receiveAttack([row, col]);
  if (result === "repeat" || result === "invalid") return;

  state.firstShotFired = true;
  setRandomizeEnabled(false);
  setStatus(`Your shot: ${describe(result, coordsLabel([row, col]))}`);
  render();

  if (state.computer.board.allSunk()) {
    endGame(true);
    return;
  }

  state.awaitingComputer = true;
  setEnemyBoardLocked(true);
  setTimeout(computerTurn, COMPUTER_DELAY);
}

initUI({
  onAttack: handlePlayerAttack,
  onRandomize(): void {
    if (state.firstShotFired || state.gameOver) return;
    state.human.board.placeFleetRandomly();
    render();
  },
  onNewGame: startNewGame,
});

startNewGame();
