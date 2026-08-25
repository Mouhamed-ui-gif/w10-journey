"use strict";

const CONFIG = {
  whatsappNumber: "",
  instagram: "",
  facebook: "",
  tiktok: "",
  hoursOpen: 11,
  hoursClose: 23
};

const SEC_COLORS = {
  india: "#ff9d2e",
  Italy: "#6fbf73",
  Spain: "#ff5a3c",
  Japan: "#ff7d95",
  Mexico: "#ffd23f",
  USA: "#5aa7ff",
  DRINKS: "#c084fc"
};

const TAGLINES = {
  india: "بهارات دلهي وتندور على نار الحطب — رحلة إلى قلب شبه القارة",
  Italy: "عجينة ترتاح 48 ساعة وصوص يُطهى ببطء… إيطاليا كما يجب أن تكون",
  Spain: "تاباس تُشارك وبايلا تُحتفل بها — روح برشلونة على مائدتك",
  Japan: "سوشي وساشيمي بدقّة يابانية في كل قطعة — طوكيو على بُعد قضمة",
  Mexico: "تاكوس وكيساديّا بصوصاتها النارية — احتفال مكسيكي لا يتوقف",
  USA: "برغر جريء ولحم يُشوى أمامك — النكهة الأمريكية الأصيلة",
  DRINKS: "من الإسبريسو الإيطالي إلى الموهيتو الفرنسي — عصائر طازج ويقظة كاملة"
};

const FINE_POINTER = matchMedia("(pointer:fine)").matches;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const fmtDA = n => n.toLocaleString("en-US") + " دج";
const easeIO = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

const DATA = window.W10_DATA;
const ALL_ITEMS = [];
DATA.sections.forEach(s => {
  const col = SEC_COLORS[s.key] || "#fff";
  s.cats.forEach(c => c.items.forEach(it => ALL_ITEMS.push({
    name: it.n, price: it.p, desc: it.d,
    img: it.img ? `assets/img/${it.img}` : s.hero,
    cat: c.name, section: s.ar, key: s.key.trim(), secColor: col
  })));
});

let lightList = [], lightIdx = 0;
const M = { x: innerWidth / 2, y: innerHeight / 2, cx: innerWidth / 2, cy: innerHeight / 2 };

function boot() {
  $("#year").textContent = "© " + new Date().getFullYear() + " W10 JOURNEY — EL KHROUB";
  $("#hoursText").textContent = `يومياً · ${CONFIG.hoursOpen}:00 ← ${CONFIG.hoursClose}:00`;
  const maps = $("#mapsLink");
  if (DATA.place.maps) maps.href = DATA.place.maps;

  splitLatin($("#heroTitle .latin"));
  $$(".split").forEach(splitWords);
  initScrambles();
  buildHero();
  initHeroVideo();
  buildTicker();
  buildBoard();
  buildJourney();
  buildChapters();
  buildMenu();
  buildGallery();
  buildPicker();
  buildSocials();
  initNav();
  initCursor();
  initTrail();
  initEmbers();
  initTilt();
  initMagnets();
  initWizard();
  initCounters();
  initReveals();
  initLightbox();
  initMisc();
  startLoop();
  runPreloader();
}

function splitWords(el) {
  let i = 0;
  const walk = node => {
    [...node.childNodes].forEach(ch => {
      if (ch.nodeType === 3) {
        const frag = document.createDocumentFragment();
        ch.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(document.createTextNode(" ")); return; }
          const w = document.createElement("span");
          w.className = "w";
          const wi = document.createElement("span");
          wi.className = "wi";
          wi.style.setProperty("--i", i++);
          wi.textContent = part;
          w.append(wi);
          frag.append(w);
        });
        node.replaceChild(frag, ch);
      } else if (ch.nodeType === 1 && ch.nodeName !== "BR") {
        walk(ch);
      }
    });
  };
  walk(el);
}

function splitLatin(el) {
  const txt = el.textContent;
  el.textContent = "";
  [...txt].forEach((ch, i) => {
    const s = document.createElement("span");
    s.className = "ch";
    s.style.setProperty("--i", i);
    s.textContent = ch === " " ? "\u00A0" : ch;
    el.append(s);
  });
}

function initScrambles() {
  const glyphs = "!<>-_\\/[]{}—=+*^?#01";
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    io.unobserve(en.target);
    const el = en.target;
    const final = el.textContent;
    if (reduceMotion) return;
    let frame = 0;
    const total = 26;
    const tick = () => {
      frame++;
      const solved = Math.floor(final.length * frame / total);
      el.textContent = final.slice(0, solved) +
        [...final.slice(solved)].map(c => c === " " ? " " : glyphs[Math.random() * glyphs.length | 0]).join("");
      if (frame < total) requestAnimationFrame(tick);
      else el.textContent = final;
    };
    tick();
  }), { threshold: 0.4 });
  $$("[data-scramble]").forEach(el => { el.textContent = el.textContent.toUpperCase(); io.observe(el); });
}

