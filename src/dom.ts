import type Gameboard from "./gameboard";

export interface UIHandlers {
  onAttack: (row: number, col: number) => void;
  onRandomize: () => void;
  onNewGame: () => void;
}

function requireElement<T extends Element>(
  selector: string,
  ElementClass: new () => T,
): T {
  const element = document.querySelector(selector);
  if (!(element instanceof ElementClass)) {
    throw new Error(`Element "${selector}" wasn't found in the HTML`);
  }
  return element;
}

const statusEl = requireElement("#status", HTMLParagraphElement);
const playerBoardEl = requireElement("#player-board", HTMLDivElement);
const enemyBoardEl = requireElement("#enemy-board", HTMLDivElement);
const randomizeBtn = requireElement("#randomize-btn", HTMLButtonElement);
const newGameBtn = requireElement("#new-game-btn", HTMLButtonElement);

export function initUI({ onAttack, onRandomize, onNewGame }: UIHandlers): void {
  enemyBoardEl.addEventListener("click", (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const cell = target.closest<HTMLButtonElement>(".cell");
    if (cell === null || !cell.classList.contains("unknown")) return;

    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    if (Number.isNaN(row) || Number.isNaN(col)) return;

    onAttack(row, col);
  });
  randomizeBtn.addEventListener("click", onRandomize);
  newGameBtn.addEventListener("click", onNewGame);
}

export function setStatus(text: string): void {
  statusEl.textContent = text;
}

export function setRandomizeEnabled(enabled: boolean): void {
  randomizeBtn.disabled = !enabled;
}

export function setEnemyBoardLocked(locked: boolean): void {
  enemyBoardEl.classList.toggle("locked", locked);
}

function buildCell(row: number, col: number): HTMLButtonElement {
  const cell = document.createElement("button");
  cell.classList.add("cell");
  cell.dataset.row = String(row);
  cell.dataset.col = String(col);
  return cell;
}

export function renderPlayerBoard(board: Gameboard): void {
  playerBoardEl.innerHTML = "";
  for (let row = 0; row < board.size; row++) {
    for (let col = 0; col < board.size; col++) {
      const cell = buildCell(row, col);
      const ship = board.shipAt(row, col);
      if (ship !== null) cell.classList.add("ship");
      if (board.wasHit(row, col)) {
        cell.classList.add(ship !== null && ship.isSunk() ? "sunk" : "hit");
      }
      if (board.wasMissed(row, col)) cell.classList.add("miss");
      cell.disabled = true;
      playerBoardEl.appendChild(cell);
    }
  }
}

export function renderEnemyBoard(
  board: Gameboard,
  revealAll: boolean = false,
): void {
  enemyBoardEl.innerHTML = "";
  for (let row = 0; row < board.size; row++) {
    for (let col = 0; col < board.size; col++) {
      const cell = buildCell(row, col);
      const ship = board.shipAt(row, col);
      if (board.wasHit(row, col)) {
        cell.classList.add(ship !== null && ship.isSunk() ? "sunk" : "hit");
      } else if (board.wasMissed(row, col)) {
        cell.classList.add("miss");
      } else if (revealAll && ship !== null) {
        cell.classList.add("ship");
      } else {
        cell.classList.add("unknown");
      }
      enemyBoardEl.appendChild(cell);
    }
  }
}
