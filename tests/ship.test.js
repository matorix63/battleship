import Ship from "../src/ship.js";

describe("Ship", () => {
  test("Ship is created with correct length", () => {
    const s = new Ship(4);
    expect(s.length).toBe(4);
  });

  test("Ship is created with 0 hits", () => {
    const s = new Ship(4);
    expect(s.hits).toBe(0);
  });

  test("Ship hit counter updates", () => {
    const s = new Ship(4);
    s.hit();
    s.hit();
    expect(s.hits).toBe(2);
  });

  test("Ship is not sunk when hit", () => {
    const s = new Ship(2);
    s.hit();
    expect(s.isSunk()).toEqual(false);
  });

  test("Ship is sunk when hit enough times", () => {
    const s = new Ship(2);
    s.hit();
    s.hit();
    expect(s.isSunk()).toEqual(true);
  });

  test("Ship isn't hit when sunk", () => {
    const s = new Ship(1);
    s.hit();
    s.hit();
    expect(s.hits).toBe(1);
  });

  test("Ship isn't created with 0 length", () => {
    expect(() => new Ship(0)).toThrow();
  });

  test("Ship isn't created with minus length", () => {
    expect(() => new Ship(-1)).toThrow();
  });

  test("Ship isn't created with decimal length", () => {
    expect(() => new Ship(2.5)).toThrow();
  });
});