function heroImages() {
  return ["assets/img/bg-hero.jpeg", ...DATA.sections.map(s => s.hero)];
}

let heroDone;
function buildHero() {
  const wrap = $("#heroSlides");
  const imgs = heroImages();
  wrap.innerHTML = imgs.map((src, i) =>
    `<div class="h-slide${i === 0 ? " on" : ""}" style="background-image:url('${src}')"></div>`).join("");
  let cur = 0;
  if (!reduceMotion) setInterval(() => {
    const slides = $$(".h-slide", wrap);
    slides[cur].classList.remove("on");
    cur = (cur + 1) % slides.length;
    slides[cur].classList.add("on");
  }, 5200);

  const clock = () => {
    try {
      $("#clockNow").textContent = new Intl.DateTimeFormat("ar-DZ", {
        hour: "2-digit", minute: "2-digit", timeZone: "Africa/Algiers"
      }).format(new Date());
    } catch { $("#clockNow").textContent = new Date().toTimeString().slice(0, 5); }
  };
  clock(); setInterval(clock, 30000);

  heroDone = preload(imgs);
}
function preload(srcs) {
  let done = 0;
  return Promise.allSettled(srcs.map(src => new Promise(res => {
    const im = new Image();
    im.onload = im.onerror = () => { done++; res(); };
    im.src = src;
  }))).then(() => done);
}

function buildTicker() {
  const items = ["قسنطينة CNX", "دلهي DEL", "نابولي NAP", "برشلونة BCN", "طوكيو TYO", "مكسيكو سيتي MEX", "نيويورك NYC"];
  const chunk = items.map((c, i) => `${c} <em>✈</em>`).join(" ");
  $("#tickTrack").innerHTML = `<span>${chunk}</span><span>${chunk}</span>`;
}

function buildBoard() {
  const rows = DATA.sections.map((s, i) => {
    const h = 11 + Math.floor(i / 2), m = i % 2 ? "20" : "40";
    return `<div class="b-row">
      <span class="b-rail">W10-${i + 1}0${i}</span>
      <span class="b-dest">${s.flag} <b data-scr>${s.name.toUpperCase()}</b> · ${s.ar}</span>
      <span>GATE W${i + 1}</span>
      <span class="b-time">${h}:${m}</span>
      <span class="b-status">BOARDING</span>
    </div>`;
  }).join("");
  $("#boardRows").innerHTML = rows;
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    io.disconnect();
    $$("#boardRows .b-row").forEach((r, k) => setTimeout(() => {
      r.style.opacity = "0";
      r.style.transition = "opacity .5s";
      r.style.opacity = "1";
      $$("[data-scr]", r).forEach(launchScr);
    }, reduceMotion ? 0 : k * 130));
  }), { threshold: 0.25 });
  io.observe($("#boardRows"));
  function launchScr(el) {
    if (reduceMotion) return;
    const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const final = el.textContent;
    let f = 0;
    const total = 22;
    const t = () => {
      f++;
      const solvedN = Math.floor(final.length * f / total);
      el.textContent = final.slice(0, solvedN) +
        [...final.slice(solvedN)].map(c => c === " " ? " " : glyphs[Math.random() * glyphs.length | 0]).join("");
      if (f < total) requestAnimationFrame(t); else el.textContent = final;
    };
    t();
  }
}

function buildJourney() {
  $("#jTrack").innerHTML = DATA.sections.map((s, i) => `
    <article class="j-card" style="--sec:${SEC_COLORS[s.key] || "#fff"}">
      <div class="j-stampMini">${s.flag}</div>
      <div class="j-bg" style="background-image:url('${s.hero}')"></div>
      <div class="j-shade"></div>
      <span class="j-num">0${i + 1}</span>
      <div class="j-info">
        <div class="j-flag">${s.flag}</div>
        <div class="j-ar">${s.ar}</div>
        <div class="j-latin">${s.name}</div>
        <div class="j-meta">${s.cats.reduce((a, c) => a + c.items.length, 0)} طبق · ${s.cats.length} قائمة</div>
      </div>
    </article>`).join("");
}

