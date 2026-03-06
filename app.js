const CONFIG = {
  PASSWORD: "0803",
  IMAGES: [
    "./assets/p1.jpg",
    "./assets/p2.jpg",
    "./assets/p3.jpg",
    "./assets/p4.jpg",
  ],
  LETTER_TEXT: `Chị Linh,

Chúc chị 08/03 thật ý nghĩa và tràn đầy hạnh phúc.
Cảm ơn chị vì đã luôn cố gắng và tỏa sáng.

❤️`,
};

const $ = (s) => document.querySelector(s);

const screenLogin = $("#screen-login");
const screenMenu = $("#screen-menu");
const keypad = $("#keypad");
const dots = $("#dots");
const msg = $("#loginMsg");

const modal = $("#modal");
const modalContent = $("#modalContent");

let pin = "";

function setScreen(which){
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("screen--active"));
  document.getElementById(which).classList.add("screen--active");
}

function haptic(ms=15){
  try{ if (navigator.vibrate) navigator.vibrate(ms); }catch(e){}
}

function flash(t){
  msg.textContent = t || "";
  if (!t) return;
  setTimeout(()=> msg.textContent="", 1200);
}

function renderDots(){
  const ds = dots.querySelectorAll("span");
  ds.forEach((d,i)=> d.classList.toggle("on", i < pin.length));
}

function resetPin(){
  pin = "";
  renderDots();
}

function unlock(){
  sessionStorage.setItem("gift_unlocked","1");
  setScreen("screen-menu");
}

function buildKeypad(){
  // Layout like screenshot: 1..9, empty, 0, back
  const layout = ["1","2","3","4","5","6","7","8","9","empty","0","back"];
  keypad.innerHTML = "";

  layout.forEach(k=>{
    const b = document.createElement("button");
    b.type = "button";

    if (k === "empty"){
      b.className = "key key--empty";
      b.disabled = true;
    } else if (k === "back"){
      b.className = "key key--back";
      b.textContent = "×";
      b.onclick = ()=>{
        haptic(10);
        pin = pin.slice(0, -1);
        renderDots();
      };
    } else {
      b.className = "key";
      b.textContent = k;
      b.onclick = ()=>{
        haptic(15);
        if (pin.length >= 4) return;
        pin += k;
        renderDots();

        if (pin.length === 4){
          if (pin === CONFIG.PASSWORD){
            flash("Unlocked ✨");
            setTimeout(unlock, 200);
          } else {
            flash("Sai mật khẩu 😅");
            setTimeout(resetPin, 220);
          }
        }
      };
    }
    keypad.appendChild(b);
  });
}

function openModal(node){
  modalContent.innerHTML = "";
  modalContent.appendChild(node);
  modal.classList.add("open");
  modal.setAttribute("aria-hidden","false");
}
function closeModal(){
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden","true");
  modalContent.innerHTML = "";
}

modal.addEventListener("click",(e)=>{
  if (e.target?.dataset?.close) closeModal();
});
window.addEventListener("keydown",(e)=>{
  if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
});

function withFallback(img, src){
  img.src = src;
  img.onerror = ()=> img.src = src.replace(".jpg",".svg");
}

function buildGallery(){
  const wrap = document.createElement("div");
  wrap.className = "gallery";

  let idx = 0;

  const imgBox = document.createElement("div");
  imgBox.className = "gallery__img";
  const img = document.createElement("img");
  img.alt = "Photo";
  imgBox.appendChild(img);

  const nav = document.createElement("div");
  nav.className = "gallery__nav";
  const prev = document.createElement("button");
  prev.className = "navBtn";
  prev.textContent = "‹";
  const next = document.createElement("button");
  next.className = "navBtn";
  next.textContent = "›";
  nav.appendChild(prev);
  nav.appendChild(next);

  const dotRow = document.createElement("div");
  dotRow.className = "gallery__dots";
  const dotEls = CONFIG.IMAGES.map((_,i)=>{
    const d = document.createElement("span");
    if (i===0) d.classList.add("on");
    dotRow.appendChild(d);
    return d;
  });

  function render(){
    withFallback(img, CONFIG.IMAGES[idx]);
    dotEls.forEach((d,i)=> d.classList.toggle("on", i===idx));
  }

  function step(delta){
    idx = (idx + delta + CONFIG.IMAGES.length) % CONFIG.IMAGES.length;
    render();
  }

  prev.onclick = ()=>{ haptic(10); step(-1); };
  next.onclick = ()=>{ haptic(10); step(+1); };

  // swipe
  let sx = null;
  img.addEventListener("pointerdown",(e)=>{ sx = e.clientX; img.setPointerCapture?.(e.pointerId); });
  img.addEventListener("pointerup",(e)=>{
    if (sx === null) return;
    const dx = e.clientX - sx;
    sx = null;
    if (Math.abs(dx) > 35) step(dx < 0 ? 1 : -1);
  });

  render();
  wrap.appendChild(imgBox);
  wrap.appendChild(nav);
  wrap.appendChild(dotRow);
  return wrap;
}

function buildLetter(){
  const wrap = document.createElement("div");
  const paper = document.createElement("div");
  paper.className = "paper";
  const hand = document.createElement("div");
  hand.className = "hand";
  hand.textContent = CONFIG.LETTER_TEXT;
  paper.appendChild(hand);
  wrap.appendChild(paper);
  return wrap;
}

// Menu buttons
$("#btn-image").addEventListener("click", ()=> openModal(buildGallery()));
$("#btn-letter").addEventListener("click", ()=> openModal(buildLetter()));

// FX hearts (light)
const canvas = $("#fx");
const ctx = canvas.getContext("2d");
let W=0,H=0,DPR=1;
const particles = [];
function resize(){
  DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  W = canvas.width = Math.floor(window.innerWidth * DPR);
  H = canvas.height = Math.floor(window.innerHeight * DPR);
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
}
window.addEventListener("resize", resize);

function rand(min,max){ return Math.random()*(max-min)+min; }
function spawn(){
  particles.push({
    x: rand(0,W),
    y: rand(-40*DPR,-10*DPR),
    vy: rand(0.25,0.65)*DPR,
    vx: rand(-0.18,0.18)*DPR,
    s: rand(6,12)*DPR,
    a: rand(0.12,0.28),
    t: Math.random() < 0.55 ? "heart" : "dot"
  });
  if (particles.length > 110) particles.splice(0, particles.length - 110);
}
function draw(){
  ctx.clearRect(0,0,W,H);
  for (const p of particles){
    p.x += p.vx;
    p.y += p.vy;
    ctx.globalAlpha = p.a;
    if (p.t === "dot"){
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.s/2, 0, Math.PI*2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    } else {
      // simple heart
      const x=p.x, y=p.y, s=p.s;
      ctx.fillStyle = "#d81b60";
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(x - s, y - s, x - s*1.2, y + s*0.4, x, y + s);
      ctx.bezierCurveTo(x + s*1.2, y + s*0.4, x + s, y - s, x, y);
      ctx.fill();
    }
  }
  for (let i=particles.length-1;i>=0;i--){
    if (particles[i].y > H + 60*DPR) particles.splice(i,1);
  }
  requestAnimationFrame(draw);
}

// init
resize();
for (let i=0;i<28;i++) spawn();
setInterval(spawn, 240);
requestAnimationFrame(draw);

buildKeypad();
renderDots();

if (sessionStorage.getItem("gift_unlocked")==="1"){
  setScreen("screen-menu");
}
