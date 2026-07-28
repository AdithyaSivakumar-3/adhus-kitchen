/* ============ Adhu's Kitchen — interactivity ============ */
const CUISINE_LABEL = {south:"South Indian", north:"North Indian", indochinese:"Asian", global:"World"};
const spiceIcons = n => n===0 ? "🍯 sweet" : "🌶️".repeat(n);

let state = {cuisine:"all", course:"all", q:"", lang:"en"};
let visible = [];           // currently visible dishes (for lightbox nav)
let lbList = [];            // list the lightbox navigates within
let lbIndex = 0;
const dishName = d => state.lang==="ta" && TA_NAMES[d.id] ? TA_NAMES[d.id] : d.name;
function contactLink(text){
  if(SITE.whatsapp) return "https://wa.me/"+SITE.whatsapp+"?text="+encodeURIComponent(text);
  return "mailto:"+SITE.email+"?subject="+encodeURIComponent("Adhu's Kitchen 🍛")+"&body="+encodeURIComponent(text);
}

/* ---------- render cards ---------- */
function cardHTML(d){
  return `<article class="card" data-id="${d.id}" tabindex="0" aria-label="${d.name}">
    <div class="card-img">
      ${d.fest ? `<span class="fest-ribbon">✨ ${d.fest}</span>` : ""}
      ${SIGNATURES.includes(d.id) ? `<span class="sig-star" title="Adhu's signature">⭐</span>` : ""}
      <img src="thumbs/${d.id}.jpg" alt="${d.name}" loading="lazy">
      <span class="card-view">View dish</span>
    </div>
    <div class="card-body">
      <h3>${dishName(d)}</h3>
      <div class="card-meta">
        <span class="tag ${d.cuisine}">${CUISINE_LABEL[d.cuisine]}</span>
        <span class="spice" title="spice level">${spiceIcons(d.spice)}</span>
        <span class="card-date">${d.date}</span>
      </div>
    </div>
  </article>`;
}

function applyFilters(){
  const q = state.q.trim().toLowerCase();
  visible = DISHES.filter(d =>
    (state.cuisine==="all" || d.cuisine===state.cuisine) &&
    (!q || d.name.toLowerCase().includes(q) || d.blurb.toLowerCase().includes(q))
  );
  let any = false;
  document.querySelectorAll(".grid").forEach(grid=>{
    const course = grid.dataset.course;
    const items = visible.filter(d=>d.course===course);
    grid.innerHTML = items.map(cardHTML).join("");
    const section = grid.closest(".course-section");
    section.style.display = items.length ? "" : "none";
    if(items.length) any = true;
  });
  document.getElementById("emptyNote").hidden = any;
  observeCards();
  document.querySelectorAll(".card").forEach(c=>{
    c.addEventListener("click", ()=>openLb(c.dataset.id, visible));
    c.addEventListener("keydown", e=>{ if(e.key==="Enter") openLb(c.dataset.id, visible); });
  });
}

/* ---------- scroll reveal ---------- */
let io;
function observeCards(){
  if(io) io.disconnect();
  io = new IntersectionObserver(entries=>{
    entries.forEach((en,i)=>{
      if(en.isIntersecting){
        setTimeout(()=>en.target.classList.add("reveal"), (i%6)*70);
        io.unobserve(en.target);
      }
    });
  },{threshold:.12});
  document.querySelectorAll(".card:not(.reveal)").forEach(c=>io.observe(c));
}

/* ---------- filters ---------- */
document.querySelectorAll(".cui-card").forEach(ch=>ch.addEventListener("click",()=>{
  document.querySelectorAll(".cui-card").forEach(c=>c.classList.remove("active"));
  ch.classList.add("active"); state.cuisine = ch.dataset.cuisine; applyFilters();
}));
const SECTION_ORDER = ["starters","mains","desserts"];
document.querySelectorAll(".chip[data-course-filter]").forEach(ch=>ch.addEventListener("click",()=>{
  document.querySelectorAll(".chip[data-course-filter]").forEach(c=>c.classList.remove("active"));
  ch.classList.add("active");
  const sel = ch.dataset.courseFilter;
  const order = sel==="all" ? SECTION_ORDER : [sel, ...SECTION_ORDER.filter(s=>s!==sel)];
  const mainEl = document.querySelector("main");
  const anchor = document.getElementById("emptyNote");
  order.forEach(id=>mainEl.insertBefore(document.getElementById(id), anchor));
  document.querySelectorAll(".card").forEach(c=>c.classList.add("reveal"));
  if(sel!=="all"){
    const y = document.getElementById(sel).getBoundingClientRect().top + window.scrollY - 150;
    window.scrollTo({top:y, behavior:"smooth"});
  }
}));
document.getElementById("search").addEventListener("input",e=>{
  state.q = e.target.value; applyFilters();
});

