import Ship from "./ship";

const BOARD_SIZE = 10;

const FLEET_SPEC = [
  { name: "Large", length: 5 },
  { name: "Big", length: 4 },
  { name: "Medium", length: 3 },
  { name: "Average", length: 3 },
  { name: "Small", length: 2 },
];

export default class Gameboard {
  constructor() {
    this.size = BOARD_SIZE;
    this.cellToShip = new Map();
    this.fleet = [];
    this.missed = new Set();
    this.hits = new Set();
  }

  static key(row, col) {
    return `${row},${col}`;
  }

  isInside(row, col) {
    return row >= 0 && row < this.size && col >= 0 && col < this.size;
  }

  #cellsFor(length, row, col, horizontal) {
    const cells = [];
    for (let i = 0; i < length; i++) {
      cells.push(horizontal ? [row, col + i] : [row + i, col]);
    }
    return cells;
  }

  canPlace(length, row, col, horizontal) {
    return this.#cellsFor(length, row, col, horizontal).every(
      ([r, c]) =>
        this.isInside(r, c) && !this.cellToShip.has(Gameboard.key(r, c)),
    );
  }

  placeShip(ship, row, col, horizontal = true) {
    if (!this.canPlace(ship.length, row, col, horizontal)) return false;
    const cells = this.#cellsFor(ship.length, row, col, horizontal);
    cells.forEach(([r, c]) => this.cellToShip.set(Gameboard.key(r, c), ship));
    this.fleet.push({ ship, cells });
    return true;
  }

  placeFleetRandomly() {
    this.cellToShip.clear();
    this.fleet = [];
    FLEET_SPEC.forEach(({ name, length }) => {
      const ship = new Ship(length, name);
      let placed = false;
      while (!placed) {
        const row = Math.floor(Math.random() * this.size);
        const col = Math.floor(Math.random() * this.size);
        const horizontal = Math.random() < 0.5;
        placed = this.placeShip(ship, row, col, horizontal);
      }
    });
  }

  receiveAttack([row, col]) {
    if (!this.isInside(row, col)) return "invalid";
    const key = Gameboard.key(row, col);
    if (this.missed.has(key) || this.hits.has(key)) return "repeat";

    const ship = this.cellToShip.get(key);
    if (!ship) {
      this.missed.add(key);
      return "miss";
    }
    ship.hit();
    this.hits.add(key);
    return ship.isSunk() ? "sunk" : "hit";
  }

  shipAt(row, col) {
    return this.cellToShip.get(Gameboard.key(row, col)) ?? null;
  }

  cellsOf(ship) {
    const entry = this.fleet.find((item) => item.ship === ship);
    return entry ? entry.cells : [];
  }

  wasMissed(row, col) {
    return this.missed.has(Gameboard.key(row, col));
  }

  wasHit(row, col) {
    return this.hits.has(Gameboard.key(row, col));
  }

  allSunk() {
    return (
      this.fleet.length > 0 && this.fleet.every(({ ship }) => ship.isSunk())
    );
  }
}