function buildChapters() {
  const dstr = new Date().toLocaleDateString("fr-DZ");
  $("#chapters").innerHTML = DATA.sections.map((s, i) => `
    <article class="chap" id="chap-${i}" style="--sec:${SEC_COLORS[s.key] || "#fff"}" data-key="${s.key.trim()}">
      <div class="chap-scene">
        <div class="chap-bg" style="background-image:url('${s.hero}')"></div>
        <div class="chap-tint"></div>
        <div class="chap-wash"></div>
        <div class="chap-word" aria-hidden="true">${s.name.toUpperCase()}</div>
        <header class="chap-head">
          <p class="chap-count">CHAPITRE 0${i + 1} — ${s.name.toUpperCase()}</p>
          <h2 class="chap-title"><small>${s.flag} WELCOME TO ${s.name.toUpperCase()}</small>${s.ar}</h2>
          <p class="chap-tag">${TAGLINES[s.key.trim()] || ""}</p>
        </header>
        <div class="stamp" aria-hidden="true">
          <span class="st-fl">${s.flag}</span>
          <span class="st-ar">${s.ar}</span>
          <span class="st-lt">W10 IMMIGRATION</span>
          <span class="st-dt">${dstr} · EL KHROUB</span>
        </div>
        <div class="chap-dishes">${featured(s)}</div>
        <div class="rail"><i></i></div>
      </div>
    </article>`).join("");

  $$(".stamp").forEach(st => {
    new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) { st.classList.add("hit"); }
      else st.classList.remove("hit");
    }), { threshold: 0.55 }).observe(st);
  });

  function featured(sec) {
    const pool = [];
    sec.cats.forEach(c => c.items.forEach(it => { if (it.img) pool.push(it); }));
    pool.sort((a, b) => b.p - a.p);
    return pool.slice(0, 6).map(d => `
      <figure class="dish" data-name="${d.n}" data-price="${d.p}"
        data-img="assets/img/${d.img}" data-cat="${sec.flag} ${sec.ar}">
        <img src="assets/img/${d.img}" alt="${d.n}" loading="lazy">
        <figcaption>
          <h4>${d.n}</h4>
          <div class="p"><span>${sec.flag}</span><b>${fmtDA(d.p)}</b></div>
        </figcaption>
      </figure>`).join("");
  }
}

let activeFilter = "all", searchQ = "";

function buildMenu() {
  const tabs = $("#menuTabs");
  tabs.innerHTML = `<button class="mtab on" data-key="all">🌍 الكل</button>` +
    DATA.sections.map(s => `<button class="mtab" data-key="${s.key.trim()}">${s.flag} ${s.ar}</button>`).join("");

  $("#menuCountLine").textContent =
    `${ALL_ITEMS.length} طبقاً حقيقياً من قائمتنا الرقمية — مرّر فوق أي صف لترى الصورة تطير`;

  render();

  tabs.addEventListener("click", e => {
    const b = e.target.closest(".mtab");
    if (!b) return;
    $$(".mtab", tabs).forEach(x => x.classList.remove("on"));
    b.classList.add("on");
    activeFilter = b.dataset.key;
    render();
  });
  $("#menuSearch").addEventListener("input", e => { searchQ = e.target.value.trim().toLowerCase(); render(); });
}

function render() {
  const list = ALL_ITEMS.filter(it =>
    (activeFilter === "all" || it.key === activeFilter) &&
    (!searchQ || it.name.toLowerCase().includes(searchQ) || it.cat.toLowerCase().includes(searchQ)));
  $("#menuEmpty").hidden = list.length > 0;
  $("#menuList").innerHTML = list.slice(0, 140).map((it, idx) => `
    <div class="mrow" style="--sec:${it.secColor}" data-i="${ALL_ITEMS.indexOf(it)}" data-img="${it.img}" data-name="${it.name}">
      ${`<img src="${it.img}" alt="" loading="lazy">`}
      <div class="m-name">
        <h4>${it.name}</h4>
        <span>${it.section} · ${it.cat}</span>
      </div>
      <span class="m-leader"></span>
      <span class="m-price">${it.price.toLocaleString("en-US")} <small>دج</small></span>
    </div>`).join("");

  bindRows(list);
}

function bindRows(fullList) {
  const peek = $("#peek"), pImg = $("#peek img");
  $$(".mrow").forEach(row => {
    row.addEventListener("pointerenter", e => {
      if (!FINE_POINTER) return;
      pImg.src = row.dataset.img;
      peek.classList.add("show");
    });
    row.addEventListener("pointerleave", () => peek.classList.remove("show"));
    row.addEventListener("click", () => {
      const target = ALL_ITEMS[+row.dataset.i];
      lightList = fullList.map(it => ({
        name: it.name, price: it.price, img: it.img,
        cat: `${it.section} · ${it.cat}`, desc: "", secColor: it.secColor, ref: it
      }));
      lightIdx = Math.max(0, lightList.findIndex(x => x.ref === target));
      openLightbox(lightList[lightIdx]);
    });
  });
}

