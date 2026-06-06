import { add, subtract } from '../lib/utils';

describe('Utility functions', () => {
  test('add function should return the sum of two numbers', () => {
    expect(add(1, 2)).toBe(3);
    expect(add(-1, 1)).toBe(0);
    expect(add(0, 0)).toBe(0);
  });

  test('subtract function should return the difference of two numbers', () => {
    expect(subtract(2, 1)).toBe(1);
    expect(subtract(1, 1)).toBe(0);
    expect(subtract(0, 1)).toBe(-1);
  });
});