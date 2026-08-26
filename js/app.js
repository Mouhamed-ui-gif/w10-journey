(function(){
"use strict";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const D=window.W10_DATA;if(!D)return;
const CDN="https://dyj6gt4964deb.cloudfront.net/images/";
const url=f=>f?CDN+f:"";
const isMobile=matchMedia("(max-width:700px)").matches;
const reduceMotion=matchMedia("(prefers-reduced-motion:reduce)").matches;

/* ===== CANVAS BOKEH BACKGROUND ===== */
(function(){
  const cv=$("#bg");if(!cv||reduceMotion)return;
  const ctx=cv.getContext("2d");if(!ctx)return;
  let W,H;
  const dpr=Math.min(devicePixelRatio||1,isMobile?1.5:2);
  const resize=()=>{W=cv.width=cv.offsetWidth*dpr;H=cv.height=cv.offsetHeight*dpr};
  resize();addEventListener("resize",resize);
  const bokeh=Array.from({length:isMobile?16:30},()=>({
    x:Math.random()*W,y:Math.random()*H,r:(Math.random()*65+18)*dpr,
    hue:18+Math.random()*38,sat:50+Math.random()*30,lit:40+Math.random()*28,
    alpha:.025+Math.random()*.065,vx:(Math.random()-.5)*.3*dpr,vy:(Math.random()-.5)*.2*dpr,
    phase:Math.random()*6.28,speed:.0015+Math.random()*.0025
  }));
  const sparks=Array.from({length:isMobile?14:35},()=>({
    x:Math.random()*W,y:Math.random()*H,r:(Math.random()*2+.5)*dpr,
    vy:-(Math.random()*.5+.1)*dpr,vx:(Math.random()-.5)*.2*dpr,
    a:Math.random()*.45+.12,hot:Math.random()>.4
  }));
  (function loop(){
    if(document.hidden)return requestAnimationFrame(loop);
    const bg=ctx.createRadialGradient(W*.55,H*.38,0,W*.55,H*.38,W*.65);
    bg.addColorStop(0,"#1a0e08");bg.addColorStop(.55,"#0f0906");bg.addColorStop(1,"#080503");
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    bokeh.forEach(p=>{
      p.x+=p.vx;p.y+=p.vy;p.phase+=p.speed;
      if(p.x<-p.r)p.x=W+p.r;if(p.x>W+p.r)p.x=-p.r;
      if(p.y<-p.r)p.y=H+p.r;if(p.y>H+p.r)p.y=-p.r;
      const a=p.alpha*(.55+.45*Math.sin(p.phase));
      const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);
      g.addColorStop(0,`hsla(${p.hue},${p.sat}%,${p.lit}%,${a})`);
      g.addColorStop(1,`hsla(${p.hue},${p.sat}%,${p.lit}%,0)`);
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.29);ctx.fill();
    });
    sparks.forEach(s=>{
      s.x+=s.vx;s.y+=s.vy;
      if(s.y<-10){s.y=H+10;s.x=Math.random()*W}
      ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,6.29);
      ctx.fillStyle=s.hot?`rgba(255,${170+Math.random()*50|0},${50+Math.random()*40|0},${s.a})`:`rgba(247,144,108,${s.a*.7})`;
      ctx.fill();
    });
    requestAnimationFrame(loop);
  })();
})();

/* ===== MOBILE NAV ===== */
const burger=$("#burger"),nav=$("#nav");
if(burger&&nav){
  burger.onclick=()=>{
    nav.classList.toggle("open");
    burger.classList.toggle("burger-open");
  };
  $$("nav a").forEach(a=>a.onclick=()=>{nav.classList.remove("open");burger.classList.remove("burger-open")});
}

/* ===== MENU ===== */
let allItems=[],activeCat="الكل";
D.sections.forEach(s=>s.cats.forEach(c=>c.items.forEach(it=>{
  allItems.push({...it,section:s.ar,cat:c.name,img:url(it.img),secColor:"#f7906c"});
})));

