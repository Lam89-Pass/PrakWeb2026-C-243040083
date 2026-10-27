import { useEffect, useRef, useState } from "react";
import "./game.css";

const W = 480;
const H = 720;
const GROUND = H - 46;
const BEST_KEY = "sawit-rush-best";
const FONT = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';

const ITEMS = {
  sawit: { emoji: "🌴", glow: "#ffb020", size: 46 },
  emas: { emoji: "💰", glow: "#ffe066", size: 48 },
  mbg: { emoji: "🍱", glow: "#7dff6a", size: 46 },
  api: { emoji: "🔥", glow: "#ff5a1f", size: 50 },
  air: { emoji: "💧", glow: "#4dd2ff", size: 44 },
};

const MSG = {
  mbg: ["Menu hari ini: keracunan. Sawitnya sih untung... 🤢", "Perut kosong lebih aman daripada nasi kotak misterius itu 🍱☠️", "Kenyang sih, tapi rawat inap. 🏥"],
  api: ["Kebun sawitnya hangus jadi arang. 🔥", "Asapnya sampai kemana-mana, uangnya ikut jadi abu. 💨", "Kebakaran lagi, kebakaran lagi... 🚒"],
};

const TREES = Array.from({ length: 7 }, (_, i) => ({ x: 24 + i * 76 + (i % 2) * 12, h: 150 + ((i * 37) % 90), ph: i * 1.3 }));

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);

const snd = { ctx: null, muted: false };
function tone(f, d = 0.1, type = "sine", v = 0.05, to) {
  if (snd.muted) return;
  try {
    const A = snd.ctx || (snd.ctx = new (window.AudioContext || window.webkitAudioContext)());
    if (A.state === "suspended") A.resume();
    const o = A.createOscillator();
    const g = A.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, A.currentTime);
    if (to) o.frequency.exponentialRampToValueAtTime(to, A.currentTime + d);
    g.gain.setValueAtTime(v, A.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, A.currentTime + d);
    o.connect(g).connect(A.destination);
    o.start();
    o.stop(A.currentTime + d);
  } catch {}
}
const sfx = {
  start: () => tone(440, 0.25, "triangle", 0.06, 880),
  catch: () => tone(660, 0.09, "triangle", 0.05, 990),
  gold: () => tone(880, 0.25, "triangle", 0.06, 1500),
  hurt: () => tone(220, 0.35, "sawtooth", 0.07, 70),
  fire: () => tone(160, 0.45, "square", 0.04, 320),
  shield: () => tone(500, 0.25, "sine", 0.06, 1100),
  over: () => tone(320, 0.7, "sawtooth", 0.06, 50),
};

const fresh = (best) => ({
  x: W / 2,
  items: [],
  parts: [],
  floats: [],
  score: 0,
  lives: 3,
  combo: 0,
  time: 0,
  clock: 0,
  spawn: 0.7,
  nextFire: 14,
  fire: 0,
  fireVis: 0,
  shield: 0,
  shake: 0,
  flash: 0,
  flashColor: "#fff",
  banner: "",
  bannerT: 0,
  best,
  cause: "",
});

const loadBest = () => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};

function pick(t, fire) {
  const w = { sawit: 50, emas: 7, mbg: 22, api: fire ? 55 : 12 + Math.min(10, t / 12), air: fire ? 12 : 5 };
  const sum = Object.values(w).reduce((a, b) => a + b, 0);
  let r = Math.random() * sum;
  for (const k in w) {
    r -= w[k];
    if (r <= 0) return k;
  }
  return "sawit";
}

