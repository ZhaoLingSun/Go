const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const size = 19;
const spacing = 36;
const margin = 40;
const starPoints = [3, 9, 15];
const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];

let board = createBoard();
let currentPlayer = 1; // 1 black, 2 white
let moveHistory = [];
let historySet = new Set();
let blackCaptures = 0;
let whiteCaptures = 0;
let numberingMode = 'last'; // last, all, recent5

document.getElementById('currentPlayer').textContent = '黑';
document.getElementById('moveCount').textContent = '0';
document.getElementById('blackCaptures').textContent = '0';
document.getElementById('whiteCaptures').textContent = '0';
document.getElementById('numberingMode').textContent = '仅最后一手';

historySet.add(boardToString(board));

canvas.addEventListener('click', handleBoardClick);
document.getElementById('toggleSidebar').addEventListener('click', toggleSidebar);
document.getElementById('clearBoard').addEventListener('click', resetBoard);
document.getElementById('toggleNumbering').addEventListener('click', cycleNumbering);

function createBoard() {
  return Array.from({ length: size }, () => Array(size).fill(0));
}

function boardToString(target) {
  return target.flat().join('');
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
}

function resetBoard() {
  board = createBoard();
  currentPlayer = 1;
  moveHistory = [];
  historySet = new Set();
  historySet.add(boardToString(board));
  blackCaptures = 0;
  whiteCaptures = 0;
  updateStatus();
  drawBoard();
}

function cycleNumbering() {
  if (numberingMode === 'last') {
    numberingMode = 'all';
    document.getElementById('numberingMode').textContent = '显示全部手数';
  } else if (numberingMode === 'all') {
    numberingMode = 'recent5';
    document.getElementById('numberingMode').textContent = '显示最近5手';
  } else {
    numberingMode = 'last';
    document.getElementById('numberingMode').textContent = '仅最后一手';
  }
  drawBoard();
}

function handleBoardClick(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const col = Math.round((x - margin) / spacing);
  const row = Math.round((y - margin) / spacing);

  if (row < 0 || row >= size || col < 0 || col >= size) return;
  if (board[row][col] !== 0) return;

  const result = placeStone(row, col, currentPlayer);
  if (result.valid) {
    moveHistory.push({ row, col, color: currentPlayer });
    if (result.captured > 0) {
      if (currentPlayer === 1) {
        blackCaptures += result.captured;
      } else {
        whiteCaptures += result.captured;
      }
    }
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    updateStatus();
    drawBoard();
  }
}

function placeStone(row, col, player) {
  const tempBoard = board.map((r) => [...r]);
  tempBoard[row][col] = player;
  const opponent = player === 1 ? 2 : 1;

  const adjacent = getNeighbors(row, col);
  let totalCaptured = 0;

  for (const [r, c] of adjacent) {
    if (tempBoard[r][c] === opponent) {
      const group = collectGroup(tempBoard, r, c);
      if (group.liberties.size === 0) {
        for (const [gr, gc] of group.stones) {
          tempBoard[gr][gc] = 0;
        }
        totalCaptured += group.stones.size;
      }
    }
  }

  const ownGroup = collectGroup(tempBoard, row, col);
  if (ownGroup.liberties.size === 0) {
    return { valid: false, captured: 0 };
  }

  const positionKey = boardToString(tempBoard);
  if (historySet.has(positionKey)) {
    return { valid: false, captured: 0 };
  }

  board = tempBoard;
  historySet.add(positionKey);
  return { valid: true, captured: totalCaptured };
}

function collectGroup(tempBoard, row, col) {
  const color = tempBoard[row][col];
  const stack = [[row, col]];
  const visited = new Set();
  const liberties = new Set();
  const stones = new Set();

  while (stack.length) {
    const [r, c] = stack.pop();
    const key = `${r},${c}`;
    if (visited.has(key)) continue;
    visited.add(key);
    stones.add(key);

    for (const [nr, nc] of getNeighbors(r, c)) {
      if (tempBoard[nr][nc] === 0) {
        liberties.add(`${nr},${nc}`);
      } else if (tempBoard[nr][nc] === color) {
        stack.push([nr, nc]);
      }
    }
  }

  return { stones, liberties };
}

function getNeighbors(r, c) {
  const result = [];
  if (r > 0) result.push([r - 1, c]);
  if (r < size - 1) result.push([r + 1, c]);
  if (c > 0) result.push([r, c - 1]);
  if (c < size - 1) result.push([r, c + 1]);
  return result;
}

function updateStatus() {
  document.getElementById('currentPlayer').textContent = currentPlayer === 1 ? '黑' : '白';
  document.getElementById('moveCount').textContent = moveHistory.length;
  document.getElementById('blackCaptures').textContent = blackCaptures;
  document.getElementById('whiteCaptures').textContent = whiteCaptures;
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawStones();
}

function drawGrid() {
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--board-bg');
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--line-color');
  ctx.lineWidth = 1.4;
  const start = margin;
  const end = margin + spacing * (size - 1);

  for (let i = 0; i < size; i++) {
    const pos = start + spacing * i;
    ctx.beginPath();
    ctx.moveTo(start, pos);
    ctx.lineTo(end, pos);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(pos, start);
    ctx.lineTo(pos, end);
    ctx.stroke();
  }

  // Coordinates
  ctx.fillStyle = '#2a221a';
  ctx.font = '13px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let i = 0; i < size; i++) {
    const pos = start + spacing * i;
    ctx.fillText(letters[i], pos, start - 22);
    ctx.fillText(letters[i], pos, end + 22);
    ctx.fillText((size - i).toString(), start - 22, pos);
    ctx.fillText((size - i).toString(), end + 22, pos);
  }

  ctx.fillStyle = '#1f140b';
  for (const r of starPoints) {
    for (const c of starPoints) {
      ctx.beginPath();
      ctx.arc(start + spacing * c, start + spacing * r, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawStones() {
  const start = margin;
  const lastMove = moveHistory[moveHistory.length - 1];
  const numbering = computeNumberingMap();

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const value = board[r][c];
      if (value === 0) continue;
      const x = start + spacing * c;
      const y = start + spacing * r;

      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(x - 6, y - 6, 4, x, y, 16);
      if (value === 1) {
        gradient.addColorStop(0, '#555');
        gradient.addColorStop(1, getComputedStyle(document.documentElement).getPropertyValue('--black-stone'));
      } else {
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(1, '#dcdcdc');
      }
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.stroke();

      const label = numbering.get(`${r},${c}`);
      if (label) {
        ctx.fillStyle = value === 1 ? '#f7f7f7' : '#1a1a1a';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x, y);
      }

      if (lastMove && lastMove.row === r && lastMove.col === c) {
        ctx.strokeStyle = '#ef5d32';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }
}

function computeNumberingMap() {
  const map = new Map();
  if (numberingMode === 'last') {
    const last = moveHistory[moveHistory.length - 1];
    if (last) {
      map.set(`${last.row},${last.col}`, moveHistory.length.toString());
    }
    return map;
  }

  if (numberingMode === 'all') {
    moveHistory.forEach((move, index) => {
      map.set(`${move.row},${move.col}`, (index + 1).toString());
    });
    return map;
  }

  const start = Math.max(0, moveHistory.length - 5);
  for (let i = start; i < moveHistory.length; i++) {
    const move = moveHistory[i];
    map.set(`${move.row},${move.col}`, (i + 1).toString());
  }
  return map;
}

drawBoard();