function buildGallery() {
  const pics = [];
  DATA.sections.forEach(s => {
    pics.push({ src: s.hero, cap: `${s.flag} ${s.ar}` });
    s.gallery.forEach(g => pics.push({ src: g, cap: `${s.flag} ${s.ar}` }));
  });
  for (let i = pics.length - 1; i > 0; i--) {
    const j = Math.random() * (i + 1) | 0;
    [pics[i], pics[j]] = [pics[j], pics[i]];
  }
  $("#galTrack").innerHTML = pics.slice(0, 26).map(p =>
    `<figure class="gal" data-src="${p.src}" data-cap="${p.cap}"><img src="${p.src}" alt="${p.cap}" loading="draggy"><figcaption>${p.cap}</figcaption></figure>`).join("");

  const strip = $(".gal-strip"), track = $("#galTrack");
  const g = { x: 0, v: 0, down: false, sx: 0, slx: 0, moved: 0 };
  const bounds = () => Math.min(0, innerWidth - track.scrollWidth - 24);

  strip.addEventListener("pointerdown", e => {
    g.down = true; g.sx = e.clientX; g.slx = g.x; g.moved = 0; g.v = 0;
    strip.setPointerCapture(e.pointerId);
  });
  strip.addEventListener("pointermove", e => {
    if (!g.down) return;
    const dx = e.clientX - g.sx;
    g.moved = Math.max(g.moved, Math.abs(dx));
    let nx = g.slx + dx;
    const min = bounds(), max = 0;
    if (nx > max) nx = max + (nx - max) * 0.35;
    if (nx < min) nx = min + (nx - min) * 0.35;
    g.v = nx - g.x; g.x = nx;
  });
  const end = () => g.down = false;
  strip.addEventListener("pointerup", end);
  strip.addEventListener("pointercancel", end);

  strip.addEventListener("click", e => {
    if (g.moved > 8) return;
    const fig = e.target.closest(".gal");
    if (!fig) return;
    lightList = [{ name: fig.dataset.cap, price: 0, img: fig.dataset.src, cat: fig.dataset.cap, desc: "", secColor: "", noPrice: true }];
    lightIdx = 0;
    openLightbox(lightList[0]);
  });

  galleryDrag = () => {
    if (!g.down) {
      g.x += g.v;
      g.v *= 0.93;
      const min = bounds();
      if (g.x > 0) { g.x *= 0.85; g.v = 0; }
      if (g.x < min) { g.x = min + (g.x - min) * 0.85; g.v = 0; }
      if (!reduceMotion && Math.abs(g.v) < 0.02 && !g.down) g.x -= 0.15;
    }
    track.style.transform = `translateX(${g.x}px)`;
  };
}
let galleryDrag = null;

function buildPicker() {
  const pk = $("#sectionPicker");
  pk.innerHTML = `<button type="button" class="pk on" data-v="مفاجأة 🎲"><em>🎲</em>مفاجأة</button>` +
    DATA.sections.map(s => `<button type="button" class="pk" data-v="${s.ar}"><em>${s.flag}</em>${s.ar}</button>`).join("");
  pk.addEventListener("click", e => {
    const b = e.target.closest(".pk");
    if (!b) return;
    $$(".pk", pk).forEach(x => x.classList.remove("on"));
    b.classList.add("on");
    $("#bookForm").elements.section.value = b.dataset.v;
  });
  const hid = document.createElement("input");
  hid.type = "hidden"; hid.name = "section"; hid.value = "مفاجأة 🎲";
  $("#bookForm").append(hid);
}

function buildSocials() {
  const links = [];
  if (CONFIG.whatsappNumber) links.push(["💬", `https://wa.me/${CONFIG.whatsappNumber}`]);
  if (CONFIG.instagram) links.push(["📸", CONFIG.instagram]);
  if (CONFIG.facebook) links.push(["👍", CONFIG.facebook]);
  if (CONFIG.tiktok) links.push(["🎵", CONFIG.tiktok]);
  $("#socials").innerHTML = links.length
    ? links.map(([i, u]) => `<a href="${u}" target="_blank" rel="noopener">${i}</a>`).join("")
    : `<span style="color:var(--mut)">حساباتنا قريباً…</span>`;
}