/* ---------- hero counters ---------- */
function animateCounters(){
  document.querySelectorAll(".stat").forEach(el=>{
    const target = +el.dataset.count, t0 = performance.now(), dur = 1400;
    const step = t=>{
      const k = Math.min((t-t0)/dur,1);
      el.textContent = Math.round(target*(1-Math.pow(1-k,3)));
      if(k<1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

/* ---------- lightbox ---------- */
const lb = document.getElementById("lightbox");
function openLb(id, list){
  lbList = (list && list.length) ? list : DISHES;
  lbIndex = lbList.findIndex(d=>d.id===id);
  if(lbIndex<0){ lbList = DISHES; lbIndex = DISHES.findIndex(d=>d.id===id); }
  renderLb(); lb.hidden = false; document.body.style.overflow="hidden";
}
function renderLb(){
  const d = lbList[lbIndex];
  document.getElementById("lbImg").src = `images/${d.id}.jpg`;
  document.getElementById("lbImg").alt = d.name;
  document.getElementById("lbName").textContent = dishName(d);
  document.getElementById("lbBlurb").textContent = d.blurb;
  document.getElementById("lbFest").textContent = d.fest ? `✨ ${d.fest}` : "";
  document.getElementById("lbCuisine").textContent = `🍽 ${CUISINE_LABEL[d.cuisine]}`;
  document.getElementById("lbSpice").textContent = spiceIcons(d.spice);
  document.getElementById("lbDate").textContent = `📅 ${d.date}`;
  document.getElementById("lbWant").href = contactLink(
    `Adhu! 🍽 I'm officially claiming a plate of "${d.name}" — cook it for me? 😋`);
}
function closeLb(){ lb.hidden = true; document.body.style.overflow=""; }
document.getElementById("lbClose").addEventListener("click", closeLb);
document.getElementById("lbPrev").addEventListener("click", ()=>{ lbIndex=(lbIndex-1+lbList.length)%lbList.length; renderLb(); });
document.getElementById("lbNext").addEventListener("click", ()=>{ lbIndex=(lbIndex+1)%lbList.length; renderLb(); });
lb.addEventListener("click", e=>{ if(e.target===lb) closeLb(); });
document.addEventListener("keydown", e=>{
  if(lb.hidden) return;
  if(e.key==="Escape") closeLb();
  if(e.key==="ArrowLeft") { lbIndex=(lbIndex-1+lbList.length)%lbList.length; renderLb(); }
  if(e.key==="ArrowRight"){ lbIndex=(lbIndex+1)%lbList.length; renderLb(); }
});

/* ---------- nav ---------- */
document.getElementById("navToggle").addEventListener("click",()=>{
  document.querySelector(".nav-links").classList.toggle("open");
});
document.querySelectorAll(".nav-links a").forEach(a=>a.addEventListener("click",()=>{
  document.querySelector(".nav-links").classList.remove("open");
}));
// active section highlight
const secObs = new IntersectionObserver(es=>{
  es.forEach(en=>{
    if(en.isIntersecting){
      document.querySelectorAll(".nav-links a").forEach(a=>
        a.classList.toggle("active", a.getAttribute("href")==="#"+en.target.id));
    }
  });
},{rootMargin:"-40% 0px -55% 0px"});
["starters","mains","desserts","about"].forEach(id=>{
  const el=document.getElementById(id); if(el) secObs.observe(el);
});

/* ---------- thirukkural rotation ---------- */
const KURALS = [
 {n:322, ta:"பகுத்துண்டு பல்லுயிர் ஓம்புதல் நூலோர்\nதொகுத்தவற்றுள் எல்லாம் தலை",
  en:"Share your food and care for all that lives — of all virtues the wise have named, this stands first."},
 {n:83, ta:"வருவிருந்து வைகலும் ஓம்புவான் வாழ்க்கை\nபருவந்து பாழ்படுதல் இன்று",
  en:"The life of one who daily welcomes the arriving guest shall never fall to ruin."},
 {n:85, ta:"வித்தும் இடல்வேண்டும் கொல்லோ விருந்தோம்பி\nமிச்சில் மிசைவான் புலம்",
  en:"Does the field of one who feeds his guests first, and dines on what remains, even need sowing?"},
 {n:942, ta:"மருந்தென வேண்டாவாம் யாக்கைக்கு அருந்தியது\nஅற்றது போற்றி உணின்",
  en:"The body needs no medicine, if you eat only once the last meal is truly digested."}
];
let kuralIdx = 0;
function renderKural(){
  const k = KURALS[kuralIdx];
  const ta=document.getElementById("kuralTa");
  if(!ta) return;
  ta.textContent = k.ta;
  document.getElementById("kuralEn").textContent = "“"+k.en+"”";
  document.getElementById("kuralNumTa").textContent = "குறள் "+k.n;
  document.getElementById("kuralNumEn").textContent = "Kural "+k.n;
}
renderKural();
setInterval(()=>{
  const panels = document.querySelectorAll(".kural-panel");
  panels.forEach(p=>{ p.classList.remove("flip-in"); p.classList.add("flip-out"); });
  setTimeout(()=>{
    kuralIdx = (kuralIdx+1)%KURALS.length;
    renderKural();
    panels.forEach(p=>{ p.classList.remove("flip-out"); p.classList.add("flip-in"); });
  }, 450);
}, 10000);

/* ---------- signature strip ---------- */
function renderSigStrip(){
  const strip = document.getElementById("sigStrip");
  const sigs = SIGNATURES.map(id=>DISHES.find(d=>d.id===id)).filter(Boolean);
  strip.innerHTML = sigs.map(d=>
    `<div class="sig-card" data-id="${d.id}" role="button" tabindex="0">
       <img src="thumbs/${d.id}.jpg" alt="${d.name}" loading="lazy"><p>${dishName(d)}</p></div>`).join("");
  strip.querySelectorAll(".sig-card").forEach(c=>{
    c.addEventListener("click", ()=>openLb(c.dataset.id,
      SIGNATURES.map(id=>DISHES.find(d=>d.id===id)).filter(Boolean)));
  });
}

/* ---------- "this month, back then" ---------- */
function renderMonthback(){
  const el = document.getElementById("monthback");
  const now = new Date();
  const mon = now.toLocaleString("en",{month:"short"});
  const items = DISHES.filter(d=>{
    const m = d.date.match(/^([A-Za-z]{3}) (\d{4})$/);
    return m && m[1]===mon && +m[2] < now.getFullYear();
  });
  if(!items.length){ el.hidden = true; return; }
  el.hidden = false;
  el.innerHTML = `🗓️ <b>${now.toLocaleString("en",{month:"long"})} on the stove, back then:</b> ` +
    items.map(d=>`<a href="#" data-id="${d.id}">${dishName(d)} '${d.date.slice(-2)}</a>`).join(" · ");
  el.querySelectorAll("a").forEach(a=>a.addEventListener("click",e=>{
    e.preventDefault(); openLb(a.dataset.id, items);
  }));
}

/* ---------- surprise me ---------- */
document.getElementById("surpriseBtn").addEventListener("click",()=>{
  const d = DISHES[Math.floor(Math.random()*DISHES.length)];
  openLb(d.id, DISHES);
});

/* ---------- tamil / english toggle ---------- */
document.getElementById("langToggle").addEventListener("click",()=>{
  state.lang = state.lang==="en" ? "ta" : "en";
  const btn = document.getElementById("langToggle");
  btn.textContent = state.lang==="en" ? "தமிழ்" : "English";
  btn.classList.toggle("on", state.lang==="ta");
  applyFilters(); renderSigStrip(); renderMonthback();
  document.querySelectorAll(".card").forEach(c=>c.classList.add("reveal"));
  if(!lb.hidden) renderLb();
});

/* ---------- suggest a dish ---------- */
document.getElementById("suggestBtn").addEventListener("click",()=>{
  const v = document.getElementById("suggestInput").value.trim();
  const text = v ? `Adhu! 🍳 Challenge for your kitchen: cook "${v}" and put it on the site!`
              : `Adhu! 🍳 I have a dish suggestion for your kitchen…`;
  window.open(contactLink(text), "_blank");
});
document.getElementById("suggestInput").addEventListener("keydown",e=>{
  if(e.key==="Enter") document.getElementById("suggestBtn").click();
});

/* ---------- back to top + progress dots ---------- */
const toTop = document.getElementById("toTop");
window.addEventListener("scroll",()=>{ toTop.hidden = window.scrollY < 700; },{passive:true});
toTop.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));
const dotObs = new IntersectionObserver(es=>{
  es.forEach(en=>{
    if(en.isIntersecting){
      document.querySelectorAll(".progress-dots a").forEach(a=>
        a.classList.toggle("on", a.dataset.dot===en.target.id));
    }
  });
},{rootMargin:"-40% 0px -55% 0px"});
["starters","mains","desserts","about"].forEach(id=>{
  const el=document.getElementById(id); if(el) dotObs.observe(el);
});

/* ---------- init ---------- */
applyFilters();
animateCounters();
renderSigStrip();
renderMonthback();
