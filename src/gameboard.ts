import Ship from "./ship";
import type { AttackResult, Coords } from "./types";

const BOARD_SIZE = 10;

interface FleetSpecEntry {
  name: string;
  length: number;
}

export interface FleetEntry {
  ship: Ship;
  cells: Coords[];
}

const FLEET_SPEC: readonly FleetSpecEntry[] = [
  { name: "Large", length: 5 },
  { name: "Big", length: 4 },
  { name: "Medium", length: 3 },
  { name: "Average", length: 3 },
  { name: "Small", length: 2 },
];

export default class Gameboard {
  readonly size: number = BOARD_SIZE;
  readonly cellToShip = new Map<string, Ship>();
  readonly missed = new Set<string>();
  readonly hits = new Set<string>();
  fleet: FleetEntry[] = [];

  static key(row: number, col: number): string {
    return `${row},${col}`;
  }

  isInside(row: number, col: number): boolean {
    return row >= 0 && row < this.size && col >= 0 && col < this.size;
  }

  #cellsFor(
    length: number,
    row: number,
    col: number,
    horizontal: boolean,
  ): Coords[] {
    const cells: Coords[] = [];
    for (let i = 0; i < length; i++) {
      cells.push(horizontal ? [row, col + i] : [row + i, col]);
    }
    return cells;
  }

  canPlace(
    length: number,
    row: number,
    col: number,
    horizontal: boolean,
  ): boolean {
    return this.#cellsFor(length, row, col, horizontal).every(
      ([r, c]) =>
        this.isInside(r, c) && !this.cellToShip.has(Gameboard.key(r, c)),
    );
  }

  placeShip(
    ship: Ship,
    row: number,
    col: number,
    horizontal: boolean = true,
  ): boolean {
    if (!this.canPlace(ship.length, row, col, horizontal)) return false;
    const cells = this.#cellsFor(ship.length, row, col, horizontal);
    cells.forEach(([r, c]) => this.cellToShip.set(Gameboard.key(r, c), ship));
    this.fleet.push({ ship, cells });
    return true;
  }

  placeFleetRandomly(): void {
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

  receiveAttack([row, col]: Coords): AttackResult {
    if (!this.isInside(row, col)) return "invalid";
    const key = Gameboard.key(row, col);
    if (this.missed.has(key) || this.hits.has(key)) return "repeat";

    const ship = this.cellToShip.get(key);
    if (ship === undefined) {
      this.missed.add(key);
      return "miss";
    }
    ship.hit();
    this.hits.add(key);
    return ship.isSunk() ? "sunk" : "hit";
  }

  shipAt(row: number, col: number): Ship | null {
    return this.cellToShip.get(Gameboard.key(row, col)) ?? null;
  }

  cellsOf(ship: Ship): Coords[] {
    const entry = this.fleet.find((item) => item.ship === ship);
    return entry ? entry.cells : [];
  }

  wasMissed(row: number, col: number): boolean {
    return this.missed.has(Gameboard.key(row, col));
  }

  wasHit(row: number, col: number): boolean {
    return this.hits.has(Gameboard.key(row, col));
  }

  allSunk(): boolean {
    return (
      this.fleet.length > 0 && this.fleet.every(({ ship }) => ship.isSunk())
    );
  }
}