function initWizard() {
  const form = $("#bookForm");
  const timeSel = form.elements.time;
  let slots = "";
  for (let h = CONFIG.hoursOpen; h <= CONFIG.hoursClose; h++)
    for (const m of ["00", "30"])
      if (!(h === CONFIG.hoursClose)) slots += `<option ${h === CONFIG.hoursOpen && m === "00" ? "selected" : ""}>${h}:${m}</option>`;
  timeSel.innerHTML = slots;

  const today = new Date(), pad = n => String(n).padStart(2, "0");
  form.elements.date.min = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  let step = 1;
  const hudFill = document.createElement("b");
  $(".steps-hud").append(hudFill);
  const setStep = n => {
    step = n;
    $$(".step", form).forEach(s => s.classList.toggle("on", +s.dataset.step === n));
    $$(".steps-hud i").forEach((d, k) => d.classList.toggle("on", k < n));
    hudFill.style.width = ((n - 1) / 2 * 100) + "%";
    if (n === 3) $("#bookSummary").textContent =
      `📋 ملخّص: ${form.elements.date.value || "—"} · ${form.elements.time.value} · ${form.elements.guests.value} ضيوف · قسم ${form.elements.section.value}`;
  };
  setStep(1);

  $$(".next", form).forEach(b => b.addEventListener("click", () => {
    if (step === 1) {
      let ok = true;
      [["date"], ["time"]].forEach(([n]) => {
        const el = form.elements[n];
        const bad = !el.value;
        el.classList.toggle("invalid", bad);
        if (bad) ok = false;
      });
      if (!ok) return flashMsg("اختر التاريخ والوقت أولاً ✋", true);
    }
    setStep(Math.min(3, step + 1));
  }));
  $$(".prev", form).forEach(b => b.addEventListener("click", () => setStep(Math.max(1, step - 1))));

  $$(".stp", form).forEach(b => b.addEventListener("click", () => {
    const inp = form.elements.guests;
    inp.value = clamp(+inp.value + (b.classList.contains("plus") ? 1 : -1), 1, 20);
    $("output", form).textContent = inp.value;
  }));

  form.addEventListener("submit", e => {
    e.preventDefault();
    let ok = true;
    const nameEl = form.elements.name, phoneEl = form.elements.phone;
    [[nameEl, v => !!v.trim()], [phoneEl, v => /^[+0-9][0-9\s]{7,16}$/.test(v.trim())]].forEach(([el, fn]) => {
      const bad = !fn(el.value);
      el.classList.toggle("invalid", bad);
      if (bad) ok = false;
    });
    if (!ok) return flashMsg("تحقّق من الاسم ورقم الهاتف ✋", true);

    const r = Object.fromEntries(new FormData(form).entries());
    r.id = "W10-" + Math.random().toString(36).slice(2, 7).toUpperCase();
    const saved = JSON.parse(localStorage.getItem("w10_reservations") || "[]");
    saved.push(r);
    localStorage.setItem("w10_reservations", JSON.stringify(saved));
    flashMsg("");
    showTicket(r);
    form.reset();
    $$(".pk", form)[0].click();
    $("output", form).textContent = form.elements.guests.value = "2";
    setStep(1);
  });

  function flashMsg(t, err) {
    const m = $("#formMsg");
    m.textContent = t;
    m.classList.toggle("err", !!err);
  }

  $("#tkClose").addEventListener("click", () => {
    $("#ticketModal").hidden = true;
    document.body.style.overflow = "";
  });
}

function showTicket(r) {
  $("#tkId").textContent = r.id;
  $("#tkName").textContent = r.name;
  $("#tkSection").textContent = r.section;
  $("#tkDate").textContent = r.date;
  $("#tkTime").textContent = r.time;
  $("#tkGuests").textContent = r.guests;
  $("#tkSeat").textContent = String.fromCharCode(65 + Math.random() * 5 | 0) + (1 + Math.random() * 14 | 0);
  const note = $("#tkNote");
  note.hidden = !r.note;
  if (r.note) note.textContent = "🎂 " + r.note;

  const wa = $("#tkWhats");
  if (CONFIG.whatsappNumber) {
    wa.hidden = false;
    wa.href = `https://wa.me/${CONFIG.whatsappNumber}?text=` + encodeURIComponent(
      `✈ حجز W10 JOURNEY\n🎫 ${r.id}\n👤 ${r.name}\n📅 ${r.date} ⏰ ${r.time}\n👥 ${r.guests} ضيوف\n🌍 قسم: ${r.section}${r.note ? "\n📝 " + r.note : ""}`);
  } else wa.hidden = true;

  $("#tkIcs").onclick = () => {
    const dt = r.date.replace(/-/g, "") + "T" + r.time.replace(":", "") + "00";
    const blob = new Blob([
      "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\n",
      `SUMMARY:W10 Journey — حجز ${r.id}\r\nDTSTART:${dt}\r\nDTEND:${dt}\r\n`,
      `DESCRIPTION:${r.guests} ضيوف — قسم ${r.section}\r\n`,
      "END:VEVENT\r\nEND:VCALENDAR\r\n"
    ], { type: "text/calendar" });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob), download: `w10-${r.id}.ics`
    });
    a.click();
  };

  const modal = $("#ticketModal");
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  burstConfetti(modal);
}

