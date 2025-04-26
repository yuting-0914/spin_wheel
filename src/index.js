const sectors = [
  { color: "#FFBC03", text: "#333333", label: "韓式料理" },
  { color: "#FF5A10", text: "#333333", label: "中國料理" },
  { color: "#FFBC03", text: "#333333", label: "義式料理" },
  { color: "#FF5A10", text: "#333333", label: "日式料理" },
  { color: "#FFBC03", text: "#333333", label: "美式料理" },
  { color: "#FF5A10", text: "#333333", label: "泰式料理" },
  { color: "#FFBC03", text: "#333333", label: "印度料理" },
  { color: "#FF5A10", text: "#333333", label: "歐式料理" },
];

const events = {
  listeners: {},
  addListener: function (eventName, fn) {
    this.listeners[eventName] = this.listeners[eventName] || [];
    this.listeners[eventName].push(fn);
  },
  fire: function (eventName, ...args) {
    if (this.listeners[eventName]) {
      for (let fn of this.listeners[eventName]) {
        fn(...args);
      }
    }
  },
};

const rand = (m, M) => Math.random() * (M - m) + m;
const tot = sectors.length;
const spinEl = document.querySelector("#spin");
const ctx = document.querySelector("#wheel").getContext("2d");
let dia = ctx.canvas.width;
let rad = dia / 2;
const PI = Math.PI;
const TAU = 2 * PI;
const arc = TAU / sectors.length;

const friction = 0.991; // 0.995=soft, 0.99=mid, 0.98=hard
let angVel = 0; // Angular velocity
let ang = 0; // Angle in radians

let spinButtonClicked = false;

const getIndex = () => Math.floor(tot - (ang / TAU) * tot) % tot;

function drawSector(sector, i) {
  const ang = arc * i;
  ctx.save();

  // COLOR
  ctx.beginPath();
  ctx.fillStyle = sector.color;
  ctx.moveTo(rad, rad);
  ctx.arc(rad, rad, rad, ang, ang + arc);
  ctx.lineTo(rad, rad);
  ctx.fill();

  // TEXT
  ctx.translate(rad, rad);
  ctx.rotate(ang + arc / 2);
  ctx.textAlign = "right";
  ctx.fillStyle = sector.text;
  ctx.font = "bold 30px 'Lato', sans-serif";
  ctx.fillText(sector.label, rad - 10, 10);
  //

  ctx.restore();
}

function rotate() {
  const sector = sectors[getIndex()];
  ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;

  spinEl.textContent = !angVel ? "SPIN" : sector.label;
  spinEl.style.background = sector.color;
  spinEl.style.color = sector.text;
}

function frame() {
  // Fire an event after the wheel has stopped spinning
  if (!angVel && spinButtonClicked) {
    const finalSector = sectors[getIndex()];
    events.fire("spinEnd", finalSector);
    spinButtonClicked = false; // reset the flag
    return;
  }

  angVel *= friction; // Decrement velocity by friction
  if (angVel < 0.002) angVel = 0; // Bring to stop
  ang += angVel; // Update angle
  ang %= TAU; // Normalize angle
  rotate();
}

function engine() {
  frame();
  requestAnimationFrame(engine);
}

function resizeCanvas() {
  const canvas = ctx.canvas;
  const spinButton = document.querySelector("#spin");
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const safeHeight = vh - 100; // 扣掉100px作為保護
  const size = Math.min(vw * 0.8, safeHeight * 0.8, 800); // 安全尺寸！

  canvas.width = size;
  canvas.height = size;

  dia = size;
  rad = dia / 2;

  spinButton.style.width = size * 0.3 + "px";
  spinButton.style.height = size * 0.3 + "px";
}

function init() {
  resizeCanvas(); // 先根據螢幕大小設定 canvas
  sectors.forEach(drawSector);
  rotate(); // Initial rotation
  engine(); // Start engine
  spinEl.addEventListener("click", () => {
    if (!angVel) angVel = rand(0.25, 0.45);
    spinButtonClicked = true;
  });
  window.addEventListener("resize", () => {
    resizeCanvas();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    sectors.forEach(drawSector);
    rotate();
  });
}

init();

events.addListener("spinEnd", (sector) => {
  console.log(`Woop! You won ${sector.label}`);
});
