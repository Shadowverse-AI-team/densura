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

// ソート状態: col = 'index'|'x'|'y'|'z'|'prob', dir = 1(昇順) | -1(降順)
let sortState = { col: null, dir: 1 }

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

// チェックボックスで入力欄の有効/無効、変更のたびに即計算
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

function makeEl(tag, { cls, text, style } = {}) {
  const el = document.createElement(tag)
  if (cls) el.className = cls
  if (text !== undefined) el.textContent = text
  if (style) Object.assign(el.style, style)
  return el
}

// colKey でソートした combos（元のインデックス付き）を返す
function sortedCombos(combos, n) {
  const { col, dir } = sortState
  if (!col) return combos.map((c, i) => ({ combo: c, index: i }))

  return combos
    .map((c, i) => ({ combo: c, index: i, prob: getCombinationProbability(n, ...c) }))
    .sort((a, b) => {
      let va, vb
      if (col === 'index') { va = a.index; vb = b.index }
      else if (col === 'x')    { va = a.combo[0]; vb = b.combo[0] }
      else if (col === 'y')    { va = a.combo[1]; vb = b.combo[1] }
      else if (col === 'z')    { va = a.combo[2]; vb = b.combo[2] }
      else                     { va = a.prob;     vb = b.prob }
      return (va - vb) * dir
    })
}

function renderAll() {
  const n = getN()
  const combos = getAllCombinations(n)
  const total = getTotalCombinations(n)
  const maxProb = combos.reduce(
    (max, [x, y, z]) => Math.max(max, getCombinationProbability(n, x, y, z)),
    0
  )

  totalInfo.textContent = `総パターン数: ${total} 通り`

  // summary
  const summaryBox = makeEl('div', { cls: 'summary-box' })
  const itemN = makeEl('div', { cls: 'summary-item' })
  itemN.append(makeEl('span', { text: 'n' }), makeEl('span', { text: String(n) }))
  const itemTotal = makeEl('div', { cls: 'summary-item' })
  itemTotal.append(makeEl('span', { text: '総パターン数' }), makeEl('span', { text: `${total} 通り` }))
  summaryBox.append(itemN, itemTotal)

  // table headers with sort
  const COLS = [
    { label: '#',  key: 'index' },
    { label: 'x',  key: 'x' },
    { label: 'y',  key: 'y' },
    { label: 'z',  key: 'z' },
    { label: '確率', key: 'prob' },
  ]

  const table = makeEl('table')
  const thead = makeEl('thead')
  const headerRow = makeEl('tr')

  COLS.forEach(({ label, key }) => {
    const th = makeEl('th')
    th.style.cursor = 'pointer'
    th.style.userSelect = 'none'
    const arrow = sortState.col === key ? (sortState.dir === 1 ? ' ▲' : ' ▼') : ''
    th.textContent = label + arrow
    th.addEventListener('click', () => {
      if (sortState.col === key) {
        sortState = { col: key, dir: sortState.dir * -1 }
      } else {
        sortState = { col: key, dir: 1 }
      }
      renderAll()
    })
    headerRow.append(th)
  })
  thead.append(headerRow)

  // sorted rows
  const tbody = makeEl('tbody')
  sortedCombos(combos, n).forEach(({ combo: [x, y, z], index, prob: cachedProb }) => {
    const prob = cachedProb ?? getCombinationProbability(n, x, y, z)
    const barW = Math.max((prob / maxProb) * BAR_SCALE, 2)
    const tr = makeEl('tr')
    const probCell = makeEl('td')
    probCell.append(
      document.createTextNode(`${prob.toFixed(3)}%`),
      makeEl('span', { cls: 'prob-bar', style: { width: `${barW.toFixed(1)}px` } })
    )
    ;[index + 1, x, y, z].forEach(v => tr.append(makeEl('td', { text: String(v) })))
    tr.append(probCell)
    tbody.append(tr)
  })
  table.append(thead, tbody)

  const tableWrapper = makeEl('div', { cls: 'table-wrapper' })
  tableWrapper.append(table)

  allResult.replaceChildren(summaryBox, tableWrapper)
}

function updateCond() {
  const n = getN()
  const combos = getAllCombinations(n)
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
  renderAll()
  updateCond()
}

nInput.addEventListener('input', update)
update()