function burstConfetti(container) {
  if (reduceMotion) return;
  const cv = $("#confetti");
  const ctx = cv.getContext ? cv.getContext("2d") : null;
  if (!ctx) return;
  cv.width = container.clientWidth;
  cv.height = container.clientHeight;
  const cols = ["#f7906c", "#ffc46b", "#35e18c", "#5aa7ff", "#ff7d95"];
  const ps = Array.from({ length: 110 }, () => ({
    x: cv.width / 2, y: cv.height * 0.25,
    vx: (Math.random() - 0.5) * 11,
    vy: -(Math.random() * 9 + 4),
    w: Math.random() * 7 + 4,
    h: Math.random() * 4 + 3,
    rot: Math.random() * 7, vr: (Math.random() - 0.5) * 0.3,
    c: cols[Math.random() * cols.length | 0], life: 1
  }));
  (function tick() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    let alive = false;
    ps.forEach(p => {
      if (p.life <= 0) return;
      alive = true;
      p.vy += 0.16; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      p.life -= 0.008;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (alive) requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, cv.width, cv.height);
  })();
}

function initNav() {
  const burger = $("#burger"), links = $("#navLinks");
  burger.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    burger.setAttribute("aria-expanded", open);
  });
  $$("a", links).forEach(a => a.addEventListener("click", () => {
    links.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  }));
  const ids = ["hero", "board", "journey", "menu", "gallery", "book", "find"];
  const obs = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    $$("#navLinks a").forEach(a =>
      a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
  }), { rootMargin: "-42% 0px -52% 0px" });
  ids.forEach(id => { const el = $("#" + id); if (el) obs.observe(el); });
}

function initCursor() {
  if (!FINE_POINTER) return;
  const dot = $("#cursorDot"), ring = $("#cursorRing"), label = $("#cursorLabel");
  document.addEventListener("pointermove", e => {
    M.x = e.clientX; M.y = e.clientY;
    dot.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
  });
  document.addEventListener("pointerover", e => {
    const hot = e.target.closest("a,button,.mrow,.dish,.j-card,.gal,input,select,label");
    ring.classList.toggle("big", !!hot);
    const grow = e.target.closest(".mrow");
    label.textContent = grow ? "اطلب 👀" : "";
    ring.classList.toggle("txt", !!grow);
  });
  document.addEventListener("mouseleave", () => { dot.classList.add("hide"); ring.classList.add("hide"); });
  document.addEventListener("mouseenter", () => { dot.classList.remove("hide"); ring.classList.remove("hide"); });
}

function initTrail() {
  if (!FINE_POINTER || reduceMotion) return;
  const layer = $("#trailLayer");
  let last = 0;
  const imgs = DATA.sections.flatMap(s => s.gallery.slice(0, 3)).map(g => g);
  $("#hero").addEventListener("pointermove", e => {
    const now = performance.now();
    if (now - last < 110) return;
    last = now;
    const im = document.createElement("img");
    im.className = "trail-img";
    im.src = imgs[Math.random() * imgs.length | 0];
    im.alt = "";
    const s = 0.6 + Math.random() * 0.7;
    im.style.left = e.clientX - 75 + "px";
    im.style.top = e.clientY - 52 + "px";
    layer.append(im);
    im.animate([
      { opacity: 0, transform: `scale(${s}) rotate(${Math.random() * 30 - 15}deg)` },
      { opacity: 1, transform: `scale(${s * 1.05}) rotate(0deg)`, offset: 0.25 },
      { opacity: 0, transform: `scale(${s * 0.7}) translateY(50px) rotate(${Math.random() * 40 - 20}deg)` }
    ], { duration: 900 + Math.random() * 400, easing: "cubic-bezier(.2,.7,.3,1)" })
      .onfinish = () => im.remove();
  });
}

function initEmbers() {
  if (reduceMotion) return;
  const cv = $("#embers");
  const ctx = cv.getContext ? cv.getContext("2d") : null;
  if (!ctx) return;
  let W, H, parts = [];
  const resize = () => {
    const r = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = cv.offsetWidth * r;
    H = cv.height = cv.offsetHeight * r;
    parts = Array.from({ length: Math.min(60, W / 22 | 0) }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: (Math.random() * 2 + 0.6) * r,
      vy: -(Math.random() * 0.5 + 0.1) * r,
      vx: (Math.random() - 0.5) * 0.2 * r,
      a: Math.random() * 0.45 + 0.1,
      hot: Math.random() > 0.5
    }));
  };
  resize();
  addEventListener("resize", resize);
  (function loop() {
    if (document.hidden) return requestAnimationFrame(loop);
    ctx.clearRect(0, 0, W, H);
    parts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -8) { p.y = H + 8; p.x = Math.random() * W; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 7);
      ctx.fillStyle = p.hot ? `rgba(255,196,107,${p.a})` : `rgba(247,144,108,${p.a})`;
      ctx.fill();
    });
    requestAnimationFrame(loop);
  })();
}

