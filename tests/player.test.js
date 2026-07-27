import { Player, ComputerPlayer } from "../src/player";
import Ship from "../src/ship";

describe("Player", () => {
  test("has its own gameboard", () => {
    const a = new Player("A");
    const b = new Player("B");
    expect(a.board).not.toBe(b.board);
    a.board.receiveAttack([0, 0]);
    expect(b.board.wasMissed(0, 0)).toBe(false);
  });
});

describe("ComputerPlayer", () => {
  test("never attacks the same cell twice", () => {
    const computer = new ComputerPlayer();
    const enemy = new Player();
    const seen = new Set();
    for (let i = 0; i < 100; i++) {
      const { coords } = computer.attack(enemy.board);
      const key = coords.join(",");
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });

  test("keeps every attack on the board", () => {
    const computer = new ComputerPlayer();
    const enemy = new Player();
    for (let i = 0; i < 60; i++) {
      const { coords, result } = computer.attack(enemy.board);
      expect(enemy.board.isInside(...coords)).toBe(true);
      expect(result).not.toBe("invalid");
      expect(result).not.toBe("repeat");
    }
  });

  test("hunts neighbors after a hit", () => {
    const computer = new ComputerPlayer();
    const enemy = new Player();
    enemy.board.placeShip(new Ship(3), 5, 4, true);
    computer.targetQueue = [[5, 5]];
    const first = computer.attack(enemy.board);
    expect(first.result).toBe("hit");
    const second = computer.attack(enemy.board);
    const [row, col] = second.coords;
    const distance = Math.abs(row - 5) + Math.abs(col - 5);
    expect(distance).toBe(1);
  });

  test("can sink an entire fleet eventually", () => {
    const computer = new ComputerPlayer();
    const enemy = new Player();
    enemy.board.placeFleetRandomly();
    let shots = 0;
    while (!enemy.board.allSunk() && shots < 100) {
      computer.attack(enemy.board);
      shots++;
    }
    expect(enemy.board.allSunk()).toBe(true);
  });
});
