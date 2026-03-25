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

/**
 * conditions に指定した変数が閾値以上になる確率を % で返す（多項分布）
 * conditions 例: { x: 2, z: 1 } → x>=2 かつ z>=1
 * 指定なしの変数は制約なし (>=0)
 */
export function getConditionalProbability(n, conditions) {
  const minX = conditions.x ?? 0
  const minY = conditions.y ?? 0
  const minZ = conditions.z ?? 0

  return getAllCombinations(n)
    .filter(([x, y, z]) => x >= minX && y >= minY && z >= minZ)
    .reduce((sum, [x, y, z]) => sum + getCombinationProbability(n, x, y, z), 0)
}
