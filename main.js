
/* ── LOADER ── */
(function(){
  const loader=document.getElementById('site-loader');
  const canvas=document.getElementById('loader-canvas');
  const ctx=canvas.getContext('2d');

  const BALL_COUNT=5;
  const BALL_RADIUS=7;     // unchanged — same small size as before
  const SPACING=26;
  const STAGGER=55;        // ms between each ball starting to fall
  const DROP_DURATION=300; // ms to fall + bounce + settle
  const TEXT_DELAY=40;     // ms pause after the last ball settles
  const TEXT_DURATION=480; // ms for the text reveal
  const HOLD=560;          // ms to hold the finished state
  const FADE_DURATION=350; // ms — keep this equal to your .fade-out CSS transition

  let balls=[],startTime=null,settledAt=null,fadeStarted=false;

  function resize(){canvas.width=canvas.offsetWidth;canvas.height=canvas.offsetHeight;}

  function makeBalls(){
    const W=canvas.width,H=canvas.height,cx=W/2,cy=H/2-30;
    balls=[];
    for(let i=0;i<BALL_COUNT;i++){
      balls.push({
        x:cx+(i-Math.floor(BALL_COUNT/2))*SPACING,
        startY:-BALL_RADIUS-20,
        targetY:cy,
        delay:i*STAGGER
      });
    }
  }

  /* standard ease-out-bounce — reaches exactly 1 at t=1, so timing is deterministic */
  function easeOutBounce(t){
    const n1=7.5625,d1=2.75;
    if(t<1/d1)return n1*t*t;
    if(t<2/d1){t-=1.5/d1;return n1*t*t+0.75;}
    if(t<2.5/d1){t-=2.25/d1;return n1*t*t+0.9375;}
    t-=2.625/d1;return n1*t*t+0.984375;
  }

  function drawBall(x,y,r,op){
    ctx.save();
    ctx.globalAlpha=op;
    /* contact shadow for grounding */
    ctx.beginPath();
    ctx.ellipse(x,y+r*0.85,r*0.9,r*0.35,0,0,Math.PI*2);
    ctx.fillStyle='rgba(0,0,0,.18)';
    ctx.fill();
    /* sphere shading instead of a flat fill */
    const grad=ctx.createRadialGradient(x-r*0.35,y-r*0.35,r*0.15,x,y,r);
    grad.addColorStop(0,'#ffffff');
    grad.addColorStop(0.55,'#dde7f0');
    grad.addColorStop(1,'#97aebd');
    ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=grad;ctx.fill();
    /* specular highlight */
    ctx.beginPath();
    ctx.arc(x-r*0.32,y-r*0.32,r*0.28,0,Math.PI*2);
    ctx.fillStyle='rgba(255,255,255,.9)';
    ctx.fill();
    ctx.restore();
  }

  function drawText(progress){
    const W=canvas.width,H=canvas.height,cx=W/2,cy=H/2-30;
    const textY1=cy+52,textY2=cy+90,maxSlide=80;
    const ease=progress<.5?2*progress*progress:-1+(4-2*progress)*progress;
    ctx.save();
    const slide1=maxSlide*(1-ease);
    ctx.globalAlpha=ease;
    const l1a='Jay Verma',l1b=' Homeopathy';
    ctx.font='600 28px serif';const w1a=ctx.measureText(l1a).width;
    ctx.font='300 28px serif';const w1b=ctx.measureText(l1b).width;
    const lx1=cx-(w1a+w1b)/2-slide1;
    ctx.textAlign='left';
    ctx.fillStyle='#7eb8e8';ctx.font='600 28px serif';ctx.fillText(l1a,lx1,textY1);
    ctx.fillStyle='#90d4a0';ctx.font='300 28px serif';ctx.fillText(l1b,lx1+w1a,textY1);
    ctx.fillStyle='rgba(255,255,255,.25)';ctx.beginPath();ctx.arc(cx,textY1+12,2,0,Math.PI*2);ctx.fill();
    const slide2=maxSlide*(1-ease);
    const l2a='Fast ',l2b='Homeopathy';
    ctx.font='600 28px serif';const w2a=ctx.measureText(l2a).width;
    ctx.font='300 28px serif';const w2b=ctx.measureText(l2b).width;
    const lx2=cx-(w2a+w2b)/2+slide2;
    ctx.fillStyle='#e8924a';ctx.font='600 28px serif';ctx.fillText(l2a,lx2,textY2);
    ctx.fillStyle='#90d4a0';ctx.font='300 28px serif';ctx.fillText(l2b,lx2+w2a,textY2);
    ctx.restore();
  }

  function tick(timestamp){
    if(startTime===null)startTime=timestamp;
    const elapsed=timestamp-startTime;
    ctx.clearRect(0,0,canvas.width,canvas.height);

    let allSettled=true;
    for(const b of balls){
      const t=elapsed-b.delay;
      if(t<=0){allSettled=false;continue;}
      const progress=Math.min(1,t/DROP_DURATION);
      const y=b.startY+(b.targetY-b.startY)*easeOutBounce(progress);
      drawBall(b.x,y,BALL_RADIUS,Math.min(1,t/60));
      if(progress<1)allSettled=false;
    }

    if(allSettled){
      if(settledAt===null)settledAt=elapsed;
      const textElapsed=elapsed-settledAt-TEXT_DELAY;
      const textProgress=Math.max(0,Math.min(1,textElapsed/TEXT_DURATION));
      for(const b of balls)drawBall(b.x,b.targetY,BALL_RADIUS,1);
      if(textElapsed>0)drawText(textProgress);

      const holdElapsed=elapsed-settledAt-TEXT_DELAY-TEXT_DURATION;
      if(textProgress>=1 && holdElapsed>=HOLD && !fadeStarted){
        fadeStarted=true;
        loader.classList.add('fade-out');
        setTimeout(()=>loader.remove(),FADE_DURATION);
        return;
      }
    }
    requestAnimationFrame(tick);
  }

  resize();makeBalls();requestAnimationFrame(tick);
})();