const catsEl=$("#cats"),itemsEl=$("#items"),searchEl=$("#search");
const catSet=["الكل",...new Set(allItems.map(i=>i.cat))];
catsEl.innerHTML=catSet.map(c=>`<button class="cat${c==="الكل"?" on":""}" data-c="${c}">${c}</button>`);

$$(".cat").forEach(b=>b.onclick=()=>{
  $$(".cat").forEach(x=>x.classList.remove("on"));
  b.classList.add("on");activeCat=b.dataset.c;render();
});

function render(){
  const q=(searchEl.value||"").trim().toLowerCase();
  let list=allItems;
  if(activeCat!=="الكل")list=list.filter(i=>i.cat===activeCat);
  if(q)list=list.filter(i=>i.n.toLowerCase().includes(q)||i.d.toLowerCase().includes(q));
  itemsEl.innerHTML=list.length?list.map(it=>`
    <div class="item" onclick="window._showPhoto('${it.img}')">
      <div class="item-name">${it.n}</div>
      <div class="item-price">${it.p.toLocaleString("ar-DZ")} ${D.place.currency}</div>
      <div class="item-desc">${it.d||""}</div>
      ${it.img?`<div class="item-photo"><img src="${it.img}" alt="${it.n}" loading="lazy" decoding="async"></div>`:""}
    </div>`).join(""):`<p style="text-align:center;color:var(--mut);padding:2rem">لا توجد نتائج</p>`;
}
searchEl.oninput=render;
render();

/* ===== GALLERY ===== */
const galEl=$("#gal");
const galPics=[];
D.sections.forEach(s=>{
  if(s.hero)galPics.push({src:url(s.hero),cap:s.flag+" "+s.ar});
  (s.gallery||[]).slice(0,3).forEach(f=>galPics.push({src:url(f),cap:s.flag+" "+s.ar}));
});
galEl.innerHTML=galPics.slice(0,21).map(p=>`<img src="${p.src}" alt="${p.cap}" loading="lazy" decoding="async">`).join("");

/* ===== LIGHTBOX ===== */
const lb=$("#lightbox"),lbImg=$("#lbImg"),lbX=$(".lb-x");
window._showPhoto=src=>{if(reduceMotion)return;lbImg.src=src;lb.classList.remove("hidden")};
if(lbX)lbX.onclick=()=>lb.classList.add("hidden");
lb.onclick=e=>{if(e.target===lb)lb.classList.add("hidden")};

/* ===== BOOKING ===== */
const form=$("#form"),resultEl=$("#result"),toastEl=$("#toast");
const timeSel=form.elements.time;
for(let h=11;h<23;h++)for(const m of["00","30"]){
  const opt=document.createElement("option");opt.value=h+":"+m;opt.textContent=h+":"+m;
  timeSel.appendChild(opt);
}

form.onsubmit=e=>{
  e.preventDefault();
  const fd=new FormData(form);
  const id="W10-"+Math.random().toString(36).slice(2,7).toUpperCase();
  const data=Object.fromEntries(fd);data.id=id;
  const saved=JSON.parse(localStorage.getItem("w10_reservations")||"[]");
  saved.push(data);localStorage.setItem("w10_reservations",JSON.stringify(saved));

  resultEl.innerHTML=`
    <h3>تم تأكيد حجزك!</h3>
    <div class="id">${id}</div>
    <p>${data.name} · ${data.date} · ${data.time} · ${data.guests}</p>
    <a href="https://wa.me/?text=${encodeURIComponent("حجز في W10 Journey: "+id)}" target="_blank" class="btn full">إرسال عبر الواتساب</a>
  `;
  resultEl.classList.remove("hidden");
  form.reset();
  toast("تم الحجز بنجاح ✓");
  resultEl.scrollIntoView({behavior:"smooth",block:"center"});
};

function toast(msg){toastEl.textContent=msg;toastEl.classList.remove("hidden");setTimeout(()=>toastEl.classList.add("hidden"),3000)}

})();
