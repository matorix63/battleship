import Gameboard from "../src/gameboard";
import Ship from "../src/ship";

describe("Gameboard placement", () => {
  test("places a horizontal ship on its cells", () => {
    const board = new Gameboard();
    const ship = new Ship(3);
    expect(board.placeShip(ship, 2, 4, true)).toBe(true);
    expect(board.shipAt(2, 4)).toBe(ship);
    expect(board.shipAt(2, 6)).toBe(ship);
    expect(board.shipAt(2, 7)).toBeNull();
  });

  test("places a vertical ship on its cells", () => {
    const board = new Gameboard();
    const ship = new Ship(3);
    board.placeShip(ship, 5, 5, false);
    expect(board.shipAt(7, 5)).toBe(ship);
    expect(board.shipAt(5, 6)).toBeNull();
  });

  test("rejects placements that leave the board", () => {
    const board = new Gameboard();
    expect(board.placeShip(new Ship(4), 0, 8, true)).toBe(false);
    expect(board.placeShip(new Ship(4), 8, 0, false)).toBe(false);
  });

  test("rejects overlapping placements", () => {
    const board = new Gameboard();
    board.placeShip(new Ship(3), 3, 3, true);
    expect(board.placeShip(new Ship(2), 3, 4, false)).toBe(false);
  });

  test("random fleet places five ships without overlap", () => {
    const board = new Gameboard();
    board.placeFleetRandomly();
    expect(board.fleet.length).toBe(5);
    const totalCells = board.fleet.reduce(
      (sum, { cells }) => sum + cells.length,
      0,
    );
    expect(totalCells).toBe(17);
    expect(board.cellToShip.size).toBe(17);
  });
});

describe("Gameboard attacks", () => {
  test("records a miss on empty water", () => {
    const board = new Gameboard();
    expect(board.receiveAttack([0, 0])).toBe("miss");
    expect(board.wasMissed(0, 0)).toBe(true);
  });

  test("sends a hit to the right ship", () => {
    const board = new Gameboard();
    const ship = new Ship(3);
    board.placeShip(ship, 1, 1, true);
    expect(board.receiveAttack([1, 2])).toBe("hit");
    expect(ship.hits).toBe(1);
  });

  test("reports when a ship sinks", () => {
    const board = new Gameboard();
    board.placeShip(new Ship(2), 0, 0, true);
    board.receiveAttack([0, 0]);
    expect(board.receiveAttack([0, 1])).toBe("sunk");
  });

  test("rejects repeated attacks on the same cell", () => {
    const board = new Gameboard();
    board.receiveAttack([4, 4]);
    expect(board.receiveAttack([4, 4])).toBe("repeat");
    const ship = new Ship(2);
    board.placeShip(ship, 9, 0, true);
    board.receiveAttack([9, 0]);
    expect(board.receiveAttack([9, 0])).toBe("repeat");
    expect(ship.hits).toBe(1);
  });

  test("rejects attacks outside the board", () => {
    const board = new Gameboard();
    expect(board.receiveAttack([10, 0])).toBe("invalid");
    expect(board.receiveAttack([-1, 3])).toBe("invalid");
  });

  test("allSunk is false until the whole fleet is down", () => {
    const board = new Gameboard();
    board.placeShip(new Ship(1), 0, 0);
    board.placeShip(new Ship(1), 5, 5);
    expect(board.allSunk()).toBe(false);
    board.receiveAttack([0, 0]);
    expect(board.allSunk()).toBe(false);
    board.receiveAttack([5, 5]);
    expect(board.allSunk()).toBe(true);
  });

  test("allSunk is false on an empty board", () => {
    expect(new Gameboard().allSunk()).toBe(false);
  });
});
