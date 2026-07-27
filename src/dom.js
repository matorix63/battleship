const statusEl = document.querySelector("#status");
const playerBoardEl = document.querySelector("#player-board");
const enemyBoardEl = document.querySelector("#enemy-board");
const randomizeBtn = document.querySelector("#randomize-btn");
const newGameBtn = document.querySelector("#new-game-btn");

export function initUI({ onAttack, onRandomize, onNewGame }) {
  enemyBoardEl.addEventListener("click", (event) => {
    const cell = event.target.closest(".cell");
    if (!cell || !cell.classList.contains("unknown")) return;
    onAttack(Number(cell.dataset.row), Number(cell.dataset.col));
  });
  randomizeBtn.addEventListener("click", onRandomize);
  newGameBtn.addEventListener("click", onNewGame);
}

export function setStatus(text) {
  statusEl.textContent = text;
}

export function setRandomizeEnabled(enabled) {
  randomizeBtn.disabled = !enabled;
}

export function setEnemyBoardLocked(locked) {
  enemyBoardEl.classList.toggle("locked", locked);
}

function buildCell(row, col) {
  const cell = document.createElement("button");
  cell.classList.add("cell");
  cell.dataset.row = row;
  cell.dataset.col = col;
  return cell;
}

export function renderPlayerBoard(board) {
  playerBoardEl.innerHTML = "";
  for (let row = 0; row < board.size; row++) {
    for (let col = 0; col < board.size; col++) {
      const cell = buildCell(row, col);
      const ship = board.shipAt(row, col);
      if (ship) cell.classList.add("ship");
      if (board.wasHit(row, col)) {
        cell.classList.add(ship && ship.isSunk() ? "sunk" : "hit");
      }
      if (board.wasMissed(row, col)) cell.classList.add("miss");
      cell.disabled = true;
      playerBoardEl.appendChild(cell);
    }
  }
}

export function renderEnemyBoard(board, revealAll = false) {
  enemyBoardEl.innerHTML = "";
  for (let row = 0; row < board.size; row++) {
    for (let col = 0; col < board.size; col++) {
      const cell = buildCell(row, col);
      const ship = board.shipAt(row, col);
      if (board.wasHit(row, col)) {
        cell.classList.add(ship && ship.isSunk() ? "sunk" : "hit");
      } else if (board.wasMissed(row, col)) {
        cell.classList.add("miss");
      } else if (revealAll && ship) {
        cell.classList.add("ship");
      } else {
        cell.classList.add("unknown");
      }
      enemyBoardEl.appendChild(cell);
    }
  }
}