function initTilt() {
  if (!FINE_POINTER || reduceMotion) return;
  $$("[data-tilt],.f-card").forEach(card => {
    card.addEventListener("pointermove", e => {
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -8;
      const ry = ((e.clientX - r.left) / r.width - 0.5) * 8;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener("pointerleave", () =>
      card.style.transition = "transform .6s var(--ez)", { once: true });
    card.addEventListener("pointerleave", () => card.style.transform = "");
  });
}

function initMagnets() {
  if (!FINE_POINTER || reduceMotion) return;
  $$(".magnet").forEach(el => {
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.translate = `${dx * 0.18}px ${dy * 0.22}px`;
    });
    el.addEventListener("pointerleave", () => el.style.translate = "0px 0px");
  });
}

function initCounters() {
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    const b = en.target, target = +b.dataset.count, suf = b.dataset.suffix || "";
    io.unobserve(b);
    const t0 = performance.now(), dur = reduceMotion ? 1 : 1900;
    (function tk(t) {
      const p = clamp((t - t0) / dur, 0, 1);
      b.textContent = Math.round(target * (1 - Math.pow(1 - p, 4))) + suf;
      if (p < 1) requestAnimationFrame(tk);
    })(t0);
  }), { threshold: 0.55 });
  $$(".stat b[data-count]").forEach(el => {
    if (el.id === "statDishes") el.dataset.count = ALL_ITEMS.length;
    io.observe(el);
  });
}

function initReveals() {
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add("in");
    io.unobserve(en.target);
  }), { threshold: 0.16 });
  $$(".reveal,.split").forEach(el => io.observe(el));
}

function initLightbox() {
  $(".lb-x").addEventListener("click", closeLB);
  $(".lb-prev").addEventListener("click", () => stepLB(-1));
  $(".lb-next").addEventListener("click", () => stepLB(1));
  $("#lightbox").addEventListener("click", e => { if (e.target.id === "lightbox") closeLB(); });
  addEventListener("keydown", e => {
    if ($("#lightbox").hidden) return;
    if (e.key === "Escape") closeLB();
    if (e.key === "ArrowLeft") stepLB(1);
    if (e.key === "ArrowRight") stepLB(-1);
  });
  $$(".dish").forEach(d => d.addEventListener("click", () => {
    const chap = d.closest(".chap");
    lightList = $$(".dish", chap).map(x => ({
      name: x.dataset.name, price: +x.dataset.price,
      img: x.dataset.img, cat: x.dataset.cat, desc: "", secColor: x.closest(".chap").style.getPropertyValue("--sec")
    }));
    lightIdx = lightList.findIndex(x => x.name === d.dataset.name);
    openLightbox(lightList[lightIdx]);
  }));
}
function openLightbox(en) {
  $("#lbImg").src = en.img;
  $("#lbImg").alt = en.name;
  $("#lbName").textContent = en.name;
  $("#lbCat").textContent = en.cat;
  $("#lbDesc").textContent = en.desc || "";
  $("#lbPrice").innerHTML = en.noPrice ? "" : fmtDA(en.price).replace(" دج", " <small>دج</small>");
  $("#lightbox").style.setProperty("--sec", en.secColor || "");
  $("#lightbox").hidden = false;
  document.body.style.overflow = "hidden";
}
function closeLB() {
  $("#lightbox").hidden = true;
  document.body.style.overflow = "";
}
function stepLB(d) {
  if (!lightList.length) return;
  lightIdx = (lightIdx + d + lightList.length) % lightList.length;
  openLightbox(lightList[lightIdx]);
}

function initMisc() {
  const toTop = $("#toTop"), floatB = $("#floatBook");
  toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
  const bookSec = $("#book");
  new IntersectionObserver(es => es.forEach(en => floatB.classList.toggle("hideBook", en.isIntersecting)),
    { threshold: 0.05 }).observe(bookSec);

  try {
    const h = +new Intl.DateTimeFormat("en", { hour: "numeric", hour12: false, timeZone: "Africa/Algiers" }).format(new Date());
    const open = h >= CONFIG.hoursOpen && h < CONFIG.hoursClose;
    const badge = $("#openBadge");
    badge.textContent = open ? "🟢 مفتوح الآن — مرحباً بكم" : "🔴 مغلق حالياً — نلتقي غداً";
    badge.classList.add(open ? "yes" : "no");
  } catch { $("#openBadge").textContent = "🟡 تحقق من أوقات العمل"; }
}

const chapters = [];
function collectChapters() {
  $$(".chap").forEach(c => chapters.push({
    root: c,
    key: c.dataset.key,
    bg: $(".chap-bg", c),
    word: $(".chap-word", c),
    head: $(".chap-head", c),
    dishes: $$(".dish", c),
    rail: $(".rail i", c)
  }));
}

