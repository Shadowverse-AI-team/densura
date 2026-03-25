import {
  getTotalCombinations,
  getAllCombinations,
  getCombinationProbability,
  getConditionalProbability,
} from './calculator.js'

const MAX_N = 30
const BAR_SCALE = 160 // px: 最大バー幅

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
    document.querySelectorAll('.tab').forEach(t => {
      t.classList.remove('active')
      t.setAttribute('aria-selected', 'false')
    })
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'))
    tab.classList.add('active')
    tab.setAttribute('aria-selected', 'true')
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
  return isNaN(v) || v < 0 ? 0 : Math.min(v, MAX_N)
}

function setText(el, text) {
  el.textContent = text
}

function makeEl(tag, { cls, text, style } = {}) {
  const el = document.createElement(tag)
  if (cls) el.className = cls
  if (text !== undefined) el.textContent = text
  if (style) Object.assign(el.style, style)
  return el
}

function renderAll(n, combos) {
  const total = getTotalCombinations(n)
  const maxProb = combos.reduce(
    (max, [x, y, z]) => Math.max(max, getCombinationProbability(n, x, y, z)),
    0
  )

  setText(totalInfo, `総パターン数: ${total} 通り`)

  // summary
  const summaryBox = makeEl('div', { cls: 'summary-box' })
  const itemN = makeEl('div', { cls: 'summary-item' })
  itemN.append(makeEl('span', { text: 'n' }), makeEl('span', { text: String(n) }))
  const itemTotal = makeEl('div', { cls: 'summary-item' })
  itemTotal.append(makeEl('span', { text: '総パターン数' }), makeEl('span', { text: `${total} 通り` }))
  summaryBox.append(itemN, itemTotal)

  // table
  const table = makeEl('table')
  const thead = makeEl('thead')
  const headerRow = makeEl('tr')
  ;['#', 'x', 'y', 'z', '確率'].forEach(h => headerRow.append(makeEl('th', { text: h })))
  thead.append(headerRow)

  const tbody = makeEl('tbody')
  combos.forEach(([x, y, z], i) => {
    const prob = getCombinationProbability(n, x, y, z)
    const barW = Math.max((prob / maxProb) * BAR_SCALE, 2)
    const tr = makeEl('tr')
    const probCell = makeEl('td')
    probCell.append(
      document.createTextNode(`${prob.toFixed(3)}%`),
      makeEl('span', { cls: 'prob-bar', style: { width: `${barW.toFixed(1)}px` } })
    )
    ;[i + 1, x, y, z].forEach(v => tr.append(makeEl('td', { text: String(v) })))
    tr.append(probCell)
    tbody.append(tr)
  })
  table.append(thead, tbody)

  const tableWrapper = makeEl('div', { cls: 'table-wrapper' })
  tableWrapper.append(table)

  allResult.replaceChildren(summaryBox, tableWrapper)
}

function updateCond(n, combos) {
  const conditions = {
    ...(chkX.checked ? { x: Math.max(0, parseInt(valX.value, 10) || 0) } : {}),
    ...(chkY.checked ? { y: Math.max(0, parseInt(valY.value, 10) || 0) } : {}),
    ...(chkZ.checked ? { z: Math.max(0, parseInt(valZ.value, 10) || 0) } : {}),
  }

  const total = getTotalCombinations(n)
  const prob = getConditionalProbability(n, conditions)
  const matchedCount = combos.filter(([x, y, z]) => {
    if ('x' in conditions && x < conditions.x) return false
    if ('y' in conditions && y < conditions.y) return false
    if ('z' in conditions && z < conditions.z) return false
    return true
  }).length

  const condText = Object.entries(conditions)
    .map(([k, v]) => `${k} ≥ ${v}`)
    .join('  かつ  ')

  const infoEl = makeEl('div', { cls: 'sub-info', text: condText || '条件なし（全パターン）' })
  const probEl = makeEl('div', { cls: 'big-prob', text: `${prob.toFixed(2)}%` })
  const countEl = makeEl('div', { cls: 'sub-info', text: `${matchedCount} / ${total} パターン` })
  condResult.replaceChildren(infoEl, probEl, countEl)
}

function update() {
  const n = getN()
  const combos = getAllCombinations(n) // 1回だけ取得して両方に渡す
  renderAll(n, combos)
  updateCond(n, combos)
}

nInput.addEventListener('input', update)
update()
