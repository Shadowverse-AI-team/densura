import { describe, it, expect } from 'vitest'
import {
  getTotalCombinations,
  getAllCombinations,
  getCombinationProbability,
  getConditionalProbability,
  getMatchingCombinations,
  matchesConditions,
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

// --- matchesConditions (下限・上限の AND) ---
describe('matchesConditions(combo, conditions)', () => {
  it('条件なしなら常に true', () => {
    expect(matchesConditions([1, 2, 3])).toBe(true)
    expect(matchesConditions([1, 2, 3], {})).toBe(true)
  })
  it('数値指定は下限として扱う（後方互換）', () => {
    expect(matchesConditions([2, 0, 0], { x: 2 })).toBe(true)
    expect(matchesConditions([1, 1, 0], { x: 2 })).toBe(false)
  })
  it('max のみ指定 → 以下の判定', () => {
    expect(matchesConditions([1, 1, 0], { x: { max: 1 } })).toBe(true)
    expect(matchesConditions([2, 0, 0], { x: { max: 1 } })).toBe(false)
  })
  it('min と max の両方 → 範囲判定（境界を含む）', () => {
    const cond = { x: { min: 1, max: 3 } }
    expect(matchesConditions([0, 4, 0], cond)).toBe(false)
    expect(matchesConditions([1, 3, 0], cond)).toBe(true)
    expect(matchesConditions([3, 1, 0], cond)).toBe(true)
    expect(matchesConditions([4, 0, 0], cond)).toBe(false)
  })
  it('複数変数は AND で結合される', () => {
    const cond = { x: { min: 1 }, z: { max: 1 } }
    expect(matchesConditions([1, 2, 1], cond)).toBe(true)
    expect(matchesConditions([0, 2, 2], cond)).toBe(false)
    expect(matchesConditions([1, 1, 2], cond)).toBe(false)
  })
  it('下限 > 上限 なら常に false', () => {
    expect(matchesConditions([2, 0, 0], { x: { min: 3, max: 1 } })).toBe(false)
  })
})

// --- getMatchingCombinations ---
describe('getMatchingCombinations(n, conditions)', () => {
  it('条件なしなら全パターン', () => {
    expect(getMatchingCombinations(4)).toHaveLength(getTotalCombinations(4))
  })
  it('n=2, x≤1 → (2,0,0) 以外の 5 パターン', () => {
    const result = getMatchingCombinations(2, { x: { max: 1 } })
    expect(result).toHaveLength(5)
    expect(result).not.toContainEqual([2, 0, 0])
  })
  it('n=4, 1≤x≤2 → x が 1 か 2 のパターンのみ', () => {
    const result = getMatchingCombinations(4, { x: { min: 1, max: 2 } })
    expect(result.every(([x]) => x >= 1 && x <= 2)).toBe(true)
    expect(result).toHaveLength(4 + 3) // x=1 が 4 通り, x=2 が 3 通り
  })
  it('下限 > 上限 → 0 パターン', () => {
    expect(getMatchingCombinations(5, { x: { min: 4, max: 2 } })).toHaveLength(0)
  })
})

// --- getConditionalProbability: 上限・範囲指定 ---
describe('getConditionalProbability: 以下・範囲条件', () => {
  it('n=2, x≤1 → 88.89%（(2,0,0) の 1/9 を除いた分）', () => {
    expect(getConditionalProbability(2, { x: { max: 1 } })).toBeCloseTo((8 / 9) * 100, 5)
  })
  it('n=4, 1≤x≤2 → 69.14%', () => {
    // P(x=1)=32/81, P(x=2)=24/81
    expect(getConditionalProbability(4, { x: { min: 1, max: 2 } })).toBeCloseTo((56 / 81) * 100, 5)
  })
  it('x≤n は制約なしと同じ 100%', () => {
    expect(getConditionalProbability(6, { x: { max: 6 } })).toBeCloseTo(100, 5)
  })
  it('P(x≥k) と P(x≤k-1) の和が 100%', () => {
    const a = getConditionalProbability(8, { x: { min: 3 } })
    const b = getConditionalProbability(8, { x: { max: 2 } })
    expect(a + b).toBeCloseTo(100, 5)
  })
  it('x と z の範囲を AND で組み合わせられる', () => {
    // n=4, 1≤x≤2 かつ z≤1 → (1,2,1)(1,3,0)(2,1,1)(2,2,0)
    const expected =
      getCombinationProbability(4, 1, 2, 1) +
      getCombinationProbability(4, 1, 3, 0) +
      getCombinationProbability(4, 2, 1, 1) +
      getCombinationProbability(4, 2, 2, 0)
    expect(
      getConditionalProbability(4, { x: { min: 1, max: 2 }, z: { max: 1 } })
    ).toBeCloseTo(expected, 5)
  })
  it('下限 > 上限 → 0%', () => {
    expect(getConditionalProbability(5, { x: { min: 4, max: 2 } })).toBeCloseTo(0, 5)
  })
})
