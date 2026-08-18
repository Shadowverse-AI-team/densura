/**
 * x + y + z = n (x,y,z >= 0) の整数解の総数を返す
 * 公式: C(n+2, 2) = (n+1)(n+2)/2
 */
export function getTotalCombinations(n) {
  if (n < 0) return 0
  return ((n + 1) * (n + 2)) / 2
}

/**
 * x + y + z = n を満たす全ての (x,y,z) の配列を返す
 */
export function getAllCombinations(n) {
  if (n < 0) return []
  const results = []
  for (let x = 0; x <= n; x++) {
    for (let y = 0; y <= n - x; y++) {
      results.push([x, y, n - x - y])
    }
  }
  return results
}

/**
 * 対数階乗（数値安定性のため）
 */
function logFactorial(n) {
  let sum = 0
  for (let i = 2; i <= n; i++) sum += Math.log(i)
  return sum
}

/**
 * 多項分布での各パターンの確率を % で返す
 * P(X=x, Y=y, Z=z) = n!/(x!y!z!) × (1/3)^n
 *
 * 各点が独立に 1/3 の確率で x/y/z いずれかに振り分けられるモデル
 */
export function getCombinationProbability(n, x, y, z) {
  if (n < 0 || x < 0 || y < 0 || z < 0 || x + y + z !== n) return 0
  const logProb =
    logFactorial(n) - logFactorial(x) - logFactorial(y) - logFactorial(z) - n * Math.log(3)
  return Math.exp(logProb) * 100
}

const VARS = ['x', 'y', 'z']

/**
 * 条件指定を { min, max } に正規化する
 * - undefined/null → 制約なし
 * - number         → 下限のみ（後方互換: { x: 2 } は x>=2）
 * - { min, max }   → 省略した側は制約なし
 */
function normalizeCondition(cond) {
  if (cond === undefined || cond === null) return { min: 0, max: Infinity }
  if (typeof cond === 'number') return { min: cond, max: Infinity }
  return { min: cond.min ?? 0, max: cond.max ?? Infinity }
}

/**
 * combo が conditions（AND 条件）をすべて満たすか判定する
 * conditions 例: { x: { min: 2, max: 5 }, z: 1 } → 2<=x<=5 かつ z>=1
 */
export function matchesConditions([x, y, z], conditions = {}) {
  const values = { x, y, z }
  return VARS.every(key => {
    const { min, max } = normalizeCondition(conditions[key])
    return values[key] >= min && values[key] <= max
  })
}

/**
 * conditions を満たす (x,y,z) の配列を返す
 */
export function getMatchingCombinations(n, conditions = {}) {
  return getAllCombinations(n).filter(combo => matchesConditions(combo, conditions))
}

/**
 * conditions を満たす確率を % で返す（多項分布）
 * 指定なしの変数は制約なし
 */
export function getConditionalProbability(n, conditions = {}) {
  return getMatchingCombinations(n, conditions).reduce(
    (sum, [x, y, z]) => sum + getCombinationProbability(n, x, y, z),
    0
  )
}
