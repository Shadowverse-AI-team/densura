import { describe, it, expect } from 'vitest'
import {
  getTotalCombinations,
  getAllCombinations,
  getCombinationProbability,
  getConditionalProbability,
} from '../calculator.js'

// --- getTotalCombinations ---
describe('getTotalCombinations(n)', () => {
  it('n=0 のとき 1 通り', () => expect(getTotalCombinations(0)).toBe(1))
  it('n=1 のとき 3 通り', () => expect(getTotalCombinations(1)).toBe(3))
  it('n=2 のとき 6 通り', () => expect(getTotalCombinations(2)).toBe(6))
  it('n=4 のとき 15 通り', () => expect(getTotalCombinations(4)).toBe(15))
  it('n が負のとき 0 を返す', () => expect(getTotalCombinations(-1)).toBe(0))
})

// --- getAllCombinations ---
describe('getAllCombinations(n)', () => {
  it('n=0 のとき [(0,0,0)] を返す', () => {
    expect(getAllCombinations(0)).toEqual([[0, 0, 0]])
  })
  it('n=1 のとき 3 パターン返す', () => {
    const result = getAllCombinations(1)
    expect(result).toHaveLength(3)
    expect(result).toContainEqual([0, 0, 1])
    expect(result).toContainEqual([0, 1, 0])
    expect(result).toContainEqual([1, 0, 0])
  })
  it('全パターンが x+y+z=n を満たす', () => {
    getAllCombinations(5).forEach(([x, y, z]) => expect(x + y + z).toBe(5))
  })
  it('パターン数が getTotalCombinations と一致', () => {
    for (const n of [0, 1, 2, 3, 4, 6]) {
      expect(getAllCombinations(n)).toHaveLength(getTotalCombinations(n))
    }
  })
})

// --- getCombinationProbability (多項分布) ---
describe('getCombinationProbability(n, x, y, z)', () => {
  it('n=0: (0,0,0) = 100%', () => {
    expect(getCombinationProbability(0, 0, 0, 0)).toBeCloseTo(100, 5)
  })
  it('n=1: (1,0,0) = 33.33%', () => {
    // P = 1!/(1!0!0!) * (1/3)^1 = 1/3
    expect(getCombinationProbability(1, 1, 0, 0)).toBeCloseTo(100 / 3, 3)
  })
  it('n=2: (1,1,0) = 22.22%', () => {
    // P = 2!/(1!1!0!) * (1/3)^2 = 2/9
    expect(getCombinationProbability(2, 1, 1, 0)).toBeCloseTo((2 / 9) * 100, 3)
  })
  it('n=2: (2,0,0) = 11.11%', () => {
    // P = 2!/(2!0!0!) * (1/3)^2 = 1/9
    expect(getCombinationProbability(2, 2, 0, 0)).toBeCloseTo((1 / 9) * 100, 3)
  })
  it('全確率の和が 100% になる (n=4)', () => {
    const total = getAllCombinations(4).reduce(
      (sum, [x, y, z]) => sum + getCombinationProbability(4, x, y, z),
      0
    )
    expect(total).toBeCloseTo(100, 5)
  })
  it('全確率の和が 100% になる (n=10)', () => {
    const total = getAllCombinations(10).reduce(
      (sum, [x, y, z]) => sum + getCombinationProbability(10, x, y, z),
      0
    )
    expect(total).toBeCloseTo(100, 5)
  })
  it('x+y+z≠n の場合 0 を返す', () => {
    expect(getCombinationProbability(3, 1, 1, 0)).toBe(0)
  })
  it('n が負のとき 0 を返す', () => {
    expect(getCombinationProbability(-1, 0, 0, 0)).toBe(0)
  })
})

// --- getConditionalProbability (スプレッドシートの値で検証) ---
describe('getConditionalProbability(n, conditions)', () => {
  it('条件なし → 100%', () => {
    expect(getConditionalProbability(8, {})).toBeCloseTo(100, 3)
  })
  it('n=8, x≥2 → ~80%', () => {
    expect(getConditionalProbability(8, { x: 2 })).toBeCloseTo(80.49, 0)
  })
  it('n=8, x≥3 → ~53%', () => {
    expect(getConditionalProbability(8, { x: 3 })).toBeCloseTo(53.14, 0)
  })
  it('n=8, x≥4 → ~26%', () => {
    expect(getConditionalProbability(8, { x: 4 })).toBeCloseTo(25.78, 0)
  })
  it('n=8, x≥5 → ~9%（スプレッドシートと一致）', () => {
    expect(getConditionalProbability(8, { x: 5 })).toBeCloseTo(8.79, 0)
  })
  it('n=8, x≥6 → ~2%', () => {
    expect(getConditionalProbability(8, { x: 6 })).toBeCloseTo(1.96, 0)
  })
  it('n=12, x≥5 → ~37%（スプレッドシートと一致）', () => {
    expect(getConditionalProbability(12, { x: 5 })).toBeCloseTo(36.85, 0)
  })
  it('n=15, x≥6 → ~38%', () => {
    expect(getConditionalProbability(15, { x: 6 })).toBeCloseTo(38.38, 0)
  })
  it('n=4, x≥5 → 0% (不可能)', () => {
    expect(getConditionalProbability(4, { x: 5 })).toBeCloseTo(0, 5)
  })
  it('x≥0 かつ y≥0 かつ z≥0 → 100%', () => {
    expect(getConditionalProbability(6, { x: 0, y: 0, z: 0 })).toBeCloseTo(100, 3)
  })
})
