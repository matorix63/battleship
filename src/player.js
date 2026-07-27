import Gameboard from "./gameboard";

export class Player {
  constructor(name = "Player") {
    this.name = name;
    this.board = new Gameboard();
  }
}

export class ComputerPlayer extends Player {
  constructor() {
    super("Computer");
    this.tried = new Set();
    this.targetQueue = [];
  }

  #randomCoords(boardSize) {
    let row;
    let col;
    do {
      row = Math.floor(Math.random() * boardSize);
      col = Math.floor(Math.random() * boardSize);
    } while (this.tried.has(Gameboard.key(row, col)));
    return [row, col];
  }

  chooseAttack(enemyBoard) {
    while (this.targetQueue.length > 0) {
      const candidate = this.targetQueue.shift();
      if (!this.tried.has(Gameboard.key(...candidate))) return candidate;
    }
    return this.#randomCoords(enemyBoard.size);
  }

  attack(enemyBoard) {
    const coords = this.chooseAttack(enemyBoard);
    this.tried.add(Gameboard.key(...coords));
    const result = enemyBoard.receiveAttack(coords);

    if (result === "hit") {
      const [row, col] = coords;
      const neighbors = [
        [row - 1, col],
        [row + 1, col],
        [row, col - 1],
        [row, col + 1],
      ];
      neighbors.forEach(([r, c]) => {
        if (enemyBoard.isInside(r, c) && !this.tried.has(Gameboard.key(r, c))) {
          this.targetQueue.push([r, c]);
        }
      });
    }
    if (result === "sunk") {
      this.targetQueue = [];
    }

    return { coords, result };
  }
}
