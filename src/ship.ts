export default class Ship {
  readonly length: number;
  readonly name: string;
  hits: number;

  constructor(length: number, name: string = "Ship") {
    if (!Number.isInteger(length) || length < 1) {
      throw new Error("Ship length must be an integer greater than 0");
    }
    this.length = length;
    this.name = name;
    this.hits = 0;
  }

  hit(): void {
    if (this.isSunk()) return;
    this.hits++;
  }

  isSunk(): boolean {
    return this.hits >= this.length;
  }
}