/* ── HEADER SCROLL ── */
const header=document.querySelector('.site-header');
window.addEventListener('scroll',()=>{
  header.classList.toggle('scrolled',window.scrollY>60);
},{passive:true});

/* ── MOBILE MENU ── */
const toggle=document.getElementById('menu-toggle');
const nav=document.getElementById('main-nav');
toggle.addEventListener('click',()=>{
  const open=nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded',open);
  document.body.style.overflow=open?'hidden':'';
});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');
  document.body.style.overflow='';
}));

/* ── SCROLL REVEAL ── */
const revealEls=document.querySelectorAll('.reveal,.reveal-left,.reveal-right');
const observer=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}});
},{threshold:.15});
revealEls.forEach(el=>observer.observe(el));

/* ── FAQ ── */
document.querySelectorAll('.faq-question').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const item=btn.parentElement;
    const wasOpen=item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i=>i.classList.remove('open'));
    document.querySelectorAll('.faq-question').forEach(b=>b.setAttribute('aria-expanded','false'));
    if(!wasOpen){item.classList.add('open');btn.setAttribute('aria-expanded','true');}
  });
});


/* ---------- Gallery lightbox ---------- */
(function galleryLightbox() {
  var items = Array.prototype.slice.call(document.querySelectorAll(".gallery-item"));
  var dialog = document.getElementById("galleryLightbox");
  if (!items.length || !dialog || typeof dialog.showModal !== "function") return;

  var imageEl = document.getElementById("lightboxImage");
  var captionEl = document.getElementById("lightboxCaption");
  var closeBtn = document.getElementById("lightboxClose");
  var prevBtn = document.getElementById("lightboxPrev");
  var nextBtn = document.getElementById("lightboxNext");

  var photos = items.map(function (item) {
    var img = item.querySelector("img");
    return {
      src: item.getAttribute("href"),
      alt: img ? img.getAttribute("alt") : "",
      caption: item.getAttribute("data-caption") || "",
    };
  });

  var currentIndex = 0;

  function render(index) {
    currentIndex = (index + photos.length) % photos.length;
    var photo = photos[currentIndex];
    imageEl.src = photo.src;
    imageEl.alt = photo.alt;
    captionEl.textContent =
      photo.caption + " — " + (currentIndex + 1) + " / " + photos.length;
  }

  function open(index) {
    render(index);
    if (!dialog.open) dialog.showModal();
  }

  items.forEach(function (item, index) {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      open(index);
    });
  });

  if (closeBtn) closeBtn.addEventListener("click", function () { dialog.close(); });
  if (prevBtn) prevBtn.addEventListener("click", function () { render(currentIndex - 1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { render(currentIndex + 1); });

  dialog.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") render(currentIndex - 1);
    if (e.key === "ArrowRight") render(currentIndex + 1);
    /* Escape is handled natively by <dialog> */
  });

  dialog.addEventListener("click", function (e) {
    var withinFigure = e.target.closest(".lightbox-figure");
    var withinControl = e.target.closest(".lightbox-close,.lightbox-nav");
    if (!withinFigure && !withinControl) dialog.close();
  });
})();