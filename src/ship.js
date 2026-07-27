export default class Ship {
  constructor(length, name = "Ship") {
    if (!Number.isInteger(length) || length < 1)
      throw new Error("Ship length must be an integer greater than 0");
    this.length = length;
    this.name = name;
    this.hits = 0;
  }

  hit() {
    if (this.isSunk()) return;
    this.hits++;
  }

  isSunk() {
    return this.hits >= this.length;
  }
}
