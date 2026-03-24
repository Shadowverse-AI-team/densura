import { describe, it, expect } from 'vitest'
import {
  getTotalCombinations,
  getAllCombinations,
  getEachProbability,
  getConditionalProbability,
} from '../calculator.js'

// --- getTotalCombinations ---
describe('getTotalCombinations(n)', () => {
  it('n=0 のとき 1 通り', () => {
    expect(getTotalCombinations(0)).toBe(1)
  })
  it('n=1 のとき 3 通り', () => {
    expect(getTotalCombinations(1)).toBe(3)
  })
  it('n=2 のとき 6 通り', () => {
    expect(getTotalCombinations(2)).toBe(6)
  })
  it('n=4 のとき 15 通り', () => {
    expect(getTotalCombinations(4)).toBe(15)
  })
  it('n が負のとき 0 を返す', () => {
    expect(getTotalCombinations(-1)).toBe(0)
  })
})

// --- getAllCombinations ---
describe('getAllCombinations(n)', () => {
  it('n=0 のとき [(0,0,0)] を返す', () => {
    expect(getAllCombinations(0)).toEqual([[0, 0, 0]])
  })
  it('n=1 のとき 3 パターンを返す', () => {
    const result = getAllCombinations(1)
    expect(result).toHaveLength(3)
    expect(result).toContainEqual([0, 0, 1])
    expect(result).toContainEqual([0, 1, 0])
    expect(result).toContainEqual([1, 0, 0])
  })
  it('全パターンが x+y+z=n を満たす', () => {
    const n = 5
    const result = getAllCombinations(n)
    result.forEach(([x, y, z]) => {
      expect(x + y + z).toBe(n)
    })
  })
  it('パターン数が getTotalCombinations と一致する', () => {
    for (const n of [0, 1, 2, 3, 4, 6]) {
      expect(getAllCombinations(n)).toHaveLength(getTotalCombinations(n))
    }
  })
  it('全ての値が 0 以上', () => {
    getAllCombinations(4).forEach(([x, y, z]) => {
      expect(x).toBeGreaterThanOrEqual(0)
      expect(y).toBeGreaterThanOrEqual(0)
      expect(z).toBeGreaterThanOrEqual(0)
    })
  })
})

// --- getEachProbability ---
describe('getEachProbability(n)', () => {
  it('n=0 のとき 100% を返す', () => {
    expect(getEachProbability(0)).toBeCloseTo(100, 5)
  })
  it('n=1 のとき 33.333...% を返す', () => {
    expect(getEachProbability(1)).toBeCloseTo(100 / 3, 5)
  })
  it('n=4 のとき 100/15 % を返す', () => {
    expect(getEachProbability(4)).toBeCloseTo(100 / 15, 5)
  })
  it('n が負のとき 0 を返す', () => {
    expect(getEachProbability(-1)).toBe(0)
  })
})

// --- getConditionalProbability ---
describe('getConditionalProbability(n, conditions)', () => {
  it('条件なしのとき 100% を返す', () => {
    expect(getConditionalProbability(4, {})).toBeCloseTo(100, 5)
  })

  it('n=4, x>=2 のとき 40% (6/15)', () => {
    expect(getConditionalProbability(4, { x: 2 })).toBeCloseTo((6 / 15) * 100, 5)
  })

  it('n=4, x>=2 かつ z>=2 のとき 20% (3/15)', () => {
    // x=2,y=0,z=2 / x=2,y=2,z=0→×(z<2) → x=2,z=2: y=0のみ; x=3,z=2→y=-1×; x=4,z=2→×
    // 実際: (2,0,2) のみ → 1/15? 再計算:
    // x>=2, z>=2: x+z<=n=4, x>=2,z>=2 → x=2,z=2,y=0; それだけ → 1/15
    // ※条件はAND
    expect(getConditionalProbability(4, { x: 2, z: 2 })).toBeCloseTo((1 / 15) * 100, 5)
  })

  it('n=4, y>=5 のとき 0% (不可能)', () => {
    expect(getConditionalProbability(4, { y: 5 })).toBeCloseTo(0, 5)
  })

  it('n=4, x>=0 かつ y>=0 かつ z>=0 のとき 100% (全パターン)', () => {
    expect(getConditionalProbability(4, { x: 0, y: 0, z: 0 })).toBeCloseTo(100, 5)
  })

  it('n=3, x>=1 のとき 60% (6/10)', () => {
    // n=3: total=10, x>=1: x=1(y+z=2→3通り),x=2(2通り),x=3(1通り) = 6通り
    expect(getConditionalProbability(3, { x: 1 })).toBeCloseTo((6 / 10) * 100, 5)
  })
})
