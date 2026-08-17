import Gameboard from "./gameboard";
import type { AttackResult, Coords } from "./types";

export interface AttackReport {
  coords: Coords;
  result: AttackResult;
}

export class Player {
  readonly name: string;
  readonly board: Gameboard;

  constructor(name: string = "Player") {
    this.name = name;
    this.board = new Gameboard();
  }
}

export class ComputerPlayer extends Player {
  readonly tried = new Set<string>();
  targetQueue: Coords[] = [];

  constructor() {
    super("Computer");
  }

  #randomCoords(boardSize: number): Coords {
    let row: number;
    let col: number;
    do {
      row = Math.floor(Math.random() * boardSize);
      col = Math.floor(Math.random() * boardSize);
    } while (this.tried.has(Gameboard.key(row, col)));
    return [row, col];
  }

  chooseAttack(enemyBoard: Gameboard): Coords {
    while (this.targetQueue.length > 0) {
      const candidate = this.targetQueue.shift();
      if (
        candidate !== undefined &&
        !this.tried.has(Gameboard.key(...candidate))
      ) {
        return candidate;
      }
    }
    return this.#randomCoords(enemyBoard.size);
  }

  attack(enemyBoard: Gameboard): AttackReport {
    const coords = this.chooseAttack(enemyBoard);
    this.tried.add(Gameboard.key(...coords));
    const result = enemyBoard.receiveAttack(coords);

    if (result === "hit") {
      const [row, col] = coords;
      const neighbors: Coords[] = [
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
