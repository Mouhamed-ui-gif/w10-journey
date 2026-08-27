(function(){
"use strict";
const $=s=>document.querySelector(s),$$=(s,c)=>[...(c||document).querySelectorAll(s)];
const D=window.W10_DATA;if(!D)return;
const CDN="https://dyj6gt4964deb.cloudfront.net/images/";
const url=f=>f?CDN+f:"";
const reduceMotion=matchMedia("(prefers-reduced-motion:reduce)").matches;

/* ================= SPLASH ================= */
const splash=$("#splash");
const splashImages=[
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80",
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1600&q=80",
  "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1600&q=80"
];
const splashBg=document.getElementById("splashBg");
if(splashBg){
  splashBg.style.backgroundImage=`url('${splashImages[0]}')`;
  if(!reduceMotion){
    let i=0;setInterval(()=>{i=(i+1)%splashImages.length;splashBg.style.backgroundImage=`url('${splashImages[i]}')`},4000);
  }
}
function enterSite(){
  if(!splash)return showMain();
  splash.classList.add("go");
  setTimeout(()=>{splash.classList.add("gone");showMain()},500);
  window.scrollTo(0,0);
  splashBtn&&(splashBtn.onclick=null);
  setTimeout(()=>{if(splashBtn)splashBtn.onclick=enterSite},600);
}
const splashBtn=$("#splashBtn");
if(splashBtn)splashBtn.onclick=enterSite;

function showMain(){
  hdr&&hdr.classList.remove("hidden");
  main&&main.classList.remove("hidden");
  ftr&&ftr.classList.remove("hidden");
  initReveal();
  animateCounts();
}

/* ================= HEADER SCROLL ================= */
const hdr=$("#hdr"),main=$("#main"),ftr=$(".ftr");
let ticking=false;
window.addEventListener("scroll",()=>{
  if(!ticking){requestAnimationFrame(()=>{hdr&&hdr.classList.toggle("scrolled",window.scrollY>40);ticking=false});ticking=true;}
},{passive:true});

/* ================= CURSOR GLOW ================= */
const glow=$("#glow");
if(glow&&matchMedia("(hover:hover)").matches&&!reduceMotion){
  window.addEventListener("mousemove",e=>{
    glow.style.opacity="1";
    glow.style.left=e.clientX+"px";
    glow.style.top=e.clientY+"px";
  });
}

/* ================= PAGE NAV ================= */
const pages=$$(".page");
function showPage(id){
  pages.forEach(p=>p.classList.remove("active"));
  const el=$("#"+id);if(el)el.classList.add("active");
  $$(".bnav-i").forEach(b=>b.classList.toggle("active",b.dataset.go===id));
  window.scrollTo({top:0,behavior:reduceMotion?"auto":"instant"});
  initReveal();
}
window._home=()=>showPage("sec-home");
window._go=id=>showPage(id);
window._contact=()=>showPage("sec-review");
window._openLoc=()=>{if(D.place.maps)window.open(D.place.maps,"_blank")};

/* topnav + bnav wiring */
$$(".topnav a").forEach(a=>a.onclick=()=>showPage(a.dataset.g||"sec-home"));
$$("#bnav .bnav-i").forEach(b=>b.onclick=()=>showPage(b.dataset.go));

/* ================= DATA ================= */
const foodSections=D.sections.filter(s=>s.ar!=="المشروبات");
const drinksSection=D.sections.find(s=>s.ar==="المشروبات");
const countryImages={
  "الهند":"https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80",
  "إيطاليا":"https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&q=80",
  "إسبانيا":"https://images.unsplash.com/photo-1543158266-0066955047b1?w=800&q=80",
  "اليابان":"https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80",
  "المكسيك":"https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&q=80",
  "أمريكا":"https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80"
};
const countryData=foodSections.map((s,i)=>{
  let count=0;s.cats.forEach(c=>count+=c.items.length);
  return{...s,name:s.ar,flag:s.flag,count,img:countryImages[s.ar]||url(s.hero),num:String(i+1).padStart(2,"0")};
});

/* ================= HERO IMG ================= */
const heroImg=$("#heroImg");
if(heroImg)heroImg.style.backgroundImage=`url('${splashImages[1]}')`;

/* ================= BUILD CUISINES ================= */
const countriesEl=$("#countries");
if(countriesEl){
  countriesEl.innerHTML=countryData.map((c,i)=>`
    <div class="cuisine reveal" data-idx="${i}" style="transition-delay:${(i%3)*90}ms">
      <div class="c-bg" style="background-image:url('${c.img}')"></div>
      <div class="c-scrim"></div>
      <span class="c-num">${c.num}</span>
      <span class="c-flag">${c.flag}</span>
      <div class="c-overlay">
        <div class="c-name">${c.name}</div>
        <div class="c-count">${c.count} طبق</div>
        <span class="c-more">استكشف <span>→</span></span>
      </div>
    </div>
  `).join("");
  $$(".cuisine").forEach(card=>{
    card.onclick=()=>openCountry(+card.dataset.idx);
    if(reduceMotion)return;
    const onMove=e=>{
      const r=card.getBoundingClientRect();
      const x=(e.touches?.[0]?.clientX||e.clientX||0)-r.left;
      const y=(e.touches?.[0]?.clientY||e.clientY||0)-r.top;
      card.style.transform=`perspective(900px) rotateX(${((y-r.height/2)/r.height)*-7}deg) rotateY(${((x-r.width/2)/r.width)*7}deg) translateY(-4px)`;
    };
    const onEnd=()=>{card.style.transform=""};
    card.addEventListener("mousemove",onMove);
    card.addEventListener("touchmove",onMove,{passive:true});
    card.addEventListener("mouseleave",onEnd);
    card.addEventListener("touchend",onEnd);
  });
}

/* ================= OPEN COUNTRY ================= */
const cName=$("#cName"),cFlagE=$("#cFlag"),cCountE=$("#cCount"),chBg=$("#chBg");
const cCats=$("#cCats"),cSearch=$("#cSearch"),cItems=$("#cItems");
function openCountry(idx){
  const sec=countryData[idx];
  if(cName)cName.textContent=sec.name;
  if(cFlagE)cFlagE.textContent=sec.flag;
  if(chBg)chBg.style.backgroundImage=`url('${sec.img}')`;
  let total=0;sec.cats.forEach(c=>total+=c.items.length);
  if(cCountE)cCountE.textContent=`أكثر من ${total} طبق · ${sec.cats.length} أصناف`;
  renderCountry(sec);
  showPage("sec-country");
  initReveal();
}
function renderCountry(sec){
  let total=0;sec.cats.forEach(c=>total+=c.items.length);
  let catsHTML=`<button class="cat on" data-c="all">الكل (${total})</button>`;
  sec.cats.forEach(c=>catsHTML+=`<button class="cat" data-c="${c.name}">${c.name} (${c.items.length})</button>`);
  cCats.innerHTML=catsHTML;
  cSearch.value="";
  renderItems(sec,"all","");
  $$("#cCats .cat").forEach(b=>b.onclick=()=>{
    $$("#cCats .cat").forEach(x=>x.classList.remove("on"));b.classList.add("on");
    renderItems(sec,b.dataset.c,cSearch.value);
  });
  cSearch.oninput=()=>renderItems(sec,$("#cCats .cat.on")?.dataset.c||"all",cSearch.value);
}

/* ================= ITEM RENDER ================= */
function menuCard(it,idx){
  const img=it.img?`<div class="item-photo"><img src="${it.img}" alt="${it.n}" loading="lazy" decoding="async"></div>`:`<div class="item-photo no-photo"><div class="item-noimg">${(it.n||"؟")[0]}</div></div>`;
  return `
  <div class="item reveal" style="transition-delay:${(idx%6)*70}ms" onclick="window._photo('${it.img||''}')">
    ${img}
    <div class="item-info">
      <div class="item-name">${it.n}</div>
      ${it.d?`<div class="item-desc">${it.d}</div>`:""}
      <div class="item-price-row"><span class="item-price">${it.p.toLocaleString("ar-DZ")} ${D.place.currency}</span></div>
    </div>
  </div>`;
}
function flatten(sec){const a=[];sec.cats.forEach(c=>c.items.forEach(it=>a.push({...it,cat:c.name,img:url(it.img)})));return a}
let itemsHost=null;
function renderItems(sec,cat,query,host){
  host=host||$("#cItems");
  let items=flatten(sec);
  if(cat!=="all")items=items.filter(i=>i.cat===cat);
  if(query){const q=query.toLowerCase();items=items.filter(i=>i.n.toLowerCase().includes(q)||i.d?.toLowerCase().includes(q))}
  host.innerHTML=items.length?items.map((it,i)=>menuCard(it,i)).join(""):`<p style="text-align:center;color:var(--mut2);padding:3rem;grid-column:1/-1">لا توجد نتائج</p>`;
  bindMenuCards(host);
  initReveal(host);
}
function bindMenuCards(host){
  if(reduceMotion)return;
  $$(".item",host).forEach(card=>{
    const onMove=e=>{
      const r=card.getBoundingClientRect();
      const x=(e.touches?.[0]?.clientX||e.clientX||0)-r.left;
      const y=(e.touches?.[0]?.clientY||e.clientY||0)-r.top;
      card.style.transform=`perspective(800px) rotateX(${((y-r.height/2)/r.height)*-8}deg) rotateY(${((x-r.width/2)/r.width)*8}deg)`;
    };
    const onEnd=()=>{card.style.transform=""};
    card.addEventListener("mousemove",onMove);
    card.addEventListener("touchmove",onMove,{passive:true});
    card.addEventListener("mouseleave",onEnd);
    card.addEventListener("touchend",onEnd);
  });
}

/* ================= DRINKS ================= */
if(drinksSection){
  const dCats=$("#dCats"),dSearch=$("#dSearch"),dItems=$("#dItems");
  let total=0;drinksSection.cats.forEach(c=>total+=c.items.length);
  let catsHTML=`<button class="cat on" data-c="all">الكل (${total})</button>`;
  drinksSection.cats.forEach(c=>catsHTML+=`<button class="cat" data-c="${c.name}">${c.name} (${c.items.length})</button>`);
  dCats.innerHTML=catsHTML;
  function renderDrinks(cat,query){
    let items=flatten(drinksSection);
    if(cat!=="all")items=items.filter(i=>i.cat===cat);
    if(query){const q=query.toLowerCase();items=items.filter(i=>i.n.toLowerCase().includes(q)||i.d?.toLowerCase().includes(q))}
    dItems.innerHTML=items.length?items.map((it,i)=>menuCard(it,i)).join(""):`<p style="text-align:center;color:var(--mut2);padding:3rem;grid-column:1/-1">لا توجد نتائج</p>`;
    bindMenuCards(dItems);initReveal(dItems);
  }
  renderDrinks("all","");
  $$("#dCats .cat").forEach(b=>b.onclick=()=>{
    $$("#dCats .cat").forEach(x=>x.classList.remove("on"));b.classList.add("on");
    renderDrinks(b.dataset.c,dSearch.value);
  });
  dSearch.oninput=()=>renderDrinks($("#dCats .cat.on")?.dataset.c||"all",dSearch.value);
}

/* ================= LIGHTBOX ================= */
const lb=$("#lightbox"),lbImg=$("#lbImg"),lbX=$(".lb-x");
window._photo=src=>{if(!src)return;lbImg.src=src;lb.classList.remove("hidden")};
if(lbX)lbX.onclick=()=>lb.classList.add("hidden");
if(lb)lb.onclick=e=>{if(e.target===lb)lb.classList.add("hidden")};

/* ================= CONTACT ================= */
const contactEl=$("#contactBtns");
if(contactEl){
  const contacts=[
    {ic:"◉",name:"إنستغرام",sub:"@w10journey",href:"https://www.instagram.com/w10journey/",img:"https://images.unsplash.com/photo-1611262588024-d12430b98920?w=500&q=80"},
    {ic:"◉",name:"فيسبوك",sub:"w10journey",href:"https://www.facebook.com/w10journey",img:"https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&q=80"},
    {ic:"◉",name:"تيك توك",sub:"@w10.journey",href:"https://www.tiktok.com/@w10.journey",img:"https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80"},
    {ic:"❖",name:"الموقع",sub:"الخروب، قسنطينة",href:D.place.maps,img:"https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=500&q=80"}
  ];
  contactEl.innerHTML=contacts.map(c=>`
    <a class="c-btn reveal" href="${c.href}" target="_blank" rel="noopener">
      <div class="cb-img" style="background-image:url('${c.img}')"></div>
      <div class="cb-shade"></div>
      <span class="cb-ic">${c.ic}</span>
      <span class="cb-name">${c.name}</span>
      <span class="cb-sub">${c.sub}</span>
    </a>
  `).join("");
}

/* ================= REVIEW ================= */
const stars=$("#stars"),starsLabel=$("#starsLabel"),revText=$("#revText"),revName=$("#revName"),revSend=$("#revSend"),revResult=$("#revResult");
let rating=0;
if(stars){
  const starSpans=$$("span",stars);
  starSpans.forEach(s=>s.onclick=()=>{
    rating=+s.dataset.v;
    starSpans.forEach(x=>x.classList.toggle("on",+x.dataset.v<=rating));
    const labels=["ممتاز!","جيد جداً","جيد","متوسط","ضعيف"];
    starsLabel.textContent=labels[5-rating]||"اضغط على النجوم";
  });
  if(revSend)revSend.onclick=()=>{
    const text=(revText.value||"").trim();
    if(!rating){toast("اختر عدد النجوم أولاً ⭐");return}
    const saved=JSON.parse(localStorage.getItem("w10_reviews")||"[]");
    saved.push({rating,text,name:revName.value||"",date:new Date().toISOString()});
    localStorage.setItem("w10_reviews",JSON.stringify(saved));
    revResult.innerHTML=`<h3>شكراً لتقييمك</h3><div class="rid">${"★".repeat(rating)}${"☆".repeat(5-rating)}</div><p style="color:var(--mut)">رأيك وصلنا بنجاح.</p>`;
    revResult.classList.remove("hidden");
    revSend.style.display="none";
  };
}

/* ================= BOOKING ================= */
const form=$("#form"),resultEl=$("#result"),toastEl=$("#toast");
if(form){
  const timeSel=form.elements.time;
  for(let h=11;h<23;h++)for(const m of["00","30"]){const o=document.createElement("option");o.value=h+":"+m;o.textContent=h+":"+m;timeSel.appendChild(o)}
  form.onsubmit=e=>{
    e.preventDefault();
    const fd=new FormData(form);
    const id="W10-"+Math.random().toString(36).slice(2,7).toUpperCase();
    const data=Object.fromEntries(fd);data.id=id;
    const saved=JSON.parse(localStorage.getItem("w10_reservations")||"[]");
    saved.push(data);localStorage.setItem("w10_reservations",JSON.stringify(saved));
    resultEl.innerHTML=`
      <h3>تم تأكيد حجزك</h3>
      <div class="rid">${id}</div>
      <p style="color:var(--mut)">${data.name} · ${data.date} · ${data.time} · ${data.guests}</p>
      <a href="https://wa.me/?text=${encodeURIComponent("حجز في W10 Journey: "+id)}" target="_blank" class="btn btn-gold full sm" style="margin-top:1.2rem">تأكيد عبر واتساب</a>
    `;
    resultEl.classList.remove("hidden");
    form.reset();
    toast("تم الحجز بنجاح");
  };
}
function toast(msg){toastEl.textContent=msg;toastEl.classList.remove("hidden");setTimeout(()=>toastEl.classList.add("hidden"),3200)}

/* ================= COUNTS ANIM ================= */
function animateCounts(){
  $$("[data-count]").forEach(el=>{
    const target=+el.dataset.count;
    if(reduceMotion){el.textContent=target;return}
    const dur=1200,t0=performance.now();
    function tick(now){
      const p=Math.min((now-t0)/dur,1);
      el.textContent=Math.floor(p*target).toLocaleString("ar-DZ");
      if(p<1)requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

/* ================= REVEAL ================= */
let revealInit=0;
function initReveal(scope){
  const els=$$(".reveal:not(.in)",scope||document);
  if(!els.length)return;
  if("IntersectionObserver"in window&&!reduceMotion){
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{threshold:.1});
    els.forEach(el=>io.observe(el));
  }else{
    els.forEach(el=>el.classList.add("in"));
  }
}

/* initial */
showMain();
})();