function startLoop() {
  collectChapters();
  const dot = $("#cursorDot");
  const railPlane = $("#railPlane"), railFill = $("#railFill");
  const heroContent = $(".hero-content");
  const jRunway = $(".j-runway"), jTrack = $("#jTrack");
  const peek = $("#peek");
  let sy = scrollY, easedSy = scrollY, lastKey = "";

  function frame() {
    if (document.hidden) return requestAnimationFrame(frame);
    sy = scrollY;
    easedSy = reduceMotion ? sy : lerp(easedSy, sy, 0.09);
    const vh = innerHeight;
    const docH = document.documentElement.scrollHeight - vh;

    M.cx = lerp(M.cx, M.x, 0.16);
    M.cy = lerp(M.cy, M.y, 0.16);
    if (FINE_POINTER) {
      $("#cursorRing").style.transform = `translate(${M.cx}px,${M.cy}px)`;
      if (peek.classList.contains("show")) {
        peek.style.left = clamp(M.cx - 250, 8, innerWidth - 240) + "px";
        peek.style.top = clamp(M.cy - 80, 70, vh - 180) + "px";
      }
    }

    const prog = clamp(sy / docH, 0, 1);
    railFill.style.height = prog * 100 + "%";
    railPlane.style.top = prog * 100 + "%";

    if (heroContent) {
      const p = clamp(easedSy / vh, 0, 1);
      heroContent.style.opacity = String(1 - p * 1.35);
      heroContent.style.transform = `translateY(${easedSy * 0.32}px) scale(${1 - p * 0.06})`;
      $("#heroSlides").style.transform = `translateY(${easedSy * 0.18}px)`;
    }

    if (jRunway) {
      const r = jRunway.getBoundingClientRect();
      const p = clamp(-r.top / (r.height - vh), 0, 1);
      const max = Math.max(0, jTrack.scrollWidth - innerWidth);
      if (!reduceMotion) jTrack.style.transform = `translateX(${-max * easeIO(p)}px)`;
    }

    let centerKey = null;
    for (const ch of chapters) {
      const r = ch.root.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh + 80) continue;
      const p = clamp(-r.top / (r.height - vh), 0, 1);
      if (!reduceMotion) {
        ch.bg.style.transform = `translateY(${(p - 0.5) * -16}%) scale(${1.07 + p * 0.07})`;
        ch.word.style.transform = `translateX(${(0.5 - p) * 26}vw)`;
        ch.head.style.transform = `translateY(${(0.5 - p) * 64}px)`;
        ch.rail.style.height = p * 100 + "%";
        ch.dishes.forEach((d, i) => d.classList.toggle("pop", p >= 0.13 + i * 0.125));
      } else ch.dishes.forEach(d => d.classList.add("pop"));
      if (r.top < vh * 0.45 && r.bottom > vh * 0.45) centerKey = ch.key;
    }
    if (centerKey && centerKey !== lastKey) {
      lastKey = centerKey;
      document.documentElement.style.setProperty("--wash", SEC_COLORS[centerKey] || "#f7906c");
    }

    if (galleryDrag) galleryDrag();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

if (document.readyState === "loading") addEventListener("DOMContentLoaded", boot);
else boot();

function initHeroVideo() {
  const v = $("#heroVideo");
  if (!v || reduceMotion || v.dataset.bound) return;
  v.dataset.bound = "1";
  const play = () => { const p = v.play && v.play(); p && p.catch && p.catch(() => {}); };
  const showSlides = () => $$("#heroSlides .h-slide").forEach(s => { s.style.opacity = ""; s.style.transitionDuration = ""; });
  const hideSlides = () => $$("#heroSlides .h-slide").forEach(s => { s.style.transitionDuration = "0s"; s.style.opacity = 0; });
  v.addEventListener("canplay", () => {
    v.classList.add("on");
    setTimeout(hideSlides, 2100);
  }, { once: true });
  v.addEventListener("error", () => { showSlides(); v.remove(); }, true);
  new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting ? play() : v.pause());
  }, { threshold: .12 }).observe(v);
}

function runPreloader() {  const pctEl = $("#loadPct");
  const t0 = performance.now();
  const minDur = reduceMotion ? 200 : 2100;
  let realPct = 0;
  heroDone.then(() => realPct = 100);
  const failsafe = setTimeout(() => realPct = 100, 3500);
  (function tick() {
    const elapsed = performance.now() - t0;
    const timePct = clamp(elapsed / minDur * 100, 0, 92);
    const rp = Math.min(realPct, 100);
    const shown = Math.round(clamp(Math.max(timePct, rp >= 100 ? 100 : rp * 0.92), 0, 100));
    pctEl.textContent = shown + "%";
    if (shown >= 100 && elapsed >= minDur) {
      clearTimeout(failsafe);
      pctEl.textContent = "100%";
      setTimeout(() => {
        $("#preloader").classList.add("done");
        document.body.classList.add("ready");
        setTimeout(() => $("#preloader").remove(), 1400);
      }, 220);
      return;
    }
    requestAnimationFrame(tick);
  })();
}
