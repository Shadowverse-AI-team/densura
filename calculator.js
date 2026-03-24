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
      const z = n - x - y
      results.push([x, y, z])
    }
  }
  return results
}

/**
 * 各パターンの確率を % で返す (全パターン等確率)
 */
export function getEachProbability(n) {
  if (n < 0) return 0
  return 100 / getTotalCombinations(n)
}

/**
 * conditions に指定した変数が閾値以上になる確率を % で返す
 * conditions 例: { x: 2, z: 1 } → x>=2 かつ z>=1
 * 指定なしの変数は制約なし (>=0)
 */
export function getConditionalProbability(n, conditions) {
  const all = getAllCombinations(n)
  const total = all.length
  if (total === 0) return 0

  const minX = conditions.x ?? 0
  const minY = conditions.y ?? 0
  const minZ = conditions.z ?? 0

  const matched = all.filter(([x, y, z]) => x >= minX && y >= minY && z >= minZ)
  return (matched.length / total) * 100
}