function Game({ onBack }) {
  const cvRef = useRef(null);
  const gRef = useRef(fresh(loadBest()));
  const phaseRef = useRef("menu");
  const ctl = useRef({ left: 0, right: 0, target: null });
  const [phase, setPhase] = useState("menu");
  const [res, setRes] = useState(null);
  const [best, setBest] = useState(loadBest);
  const [muted, setMuted] = useState(false);

  const go = (p) => {
    phaseRef.current = p;
    setPhase(p);
  };

  const start = () => {
    gRef.current = fresh(gRef.current.best);
    ctl.current = { left: 0, right: 0, target: null };
    sfx.start();
    go("play");
  };

  const togglePause = () => {
    if (phaseRef.current === "play") go("pause");
    else if (phaseRef.current === "pause") go("play");
  };

  const toggleMute = () => {
    snd.muted = !snd.muted;
    setMuted(snd.muted);
  };

  useEffect(() => {
    const cv = cvRef.current;
    const ctx = cv.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = W * dpr;
    cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const burst = (g, x, y, color, n = 10, sp = 220) => {
      for (let i = 0; i < n; i++) {
        const life = rand(0.35, 0.8);
        g.parts.push({ x, y, vx: rand(-sp, sp), vy: rand(-sp, sp * 0.2), life, max: life, color, r: rand(2, 5) });
      }
    };
    const float = (g, x, y, text, color) => g.floats.push({ x, y, text, color, life: 1 });
    const banner = (g, text) => {
      g.banner = text;
      g.bannerT = 2.2;
    };
    const mult = (g) => Math.min(5, 1 + Math.floor(g.combo / 6));

    const finish = (g) => {
      const prev = g.best;
      g.best = Math.max(prev, g.score);
      try {
        localStorage.setItem(BEST_KEY, String(g.best));
      } catch {}
      const list = MSG[g.cause] || MSG.mbg;
      setBest(g.best);
      setRes({ score: g.score, best: g.best, newBest: g.score > prev && g.score > 0, msg: list[Math.floor(Math.random() * list.length)], cause: g.cause });
      sfx.over();
      phaseRef.current = "over";
      setPhase("over");
    };

    const damage = (g, kind) => {
      if (g.shield > 0) {
        float(g, g.x, GROUND - 110, "AMAN! 🛡️", "#8fe6ff");
        burst(g, g.x, GROUND - 60, "#8fe6ff", 10);
        sfx.shield();
        return;
      }
      g.lives--;
      g.combo = 0;
      g.shake = 0.45;
      g.flash = 0.5;
      g.cause = kind;
      g.flashColor = kind === "mbg" ? "#6dff4a" : "#ff4a1a";
      float(g, g.x, GROUND - 110, kind === "mbg" ? "KERACUNAN! 🤢" : "HANGUS! 🔥", g.flashColor);
      burst(g, g.x, GROUND - 60, g.flashColor, 16, 280);
      if (kind === "mbg") sfx.hurt();
      else sfx.fire();
      if (g.lives <= 0) finish(g);
    };

    const hit = (g, it) => {
      if (it.type === "sawit") {
        g.combo++;
        const pts = 10 * mult(g);
        g.score += pts;
        float(g, it.x, GROUND - 100, `+${pts}`, "#ffd36b");
        burst(g, it.x, GROUND - 70, "#ffc233", 8);
        sfx.catch();
      } else if (it.type === "emas") {
        g.combo += 2;
        const pts = 50 * mult(g);
        g.score += pts;
        float(g, it.x, GROUND - 100, `+${pts} 💰`, "#fff08a");
        burst(g, it.x, GROUND - 70, "#ffe066", 18, 280);
        sfx.gold();
      } else if (it.type === "air") {
        g.shield = 6;
        g.items.forEach((i) => {
          if (i.type === "api" && i !== it) {
            i.dead = true;
            burst(g, i.x, i.y, "#bfefff", 12);
          }
        });
        float(g, g.x, GROUND - 110, "TAMENG 6 DETIK! 🛡️", "#8fe6ff");
        banner(g, "💧 TAMENG AKTIF 💧");
        sfx.shield();
      } else {
        damage(g, it.type);
      }
    };

    const step = (g, dt) => {
      g.time += dt;
      const c = ctl.current;
      const dir = c.right - c.left;
      if (dir) {
        g.x += dir * 480 * dt;
        c.target = null;
      } else if (c.target != null) {
        g.x += (c.target - g.x) * Math.min(1, dt * 16);
      }
      g.x = clamp(g.x, 36, W - 36);
      if (g.shield > 0) g.shield = Math.max(0, g.shield - dt);

      if (g.fire > 0) g.fire -= dt;
      else if (g.time > g.nextFire) {
        g.fire = 7;
        g.nextFire = g.time + rand(22, 30);
        banner(g, "🔥 KEBAKARAN HUTAN! 🔥");
        sfx.fire();
      }

      g.spawn -= dt;
      if (g.spawn <= 0) {
        const base = Math.max(0.3, 0.8 - g.time * 0.006);
        g.spawn = base * (g.fire > 0 ? 0.55 : 1) * rand(0.7, 1.2);
        g.items.push({
          type: pick(g.time, g.fire > 0),
          x: rand(34, W - 34),
          y: -40,
          vy: Math.min(150 + g.time * 2.2, 420) * rand(0.85, 1.25),
          rot: rand(-0.5, 0.5),
          spin: rand(-2, 2),
        });
      }

      const top = GROUND - 84;
      for (const it of g.items) {
        if (it.dead) continue;
        it.y += it.vy * dt;
        it.rot += it.spin * dt;
        if (it.y > top && it.y < GROUND - 10 && Math.abs(it.x - g.x) < 46) {
          it.dead = true;
          hit(g, it);
          if (phaseRef.current !== "play") return;
        } else if (it.y > GROUND + 10) {
          it.dead = true;
          if (it.type === "sawit" || it.type === "emas") g.combo = 0;
          if (it.type === "api") burst(g, it.x, GROUND, "#ff7a2a", 6, 120);
        }
      }
      g.items = g.items.filter((i) => !i.dead);
    };

    const emoji = (ch, x, y, size) => {
      ctx.font = `${size}px ${FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(ch, x, y);
    };
    const rr = (x, y, w, h, r) => {
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
      else ctx.rect(x, y, w, h);
    };
    const palm = (x, h, sway, color) => {
      const tx = x + sway;
      const ty = GROUND - h;
      ctx.strokeStyle = color;
      ctx.lineCap = "round";
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(x, GROUND);
      ctx.quadraticCurveTo(x + sway * 0.2, GROUND - h * 0.5, tx, ty);
      ctx.stroke();
      ctx.lineWidth = 5;
      for (let k = 0; k < 6; k++) {
        const a = Math.PI + (k / 5) * Math.PI;
        const len = 46;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.quadraticCurveTo(tx + Math.cos(a) * len * 0.6, ty + Math.sin(a) * len * 0.9 - 6, tx + Math.cos(a) * len, ty + Math.sin(a) * len * 0.6 + 18);
        ctx.stroke();
      }
    };

    const draw = (g) => {
      ctx.save();
      if (g.shake > 0) ctx.translate(rand(-1, 1) * g.shake * 14, rand(-1, 1) * g.shake * 14);

      let gr = ctx.createLinearGradient(0, 0, 0, GROUND);
      gr.addColorStop(0, "#0b1d4d");
      gr.addColorStop(0.55, "#2a5cc0");
      gr.addColorStop(1, "#ffb36b");
      ctx.fillStyle = gr;
      ctx.fillRect(-20, -20, W + 40, H + 40);
      if (g.fireVis > 0.01) {
        gr = ctx.createLinearGradient(0, 0, 0, GROUND);
        gr.addColorStop(0, "#2e0606");
        gr.addColorStop(0.55, "#9a2a0a");
        gr.addColorStop(1, "#ff8a1f");
        ctx.globalAlpha = g.fireVis * (0.85 + Math.sin(g.clock * 6) * 0.1);
        ctx.fillStyle = gr;
        ctx.fillRect(-20, -20, W + 40, H + 40);
        ctx.globalAlpha = 1;
      }
      ctx.save();
      ctx.shadowColor = "#ffd27a";
      ctx.shadowBlur = 50;
      ctx.fillStyle = "#ffd98a";
      ctx.globalAlpha = 0.9 - g.fireVis * 0.4;
      ctx.beginPath();
      ctx.arc(W * 0.74, 230, 52, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = "#12502b";
      ctx.beginPath();
      ctx.moveTo(0, GROUND);
      ctx.bezierCurveTo(100, GROUND - 130, 220, GROUND - 40, 330, GROUND - 100);
      ctx.bezierCurveTo(400, GROUND - 140, 450, GROUND - 60, W, GROUND - 90);
      ctx.lineTo(W, GROUND);
      ctx.fill();
      TREES.forEach((t) => palm(t.x, t.h, Math.sin(g.clock * 1.2 + t.ph) * 6, "#0a2a1c"));
      gr = ctx.createLinearGradient(0, GROUND, 0, H);
      gr.addColorStop(0, "#237a3a");
      gr.addColorStop(1, "#0a2c16");
      ctx.fillStyle = gr;
      ctx.fillRect(-20, GROUND, W + 40, H - GROUND + 20);
      ctx.fillStyle = "#4ed07a";
      ctx.fillRect(-20, GROUND, W + 40, 3);
      if (g.fireVis > 0.05) {
        ctx.globalAlpha = g.fireVis;
        for (let i = 0; i < 12; i++) emoji("🔥", 20 + i * 40, GROUND + 6, 34 + Math.sin(g.clock * 8 + i) * 8);
        ctx.globalAlpha = 1;
      }

      for (const it of g.items) {
        const d = ITEMS[it.type];
        ctx.save();
        ctx.translate(it.x, it.y);
        ctx.rotate(it.rot);
        ctx.shadowColor = d.glow;
        ctx.shadowBlur = 22;
        const s = it.type === "api" ? d.size + Math.sin(g.clock * 14 + it.x) * 4 : d.size;
        emoji(d.emoji, 0, 0, s);
        if (it.type === "mbg") {
          ctx.shadowBlur = 0;
          emoji("☠️", 18, -18, 22);
        }
        ctx.restore();
      }

      if (g.shield > 0) {
        ctx.save();
        ctx.strokeStyle = "rgba(143,230,255,0.9)";
        ctx.fillStyle = "rgba(77,210,255,0.16)";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#4dd2ff";
        ctx.shadowBlur = 20;
        ctx.globalAlpha = g.shield < 1.5 ? 0.4 + Math.abs(Math.sin(g.clock * 14)) * 0.6 : 1;
        ctx.beginPath();
        ctx.arc(g.x, GROUND - 40, 66, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      emoji("🧑‍🌾", g.x, GROUND - 14, 56);
      emoji("🧺", g.x, GROUND - 62, 54);

      for (const p of g.parts) {
        ctx.globalAlpha = clamp(p.life / p.max, 0, 1);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      ctx.font = `800 22px ${FONT}`;
      ctx.textAlign = "center";
      for (const f of g.floats) {
        ctx.globalAlpha = clamp(f.life, 0, 1);
        ctx.fillStyle = f.color;
        ctx.strokeStyle = "rgba(0,0,0,0.55)";
        ctx.lineWidth = 4;
        ctx.strokeText(f.text, f.x, f.y);
        ctx.fillText(f.text, f.x, f.y);
      }
      ctx.globalAlpha = 1;

      if (g.flash > 0) {
        ctx.globalAlpha = g.flash * 0.6;
        ctx.fillStyle = g.flashColor;
        ctx.fillRect(-20, -20, W + 40, H + 40);
        ctx.globalAlpha = 1;
      }

      if (g.bannerT > 0) {
        const s = 1 + Math.max(0, g.bannerT - 1.9) * 1.2;
        ctx.save();
        ctx.globalAlpha = Math.min(1, g.bannerT);
        ctx.translate(W / 2, 170);
        ctx.scale(s, s);
        ctx.font = `900 32px ${FONT}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "rgba(0,0,0,0.6)";
        ctx.lineWidth = 7;
        ctx.fillStyle = "#fff3c4";
        ctx.strokeText(g.banner, 0, 0);
        ctx.fillText(g.banner, 0, 0);
        ctx.restore();
      }
      ctx.restore();

      ctx.fillStyle = "rgba(6,14,40,0.55)";
      rr(10, 10, W - 20, 64, 16);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.16)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.textBaseline = "alphabetic";
      ctx.textAlign = "left";
      ctx.fillStyle = "#fff";
      ctx.font = `800 24px ${FONT}`;
      ctx.fillText(`Rp ${g.score.toLocaleString("id-ID")} Jt`, 24, 40);
      ctx.fillStyle = "#9fb4e0";
      ctx.font = `600 13px ${FONT}`;
      ctx.fillText(`Rekor ${g.best.toLocaleString("id-ID")}`, 24, 62);
      if (g.combo >= 6) {
        ctx.fillStyle = "#ffd36b";
        ctx.font = `800 14px ${FONT}`;
        ctx.fillText(`x${mult(g)} COMBO ${g.combo}`, 150, 62);
      }
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (let i = 0; i < 3; i++) emoji(i < g.lives ? "❤️" : "🖤", W - 28 - (2 - i) * 32, 34, 24);
      if (g.shield > 0) {
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.fillRect(W - 116, 56, 92, 6);
        ctx.fillStyle = "#4dd2ff";
        ctx.fillRect(W - 116, 56, 92 * (g.shield / 6), 6);
      }
    };

    let raf;
    let last = performance.now();
    const frame = (now) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const g = gRef.current;
      g.clock += dt;
      if (phaseRef.current === "play") step(g, dt);
      g.fireVis += ((g.fire > 0 ? 1 : 0) - g.fireVis) * Math.min(1, dt * 3);
      g.shake = Math.max(0, g.shake - dt);
      g.flash = Math.max(0, g.flash - dt);
      g.bannerT = Math.max(0, g.bannerT - dt);
      for (const p of g.parts) {
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 500 * dt;
      }
      g.parts = g.parts.filter((p) => p.life > 0);
      for (const f of g.floats) {
        f.life -= dt * 0.9;
        f.y -= 50 * dt;
      }
      g.floats = g.floats.filter((f) => f.life > 0);
      draw(g);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const dn = (e) => {
      const k = e.key;
      if (k === "ArrowLeft" || k === "a" || k === "A") {
        ctl.current.left = 1;
        e.preventDefault();
      } else if (k === "ArrowRight" || k === "d" || k === "D") {
        ctl.current.right = 1;
        e.preventDefault();
      } else if (k === "p" || k === "P" || k === "Escape") {
        if (!e.repeat) {
          if (phaseRef.current === "play") go("pause");
          else if (phaseRef.current === "pause") go("play");
        }
      }
    };
    const up = (e) => {
      const k = e.key;
      if (k === "ArrowLeft" || k === "a" || k === "A") ctl.current.left = 0;
      if (k === "ArrowRight" || k === "d" || k === "D") ctl.current.right = 0;
    };
    const auto = () => {
      if (phaseRef.current === "play") go("pause");
    };
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", auto);
    document.addEventListener("visibilitychange", auto);
    return () => {
      window.removeEventListener("keydown", dn);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", auto);
      document.removeEventListener("visibilitychange", auto);
    };
  }, []);

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    ctl.current.target = ((e.clientX - r.left) / r.width) * W;
  };

  return (
    <div className="game-page">
      <div className="g-head">
        <button type="button" className="g-chip" onClick={onBack}>
          ← Kembali
        </button>
        <h1 className="g-title">Sawit Rush 🌴</h1>
        <div className="g-tools">
          <button type="button" className="g-chip g-icon" onClick={togglePause} aria-label="Jeda" disabled={phase !== "play" && phase !== "pause"}>
            {phase === "pause" ? "▶" : "⏸"}
          </button>
          <button type="button" className="g-chip g-icon" onClick={toggleMute} aria-label={muted ? "Nyalakan suara" : "Matikan suara"}>
            {muted ? "🔇" : "🔊"}
          </button>
        </div>
      </div>

      <div className="g-stage">
        <canvas ref={cvRef} className="g-canvas" onPointerMove={onMove} onPointerDown={onMove} />

        {phase !== "play" && (
          <div className="g-overlay">
            {phase === "menu" && (
              <div className="g-card">
                <div className="g-emoji">🌴🔥🍱</div>
                <h2>Sawit Rush</h2>
                <p className="g-sub">Tangkap sawit, hindari MBG beracun dan kebakaran hutan!</p>
                <ul className="g-legend">
                  <li>
                    <span>🌴</span> Sawit: cuan mengalir, makin kaya
                  </li>
                  <li>
                    <span>💰</span> Emas: bonus besar
                  </li>
                  <li>
                    <span>🍱</span> MBG: racun, nyawa berkurang!
                  </li>
                  <li>
                    <span>🔥</span> Kebakaran: hangus, nyawa berkurang!
                  </li>
                  <li>
                    <span>💧</span> Air: tameng anti racun dan api
                  </li>
                </ul>
                <button type="button" className="g-btn" onClick={start} autoFocus>
                  Mulai Main
                </button>
                <p className="g-keys">← → / A D atau geser jari • P untuk jeda</p>
                {best > 0 && <p className="g-best">Rekor: Rp {best.toLocaleString("id-ID")} Jt</p>}
              </div>
            )}

            {phase === "pause" && (
              <div className="g-card">
                <div className="g-emoji">⏸</div>
                <h2>Jeda</h2>
                <button type="button" className="g-btn" onClick={() => go("play")} autoFocus>
                  Lanjut
                </button>
                <button type="button" className="g-btn g-ghost" onClick={onBack}>
                  Keluar
                </button>
              </div>
            )}

            {phase === "over" && res && (
              <div className="g-card">
                <div className="g-emoji">{res.cause === "api" ? "🔥" : "🤢"}</div>
                <h2>{res.cause === "api" ? "Kebun Hangus!" : "Keracunan MBG!"}</h2>
                <p className="g-sub">{res.msg}</p>
                <div className="g-score">Rp {res.score.toLocaleString("id-ID")} Jt</div>
                {res.newBest ? <p className="g-best">🏆 Rekor baru!</p> : <p className="g-best">Rekor: Rp {res.best.toLocaleString("id-ID")} Jt</p>}
                <button type="button" className="g-btn" onClick={start} autoFocus>
                  Main Lagi
                </button>
                <button type="button" className="g-btn g-ghost" onClick={onBack}>
                  Kembali
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Game;
