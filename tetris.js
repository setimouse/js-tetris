let canvas = document.getElementById('game');
let ctx = canvas.getContext('2d');

 // canvas size
let { width: c_width, height: c_height } = canvas.getBoundingClientRect();
const COL = 10;
const b_size = c_width / COL; // block size
const line_count = Math.floor(c_height / b_size); // line count
let gameOver = false;

let space = new Array(line_count).fill(0);
const tetrominos = [
  [0b11, 0b11],           // O
  [0b111, 0b010, 0b000],  // T
  [0b011, 0b110, 0b000],  // S
  [0b110, 0b011, 0b000],  // Z
  [0b010, 0b010, 0b011],  // L
  [0b010, 0b010, 0b110],  // J
  [0b0000, 0b1111, 0b0000, 0b0000], // I
];

// check collided
function collided(mino) {
  for (let i = 0; i < space.length; i++) {
    if ((space[i] & mino[i]) > 0) {
      return true;
    }
  }
  return false;
}

// stick tetromino into space
function stick(tetromino) {
  const full_line = (1 << COL) - 1
  for (let i = 0; i < space.length; i++) {
    space[i] |= tetromino[i];
    if (space[i] === full_line) {
      space[i] = 0;
    }
  }
  const r = space.filter(e => e > 0);
  space = [...new Array(line_count - r.length), ...r];
  t = newTetromino();
}

class Tetromino {
  constructor(t) {
    this.x = Math.floor(COL / 2) + 1;
    this.y = 0;
    this.tetromino = [...t];
    this._put();
  }

  _put() {
    this.mino = [
      ...new Array(this.y).fill(0),
      ...this.tetromino.map(e => e << (COL - this.x)),
      ...new Array(line_count - this.tetromino.length - this.y).fill(0)
    ]
  }

  _canLeft() {
    if (this.mino.filter(e => e & (0b1 << (COL - 1))).length > 0) {
      return false;
    }
    const mino = this.mino.map(e => e << 1);
    if (collided(mino)) {
      return false;
    }
    return mino;
  }

  _canRight() {
    if (this.mino.filter(e => e & 1).length > 0) {
      return false;
    }
    const mino = this.mino.map(e => e >> 1);
    if (collided(mino)) {
      return false;
    }
    return mino;
  }

  _canDown() {
    if (this.mino[line_count - 1] > 0) {
      return false;
    }
    const mino = [0, ...this.mino.slice(0, line_count - 1)];
    if (collided(mino)) {
      return false;
    }
    return mino;
  }

  moveLeft() {
    const mino = this._canLeft();
    if (mino === false || collided(mino)) {
      return this;
    }
    this.mino = mino;
    this.x--;
    return this;
  }

  moveRight() {
    const mino = this._canRight();
    if (mino === false || collided(mino)) {
      return this;
    }
    this.mino = mino;
    this.x++;
    return this;
  }

  down() {
    const mino = this._canDown()
    if (false === mino) {
      gameOver = this.y === 0;
      stick(this.mino)
      return this;
    }
    this.mino = mino;
    this.y++;
    return this;
  }

  rotate() {
    const size = this.tetromino.length;
    let t = Array(size).fill(0);
    for (let i = 0; i < size; i++) {
      const e = this.tetromino[i];
      for (let j = 0; j < size; j++) {
        const b = (e >> (size - j - 1)) & 1;
        t[j] = (b << i) | t[j];
      }
    }
    while (t[0] === 0) {
      t = [...t.slice(1, t.length), 0]
    }
    this.tetromino = [...t];
    this._put();
    return this;
  }
}

function newTetromino() {
  const rand = Math.floor(Math.random() * tetrominos.length);
  return new Tetromino(tetrominos[rand]);
}

let t = newTetromino();

function render() {
  renderSpace();
  renderTetromino(t);
  if (gameOver) {
    renderGameover();
  }
  requestAnimationFrame(render);
}

const bgColor = 'rgb(158, 173, 134)';
const bgBlock = 'rgba(0,0,0,.854)';
const fgBlock = 'rgba(0,0,0,.146)';

render();

function renderGameover() {
  ctx.save();
  ctx.font = "40px Arial bold italic";
  ctx.textBaseline = "bottom";
  ctx.textAlign = 'center';
  ctx.fillText("Game Over", c_width / 2, c_height / 2);
  ctx.strokeStyle = "#fff";
  ctx.strokeText("Game Over", c_width / 2, c_height / 2);
  ctx.restore();
}

function renderBox(x, y) {
  const padding = 2, innerPadding = 5;
  ctx.strokeRect(x * b_size + padding, y * b_size + padding, b_size - padding * 2, b_size - padding * 2);
  ctx.fillRect(x * b_size + innerPadding, y * b_size + innerPadding, b_size - innerPadding * 2, b_size - innerPadding * 2);
}

function renderSpace() {
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, c_width, c_height);
  for (let y = 0; y < space.length; y++) {
    for (let x = 0; x < COL; x++) {
      ctx.save();
      if (space[y] >> (COL - x - 1) & 1 > 0) {
        ctx.fillStyle = bgBlock;
        ctx.strokeStyle = bgBlock;
        renderBox(x, y);
      } else {
        ctx.strokeStyle = fgBlock;
        ctx.fillStyle = fgBlock;
        renderBox(x, y);
      }
      ctx.restore();
    }
  }
}

function renderTetromino(tetromino) {
  ctx.save();
  ctx.strokeStyle = bgBlock;
  ctx.fillStyle = bgBlock;
  for (let y = 0; y < tetromino.mino.length; y++) {
    for (let x = 0; x < COL; x++) {
      if ((1 << x) & tetromino.mino[y])
        renderBox(COL - x - 1, y);
    }
  }
  ctx.restore();
}

window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'r':
    case 'R':
      reset();
      break;
  }
  if (gameOver) return;
  switch (e.key) {
    case 'ArrowDown':
      t.down();
      break;
    case 'ArrowLeft':
      t.moveLeft();
      break;
    case 'ArrowRight':
      t.moveRight();
      break;
    case 'ArrowUp':
      t.rotate();
      break;
  }
});

function tick() {
  if (!gameOver) {
    t.down();
  }
}

setInterval(tick, 1000);

function reset() {
  gameOver = false;
  space = new Array(line_count).fill(0);
  t = newTetromino();
}

reset();