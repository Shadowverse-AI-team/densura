import {
  getTotalCombinations,
  getAllCombinations,
  getEachProbability,
  getConditionalProbability,
} from './calculator.js'

const nInput = document.getElementById('n-input')
const totalInfo = document.getElementById('total-info')
const allResult = document.getElementById('all-result')
const condResult = document.getElementById('cond-result')

const chkX = document.getElementById('chk-x')
const chkY = document.getElementById('chk-y')
const chkZ = document.getElementById('chk-z')
const valX = document.getElementById('val-x')
const valY = document.getElementById('val-y')
const valZ = document.getElementById('val-z')

// タブ切り替え
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'))
    tab.classList.add('active')
    document.getElementById(`tab-${tab.dataset.tab}`).classList.remove('hidden')
  })
})

// チェックボックスで入力欄の有効/無効
;[[chkX, valX], [chkY, valY], [chkZ, valZ]].forEach(([chk, val]) => {
  chk.addEventListener('change', () => {
    val.disabled = !chk.checked
    updateCond()
  })
  val.addEventListener('input', updateCond)
})

function getN() {
  const v = parseInt(nInput.value, 10)
  return isNaN(v) || v < 0 ? 0 : Math.min(v, 30)
}

function renderAll(n) {
  const total = getTotalCombinations(n)
  const prob = getEachProbability(n)
  const combos = getAllCombinations(n)
  const barScale = 200

  totalInfo.textContent = `総パターン数: ${total} 通り`

  let html = `
    <div class="summary-box">
      <div class="summary-item"><span>n</span><span>${n}</span></div>
      <div class="summary-item"><span>総パターン数</span><span>${total} 通り</span></div>
      <div class="summary-item"><span>各パターンの確率</span><span>${prob.toFixed(3)} %</span></div>
    </div>
    <div class="table-wrapper">
      <table>
        <thead><tr><th>#</th><th>x</th><th>y</th><th>z</th><th>確率</th></tr></thead>
        <tbody>
  `
  combos.forEach(([x, y, z], i) => {
    const barW = Math.max(prob / 100 * barScale, 2).toFixed(1)
    html += `<tr>
      <td>${i + 1}</td><td>${x}</td><td>${y}</td><td>${z}</td>
      <td>${prob.toFixed(3)}%<span class="prob-bar" style="width:${barW}px"></span></td>
    </tr>`
  })
  html += '</tbody></table></div>'
  allResult.innerHTML = html
}

function updateCond() {
  const n = getN()
  const conditions = {}
  if (chkX.checked) conditions.x = Math.max(0, parseInt(valX.value, 10) || 0)
  if (chkY.checked) conditions.y = Math.max(0, parseInt(valY.value, 10) || 0)
  if (chkZ.checked) conditions.z = Math.max(0, parseInt(valZ.value, 10) || 0)

  const total = getTotalCombinations(n)
  const prob = getConditionalProbability(n, conditions)
  const all = getAllCombinations(n)
  const matched = all.filter(([x, y, z]) => {
    if ('x' in conditions && x < conditions.x) return false
    if ('y' in conditions && y < conditions.y) return false
    if ('z' in conditions && z < conditions.z) return false
    return true
  })

  const condText = Object.entries(conditions)
    .map(([k, v]) => `${k} ≥ ${v}`)
    .join('  かつ  ')

  condResult.innerHTML = `
    ${condText ? `<div class="sub-info">${condText}</div>` : '<div class="sub-info">条件なし（全パターン）</div>'}
    <div class="big-prob">${prob.toFixed(2)}%</div>
    <div class="sub-info">${matched.length} / ${total} パターン</div>
  `
}

function update() {
  const n = getN()
  renderAll(n)
  updateCond()
}

nInput.addEventListener('input', update)
update()
