(function(){
"use strict";
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const D=window.W10_DATA;if(!D)return;
const CDN="https://dyj6gt4964deb.cloudfront.net/images/";
const url=f=>f?CDN+f:"";
const isMobile=matchMedia("(max-width:680px)").matches;
const reduceMotion=matchMedia("(prefers-reduced-motion:reduce)").matches;

/* ===== CANVAS BOKEH ===== */
(function(){
  const cv=$("#bg");if(!cv||reduceMotion)return;
  const ctx=cv.getContext("2d");if(!ctx)return;
  let W,H;
  const dpr=Math.min(devicePixelRatio||1,isMobile?1.5:2);
  const resize=()=>{W=cv.width=cv.offsetWidth*dpr;H=cv.height=cv.offsetHeight*dpr};
  resize();addEventListener("resize",resize);
  const bokeh=Array.from({length:isMobile?14:28},()=>({
    x:Math.random()*W,y:Math.random()*H,r:(Math.random()*55+15)*dpr,
    hue:18+Math.random()*38,sat:50+Math.random()*30,lit:38+Math.random()*28,
    alpha:.02+Math.random()*.06,vx:(Math.random()-.5)*.28*dpr,vy:(Math.random()-.5)*.18*dpr,
    phase:Math.random()*6.28,speed:.0012+Math.random()*.002
  }));
  const sparks=Array.from({length:isMobile?12:30},()=>({
    x:Math.random()*W,y:Math.random()*H,r:(Math.random()*1.8+.5)*dpr,
    vy:-(Math.random()*.45+.08)*dpr,vx:(Math.random()-.5)*.18*dpr,
    a:Math.random()*.4+.1,hot:Math.random()>.4
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
  burger.onclick=()=>{nav.classList.toggle("open");burger.classList.toggle("burger-open")};
  $$("nav a").forEach(a=>a.onclick=()=>{nav.classList.remove("open");burger.classList.remove("burger-open")});
}

/* ===== PAGE NAVIGATION ===== */
const pages=$$(".page");
function showPage(id){
  pages.forEach(p=>p.classList.remove("active"));
  const el=$("#"+id);if(el)el.classList.add("active");
  window.scrollTo({top:0,behavior:reduceMotion?"auto":"smooth"});
}
window._home=()=>showPage("sec-home");

/* ===== DATA ===== */
const foodSections=D.sections.filter(s=>s.ar!=="المشروبات");
const drinksSection=D.sections.find(s=>s.ar==="المشروبات");

const countryData=foodSections.map(s=>{
  let count=0;s.cats.forEach(c=>count+=c.items.length);
  return{...s,flag:s.flag,name:s.ar,count,img:url(s.hero),color:"#f7906c"};
});

/* ===== BUILD COUNTRIES GRID ===== */
const countriesEl=$("#countries");
countriesEl.innerHTML=countryData.map((c,i)=>`
  <div class="country" data-idx="${i}">
    <div class="c-bg" style="background-image:url('${c.img}')"></div>
    <div class="c-overlay">
      <span class="c-flag">${c.flag}</span>
      <div class="c-ar">${c.name}</div>
      <div class="c-count">${c.count} طبق</div>
    </div>
  </div>
`).join("");

$$(".country").forEach(card=>{
  card.onclick=()=>openCountry(+card.dataset.idx);
});

/* ===== OPEN COUNTRY MENU ===== */
const cName=$("#cName"),cFlag=$("#cFlag"),cCount=$("#cCount");
const cCats=$("#cCats"),cSearch=$("#cSearch"),cItems=$("#cItems");

function openCountry(idx){
  const sec=countryData[idx];
  cName.textContent=sec.name;
  cFlag.textContent=sec.flag;
  let total=0;sec.cats.forEach(c=>total+=c.items.length);
  cCount.textContent=total+" طبق";

  let catsHTML=`<button class="cat on" data-c="all">الكل (${total})</button>`;
  sec.cats.forEach(c=>{
    catsHTML+=`<button class="cat" data-c="${c.name}">${c.name} (${c.items.length})</button>`;
  });
  cCats.innerHTML=catsHTML;
  cSearch.value="";
  renderCountryItems(sec,"all","");

  $$("#cCats .cat").forEach(b=>{
    b.onclick=()=>{
      $$("#cCats .cat").forEach(x=>x.classList.remove("on"));
      b.classList.add("on");
      renderCountryItems(sec,b.dataset.c,cSearch.value);
    };
  });
  cSearch.oninput=()=>{
    const activeCat=$("#cCats .cat.on")?.dataset.c||"all";
    renderCountryItems(sec,activeCat,cSearch.value);
  };
  showPage("sec-country");
}

function renderCountryItems(sec,cat,query){
  let items=[];
  sec.cats.forEach(c=>{
    c.items.forEach(it=>{
      items.push({...it,cat:c.name,img:url(it.img)});
    });
  });
  if(cat!=="all")items=items.filter(i=>i.cat===cat);
  if(query){const q=query.toLowerCase();items=items.filter(i=>i.n.toLowerCase().includes(q)||i.d?.toLowerCase().includes(q))}
  cItems.innerHTML=items.length?items.map(it=>`
    <div class="item" onclick="window._photo('${it.img}')">
      <div class="item-name">${it.n}</div>
      <div class="item-price">${it.p.toLocaleString("ar-DZ")} ${D.place.currency}</div>
      <div class="item-desc">${it.d||""}</div>
      ${it.img?`<div class="item-photo"><img src="${it.img}" alt="${it.n}" loading="lazy" decoding="async"></div>`:""}
    </div>`).join(""):`<p style="text-align:center;color:var(--mut);padding:2rem">لا توجد نتائج</p>`;
}

/* ===== DRINKS ===== */
if(drinksSection){
  let total=0;drinksSection.cats.forEach(c=>total+=c.items.length);
  $("#sec-drinks .section-sub").textContent=total+" مشروب · مشروبات ساخنة وباردة ومنعشة";
  const dCats=$("#dCats"),dSearch=$("#dSearch"),dItems=$("#dItems");

  let catsHTML=`<button class="cat on" data-c="all">الكل (${total})</button>`;
  drinksSection.cats.forEach(c=>{
    catsHTML+=`<button class="cat" data-c="${c.name}">${c.name} (${c.items.length})</button>`;
  });
  dCats.innerHTML=catsHTML;

  function renderDrinks(cat,query){
    let items=[];
    drinksSection.cats.forEach(c=>c.items.forEach(it=>items.push({...it,cat:c.name,img:url(it.img)})));
    if(cat!=="all")items=items.filter(i=>i.cat===cat);
    if(query){const q=query.toLowerCase();items=items.filter(i=>i.n.toLowerCase().includes(q)||i.d?.toLowerCase().includes(q))}
    dItems.innerHTML=items.length?items.map(it=>`
      <div class="item" onclick="window._photo('${it.img}')">
        <div class="item-name">${it.n}</div>
        <div class="item-price">${it.p.toLocaleString("ar-DZ")} ${D.place.currency}</div>
        <div class="item-desc">${it.d||""}</div>
        ${it.img?`<div class="item-photo"><img src="${it.img}" alt="${it.n}" loading="lazy" decoding="async"></div>`:""}
      </div>`).join(""):`<p style="text-align:center;color:var(--mut);padding:2rem">لا توجد نتائج</p>`;
  }
  renderDrinks("all","");
  $$("#dCats .cat").forEach(b=>{
    b.onclick=()=>{
      $$("#dCats .cat").forEach(x=>x.classList.remove("on"));
      b.classList.add("on");
      renderDrinks(b.dataset.c,dSearch.value);
    };
  });
  dSearch.oninput=()=>renderDrinks($("#dCats .cat.on")?.dataset.c||"all",dSearch.value);
}

/* ===== LIGHTBOX ===== */
const lb=$("#lightbox"),lbImg=$("#lbImg"),lbX=$(".lb-x");
window._photo=src=>{if(reduceMotion||!src)return;lbImg.src=src;lb.classList.remove("hidden")};
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
    <div class="rid">${id}</div>
    <p>${data.name} · ${data.date} · ${data.time} · ${data.guests}</p>
    <a href="https://wa.me/?text=${encodeURIComponent("حجز في W10 Journey: "+id)}" target="_blank" class="btn full" style="margin-top:1rem">إرسال عبر الواتساب</a>
  `;
  resultEl.classList.remove("hidden");
  form.reset();
  toast("تم الحجز بنجاح ✓");
  resultEl.scrollIntoView({behavior:reduceMotion?"auto":"smooth",block:"center"});
};
function toast(msg){toastEl.textContent=msg;toastEl.classList.remove("hidden");setTimeout(()=>toastEl.classList.add("hidden"),3000)}

})();
