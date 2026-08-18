import {
  getTotalCombinations,
  getAllCombinations,
  getCombinationProbability,
  getConditionalProbability,
  getMatchingCombinations,
} from './calculator.js'

const MAX_N = 100
const BAR_SCALE = 160 // px: 最大バー幅

const nInput = document.getElementById('n-input')
const totalInfo = document.getElementById('total-info')
const allResult = document.getElementById('all-result')
const condResult = document.getElementById('cond-result')

const VARS = ['x', 'y', 'z']

// 各変数の下限/上限コントロール
const condInputs = Object.fromEntries(
  VARS.map(key => [
    key,
    {
      min: { chk: document.getElementById(`chk-${key}-min`), val: document.getElementById(`min-${key}`) },
      max: { chk: document.getElementById(`chk-${key}-max`), val: document.getElementById(`max-${key}`) },
    },
  ])
)

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

// 数値欄は常に編集可能。入力したらその条件を自動で有効化し、即計算する
function eachBound(fn) {
  VARS.forEach(key => Object.values(condInputs[key]).forEach(bound => fn(bound, key)))
}

// チェックが外れている条件はグレー表示にする（入力自体は妨げない）
function syncBoundStyles() {
  eachBound(({ chk, val }) => val.classList.toggle('inactive', !chk.checked))
}

eachBound(({ chk, val }) => {
  chk.addEventListener('change', () => {
    syncBoundStyles()
    updateCond()
  })
  val.addEventListener('input', () => {
    if (val.value !== '' && !chk.checked) chk.checked = true
    syncBoundStyles()
    updateCond()
  })
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

// チェックされている側だけを取り出して { min?, max? } を作る（両方未チェックなら null）
function readBounds(key) {
  const { min, max } = condInputs[key]
  const bounds = {}
  if (min.chk.checked) bounds.min = Math.max(0, parseInt(min.val.value, 10) || 0)
  if (max.chk.checked) bounds.max = Math.max(0, parseInt(max.val.value, 10) || 0)
  return 'min' in bounds || 'max' in bounds ? bounds : null
}

function formatBounds(key, { min, max }) {
  if (min !== undefined && max !== undefined) return `${min} ≤ ${key} ≤ ${max}`
  if (min !== undefined) return `${key} ≥ ${min}`
  return `${key} ≤ ${max}`
}

function updateCond() {
  const n = getN()
  const conditions = Object.fromEntries(
    VARS.map(key => [key, readBounds(key)]).filter(([, bounds]) => bounds !== null)
  )

  const total = getTotalCombinations(n)
  const prob = getConditionalProbability(n, conditions)
  const matchedCount = getMatchingCombinations(n, conditions).length

  const condText = Object.entries(conditions)
    .map(([key, bounds]) => formatBounds(key, bounds))
    .join('  かつ  ')

  const infoEl = makeEl('div', { cls: 'sub-info', text: condText || '条件なし（全パターン）' })
  const probEl = makeEl('div', { cls: 'big-prob', text: `${prob.toFixed(2)}%` })
  const countEl = makeEl('div', { cls: 'sub-info', text: `${matchedCount} / ${total} パターン` })

  const invalid = Object.entries(conditions).filter(
    ([, { min, max }]) => min !== undefined && max !== undefined && min > max
  )
  const children = [infoEl, probEl, countEl]
  if (invalid.length > 0) {
    const keys = invalid.map(([key]) => key).join('・')
    children.push(makeEl('div', { cls: 'warn-info', text: `${keys}: 下限が上限を上回っています` }))
  }

  condResult.replaceChildren(...children)
}

function update() {
  renderAll()
  syncBoundStyles()
  updateCond()
}

nInput.addEventListener('input', update)
update()
