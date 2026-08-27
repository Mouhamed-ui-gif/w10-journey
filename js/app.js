(function(){
"use strict";
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const D=window.W10_DATA;if(!D)return;
const CDN="https://dyj6gt4964deb.cloudfront.net/images/";
const url=f=>f?CDN+f:"";
const isMobile=matchMedia("(max-width:680px)").matches;
const reduceMotion=matchMedia("(prefers-reduced-motion:reduce)").matches;

/* ===== SPLASH SCREEN ===== */
const splash=$("#splash"),hdr=$("#hdr"),main=$("#main"),ft=$("#ft");
function enterSite(){
  if(!splash)return showMain();
  splash.classList.add("go");
  setTimeout(()=>{splash.remove();showMain()},600);
}
function showMain(){
  hdr&&hdr.classList.remove("hidden");
  main&&main.classList.remove("hidden");
  ft&&ft.classList.remove("hidden");
}
const splashBtn=$("#splashBtn");
if(splashBtn)splashBtn.onclick=enterSite;
setTimeout(enterSite,4000);

/* ===== VIDEO BACKGROUND ===== */
(function(){
  const vid=$("#bgVid");if(!vid)return;
  vid.src="assets/video/bg.mp4";
  const p=vid.play();if(p&&p.catch)p.catch(()=>{});
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

// Iconic images for each country (Unsplash, free to use)
const countryImages={
  "الهند":"https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=80",
  "إيطاليا":"https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=600&q=80",
  "إسبانيا":"https://images.unsplash.com/photo-1543158266-0066955047b1?w=600&q=80",
  "اليابان":"https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80",
  "المكسيك":"https://images.unsplash.com/photo-1518638150340-f706e86654de?w=600&q=80",
  "أمريكا":"https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80"
};

const countryData=foodSections.map(s=>{
  let count=0;s.cats.forEach(c=>count+=c.items.length);
  return{...s,flag:s.flag,name:s.ar,count,img:countryImages[s.ar]||url(s.hero),color:"#f7906c"};
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

  // 3D tilt on touch/mouse
  if(reduceMotion)return;
  const onMove=(e)=>{
    const rect=card.getBoundingClientRect();
    const x=(e.clientX||e.touches?.[0]?.clientX||0)-rect.left;
    const y=(e.clientY||e.touches?.[0]?.clientY||0)-rect.top;
    const cx=rect.width/2,cy=rect.height/2;
    const rx=((y-cy)/cy)*-8;
    const ry=((x-cx)/cx)*8;
    card.style.transform=`perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.03)`;
  };
  const onEnd=()=>{card.style.transform=""};
  card.addEventListener("mousemove",onMove);
  card.addEventListener("touchmove",onMove,{passive:true});
  card.addEventListener("mouseleave",onEnd);
  card.addEventListener("touchend",onEnd);
});

/* ===== OPEN COUNTRY MENU ===== */
const cName=$("#cName"),cFlag=$("#cFlag"),cCount=$("#cCount"),cHero=$("#cHero");
const cCats=$("#cCats"),cSearch=$("#cSearch"),cItems=$("#cItems");

function openCountry(idx){
  const sec=countryData[idx];
  cName.textContent=sec.name;
  cFlag.textContent=sec.flag;
  cHero.style.backgroundImage=`url('${sec.img}')`;
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
  const dCountEl=$("#dCount");if(dCountEl)dCountEl.textContent=total+" مشروب";
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
