// Agent Select: the character-select stage for the #agents section.
// Scrolling the pinned section moves through the roster; arrows, dots, keys and swipes jump to an agent.
// Stats are game ratings; the counters under each agent are real figures as of 2026-10-07.
const IMG = "/img/agents/select/";
const AGENTS = [
  { key: "carl", name: "CARL", cls: "The Market Research Guru", lvl: ["24", "market tools"], status: "online", hue: "20deg", tint: "#56c2ff", live: "carl",
    stats: [["Market IQ", 92], ["Data Depth", 88], ["Speed", 84], ["Chart Skills", 76]],
    loadout: ["Live quotes + fundamentals", "The Income Board", "SEC filings + news wire", "Chart renderer + a voice"],
    special: "ASK CARL: any ticker question, answered from live data with the numbers on screen.",
    strength: "Simple answers in about 3 seconds, tool answers in about 6. Knows every fund on the Income Board and remembers the conversation.",
    weakness: "Education only. He shows you the numbers but won't tell you what to buy.",
    ring: [["24", "Market tools"], ["3s", "Fastest answer"], ["5", "Free asks a day"]],
    button: { label: "Talk to CARL", href: "https://retailinvestorreport.com" } },
  { key: "sales", name: "Agent Sell Stuff", cls: "The Marketplace Agent", lvl: ["29", "listings posted"], status: "glitching", hue: "80deg", tint: "#c27cff",
    img: "sellstuff.webp", img2: "sellstuff-phone.webp", live: "stream", mouth: [.24, .5], kinds: "sell",
    stats: [["Hustle", 86], ["Price Eye", 58], ["Stealth", 80], ["Market Reach", 22]],
    loadout: ["Telegram intake bot", "Photo-reading price brain", "Drives a real Chrome browser", "Kill switch + checkpoint halt"],
    special: "TRENCH-COAT DROP: snap a photo, tap Approve, it's live on Facebook Marketplace.",
    strength: "Writes the title, story, price and floor from a few photos. Posts, edits and pulls listings himself, 5 a day, never touching buyer DMs.",
    weakness: "Facebook only so far, and he can mark a listing gone when it's still up.",
    ring: [["29", "Posted"], ["35", "Edited"], ["15", "Pulled"]],
    button: { label: "Download on GitHub", href: "https://github.com/lennymadethat/sellstuff" },
    more: { label: "How he works", href: "/agents/sellstuff" } },
  { key: "harvester", name: "Harry the Harvester", cls: "The YouTube Agent", lvl: ["96", "harvests"], status: "online", hue: "-15deg", tint: "#3fe6d2",
    img: "harry.webp", img2: "harry2.webp", live: "stream", mouth: [.07, .53], mouth2: [.05, .53], kinds: "video",
    stats: [["Range", 88], ["Speed", 82], ["Aim", 61], ["Memory", 44]],
    loadout: ["Telegram link bot", "Whisper ears: 2-hour videos", "7 lenses: markets, fitness, visuals…", "Library filing cannon"],
    special: "SECOND BRAIN DROP: any link in, a filed library page out in under a minute.",
    strength: "Eats YouTube, X, Instagram, GitHub and articles. Summary, takeaways and action items land on the right project page.",
    weakness: "Throws away the transcripts, and sometimes files a video under the wrong lens.",
    ring: [["96", "Pages filed"], ["13s", "Fastest job"], ["2h", "Max video"]],
    button: { label: "Download on GitHub", href: "https://github.com/lennymadethat/harvester" } },
  { key: "ingestor", name: "The Ingestor", cls: "The Filing Agent", lvl: ["128", "files eaten"], status: "online", hue: "-165deg", tint: "#ff9d5c",
    img: "ingestor.webp", img2: "ingestor.webp", flip2: true, live: "stream", mouth: [.33, .17], mouth2: [.67, .17],
    stats: [["Appetite", 90], ["Sorting", 78], ["Stamina", 62], ["Discretion", 94]],
    loadout: ["Inbox folder watcher", "PDF + vision reader (6 pages)", "Whisper for audio", "8 workers: tagger, receipts, people…"],
    special: "SEALED VAULT: work papers get filed and never leak into the personal side.",
    strength: "Scans, PDFs, receipts and voice memos become source pages, tags, expense lines and action items.",
    weakness: "1 in 8 files lands in 'unknown', and he only eats while the home machine is awake.",
    ring: [["128", "Files filed"], ["8", "Workers"], ["2 min", "Sweep"]],
    button: { label: "Download on GitHub", href: "https://github.com/lennymadethat/ingester" } },
  { key: "rico", name: "RICO", cls: "Retail Investor Content Operative", lvl: ["28", "issues"], status: "in training", hue: "-10deg", tint: "#7fd0ff",
    img: "rico.webp", img2: "rico2.webp", live: "stream", mouth: [.88, .27], kinds: "rico",
    stats: [["Voice Match", 84], ["Output", 79], ["Nerve", 31], ["Autonomy", 40]],
    loadout: ["Lenny's voice engine + corpus", "Newsletter draft cannon", "X posting browser", "Woodcut header press"],
    special: "RAMBLE TO ISSUE: a voice memo goes in, a Sunday newsletter in Lenny's voice comes out.",
    strength: "Turns rants into newsletters, X threads and Articles, then scores his own drafts 0 to 100 against the voice.",
    weakness: "Sweats every send. Newsletters wait for Lenny's tap.",
    ring: [["28", "Issues"], ["35", "Reply drafts"], ["0–100", "Voice score"]],
    button: { label: "Read the Report", href: "https://retailinvestorreport.com" } },
];
const $ = (id) => document.getElementById(id);
const grade = (v) => v >= 90 ? "S" : v >= 78 ? "A" : v >= 62 ? "B" : v >= 46 ? "C" : v >= 30 ? "D" : "E";
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// ---------- live layers: Carl drawn in code; streams of files/videos/tags into or out of each agent ----------
/* Live agents drawn in code. Carl = a dark glass orb with a burning rim, a chaotic swarm of motes inside and veins crawling its surface, lightning tendrils feeding the pedestal. */
const Live=(()=>{
  const cv=$("as-live"),cx=cv.getContext("2d"),still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  let who=null,rgb=[86,194,255],raf=0,W=0,H=0,dpr=1,bolts=[],lastBolt=0,veins=[],lastVein=0;
  const N=300,P=[],E=[];
  for(let k=0;k<N;k++){ // points: 60% near the shell, 40% inside
    const u=Math.random()*2-1,th=Math.random()*Math.PI*2,rr=Math.pow(Math.random(),1.15)*.78,s=Math.sqrt(1-u*u);
    P.push([s*Math.cos(th)*rr,u*rr,s*Math.sin(th)*rr,.7+Math.random()*Math.random()*3.4,.3+Math.random()*1.4,.3+Math.random()*1.4,.3+Math.random()*1.4,Math.random()*7]);
  }
  for(let a=0;a<N;a++)for(let b=a+1;b<N;b++){const d=Math.hypot(P[a][0]-P[b][0],P[a][1]-P[b][1],P[a][2]-P[b][2]);if(d<.16&&E.length<300)E.push([a,b])}
  const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
  const c=(a,m=1)=>`rgba(${Math.min(255,rgb[0]*m+40)|0},${Math.min(255,rgb[1]*m+30)|0},${Math.min(255,rgb[2]*m+20)|0},${a})`;
  function size(){const r=cv.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,2);W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0)}
  function geo(){const tall=H>W;return tall?{ox:.5*W,oy:.43*H,r:.18*W,px:.5*W,py:.62*H,rx:.36*W,ry:.035*H}:{ox:.5*W,oy:.385*H,r:.093*W,px:.5*W,py:.705*H,rx:.22*W,ry:.06*H}}
  function bolt(x0,y0,x1,y1,rough){let pts=[[x0,y0],[x1,y1]];for(let d=0;d<6;d++){const n=[pts[0]];for(let i=1;i<pts.length;i++){const[a,b]=[pts[i-1],pts[i]],L=Math.hypot(b[0]-a[0],b[1]-a[1]);n.push([(a[0]+b[0])/2+(Math.random()-.5)*L*rough,(a[1]+b[1])/2+(Math.random()-.5)*L*rough*.35],b)}pts=n}return pts}
  function frame(t){
    const g=geo(),T=t/1000,breathe=1+Math.sin(T*1.6)*.025,R=g.r*breathe;
    cx.clearRect(0,0,W,H);cx.globalCompositeOperation="lighter";
    // halo
    let gr=cx.createRadialGradient(g.ox,g.oy,R*.2,g.ox,g.oy,R*2.4);gr.addColorStop(0,c(.32));gr.addColorStop(.45,c(.1));gr.addColorStop(1,c(0));cx.fillStyle=gr;cx.fillRect(0,0,W,H);
    // pedestal flare where the bolts land
    gr=cx.createRadialGradient(g.px,g.py,0,g.px,g.py,g.rx*.9);gr.addColorStop(0,c(.22));gr.addColorStop(1,c(0));cx.fillStyle=gr;cx.beginPath();cx.ellipse(g.px,g.py,g.rx,g.ry*2.2,0,0,7);cx.fill();
    // lightning: refresh paths ~11×/s
    if(t-lastBolt>90||!bolts.length){lastBolt=t;bolts=[];const n=4+(Math.random()*2|0);for(let k=0;k<n;k++){const ang=Math.PI*(.15+.7*(k+Math.random()*.6)/n),ex=g.px+Math.cos(ang)*g.rx*(.35+Math.random()*.55)*(k%2?1:-1),ey=g.py+Math.sin(ang)*g.ry*.6;bolts.push({p:bolt(g.ox+(Math.random()-.5)*R*.6,g.oy+R*.92,ex,ey,.55),a:.35+Math.random()*.65})}}
    for(const b of bolts){for(const[w,al,m]of[[6,.08,1],[2.2,.35,1.2],[.9,.9,2]]){cx.lineWidth=w;cx.strokeStyle=c(al*b.a,m);cx.beginPath();b.p.forEach(([x,y],i)=>i?cx.lineTo(x,y):cx.moveTo(x,y));cx.stroke()}}
    // dark body: the inside is near-black glass, the light lives on the rim and in the swarm
    cx.globalCompositeOperation="source-over";
    gr=cx.createRadialGradient(g.ox,g.oy-R*.15,R*.05,g.ox,g.oy,R);gr.addColorStop(0,"rgba(6,14,30,.78)");gr.addColorStop(.8,"rgba(3,8,20,.94)");gr.addColorStop(1,"rgba(2,6,16,.96)");
    cx.fillStyle=gr;cx.beginPath();cx.arc(g.ox,g.oy,R,0,7);cx.fill();
    cx.globalCompositeOperation="lighter";
    // inner rim glow
    gr=cx.createRadialGradient(g.ox,g.oy,R*.5,g.ox,g.oy,R);gr.addColorStop(0,c(0));gr.addColorStop(.6,c(.07));gr.addColorStop(.88,c(.32,1.1));gr.addColorStop(1,c(.8,1.5));
    cx.fillStyle=gr;cx.beginPath();cx.arc(g.ox,g.oy,R,0,7);cx.fill();
    for(const[w,al,m]of[[R*.3,.05,1],[R*.13,.12,1.1],[R*.045,.32,1.3],[2,.95,2.2]]){cx.lineWidth=w;cx.strokeStyle=c(al*(1+Math.sin(T*2.7)*.12),m);cx.beginPath();cx.arc(g.ox,g.oy,R*.995,0,7);cx.stroke()}
    // clip everything inside the orb
    cx.save();cx.beginPath();cx.arc(g.ox,g.oy,R*.985,0,7);cx.clip();
    // electric veins crawling across the surface
    if(t-lastVein>120||!veins.length){lastVein=t;veins=[];for(let k=0;k<7;k++){const a1=Math.random()*7,a2=a1+(Math.random()-.5)*2.4,r1=.45+Math.random()*.5,r2=.45+Math.random()*.5;veins.push({p:bolt(g.ox+Math.cos(a1)*R*r1,g.oy+Math.sin(a1)*R*r1,g.ox+Math.cos(a2)*R*r2,g.oy+Math.sin(a2)*R*r2,.7),a:.25+Math.random()*.6})}}
    for(const v of veins){for(const[w,al,m]of[[3,.08,1],[.8,.6,1.8]]){cx.lineWidth=w;cx.strokeStyle=c(al*v.a,m);cx.beginPath();v.p.forEach(([x,y],i)=>i?cx.lineTo(x,y):cx.moveTo(x,y));cx.stroke()}}
    // chaotic swarm: every mote drifts on its own tangle of frequencies, packed toward the middle
    const ay=T*.22,cy=Math.cos(ay),sy=Math.sin(ay),Q=new Array(N);
    for(let k=0;k<N;k++){const[x,y,z,s,f1,f2,f3,ph]=P[k],
      jx=x+Math.sin(T*f1+ph)*.16+Math.sin(T*f3*2.3+ph*2)*.05,jy=y+Math.cos(T*f2+ph)*.16+Math.sin(T*f1*1.9)*.05,jz=z+Math.sin(T*f3+ph*1.3)*.16,
      x1=jx*cy+jz*sy,z1=-jx*sy+jz*cy;Q[k]=[g.ox+x1*R,g.oy+jy*R,(z1+1)/2,s,.55+.45*Math.sin(T*(f1*4)+ph*3)]}
    cx.lineWidth=.6;for(const[a,b]of E){const A=Q[a],B=Q[b];if(Math.hypot(A[0]-B[0],A[1]-B[1])>R*.32)continue;cx.strokeStyle=c(.04+A[2]*.12,1.4);cx.beginPath();cx.moveTo(A[0],A[1]);cx.lineTo(B[0],B[1]);cx.stroke()}
    for(const[x,y,d,s,fl]of Q){const r=(.6+d*1.6)*s*(W>700?1.5:1.1);gr=cx.createRadialGradient(x,y,0,x,y,r*4);gr.addColorStop(0,c(.85*fl*(.5+d),2.2));gr.addColorStop(.3,c(.32*fl*(.5+d),1.3));gr.addColorStop(1,c(0));cx.fillStyle=gr;cx.beginPath();cx.arc(x,y,r*4,0,7);cx.fill();
      cx.fillStyle=`rgba(235,248,255,${(.4+d*.6)*fl})`;cx.beginPath();cx.arc(x,y,r*.9,0,7);cx.fill()}
    cx.restore();
    // glass highlight
    gr=cx.createRadialGradient(g.ox-R*.38,g.oy-R*.45,0,g.ox-R*.38,g.oy-R*.45,R*.35);gr.addColorStop(0,"rgba(220,240,255,.10)");gr.addColorStop(1,"rgba(220,240,255,0)");cx.fillStyle=gr;cx.beginPath();cx.arc(g.ox-R*.38,g.oy-R*.45,R*.35,0,7);cx.fill();
    cx.globalCompositeOperation="source-over";
    if(!still&&who)raf=requestAnimationFrame(frame);
  }
  addEventListener("resize",()=>{if(who){size();size2()}});
  const cv2=$("as-live2"),c2=cv2.getContext("2d");let mouth=null,mouth2=null,docs=[];
  const FILES=[["PDF","#e5483b"],["XLS","#2f9e57"],["DOC","#2f6fd6"],["DIR","#e9b44c"],["TXT","#c9d3dc"]],VIDS=[["VID","#ff2a2a"],["VID","#ff2a2a"],["CLIP","#1c2633"],["MAIL","#f2c14e"]],NIGHT=[["TXT","#c9d3dc"],["XLS","#2f9e57"],["DOC","#2f6fd6"],["PDF","#e5483b"]],PLK=[["VID","#2fd28a"],["MAIL","#cfeee0"],["VID","#2fd28a"],["MAIL","#cfeee0"]],SELL=[["TAG","#efe2c4"],["TAG","#efe2c4"],["TAG","#efe2c4"],["COIN","#e8b84a"]],RICO=[["XP","#0f1419"],["DOC","#2f6fd6"],["TXT","#c9d3dc"],["XP","#0f1419"]];let KINDS=FILES,OUT=false;
  function spawn(g){const d=spawn0();if(window._poseOn&&mouth2&&mouth2[0]>.5){d.x0=W-d.x0;d.c1[0]=W-d.c1[0]}return d}
  function spawn0(){const k=KINDS[Math.random()*KINDS.length|0],side=Math.random()<.5;return{k,t:0,sp:.18+Math.random()*.22,
    x0:side?-.05*W:W*(.05+Math.random()*.25),y0:side?H*(.05+Math.random()*.5):-.05*H,c1:[W*(.15+Math.random()*.3),H*(.05+Math.random()*.35)],sz:.9+Math.random()*.9,rot:(Math.random()-.5)*1.4,wob:Math.random()*7}}
  function ingest(t){
    const T=t/1000,hr=$("as-hero").getBoundingClientRect(),sr=cv.getBoundingClientRect();
    const mm=(window._poseOn&&mouth2)?mouth2:mouth,mx=hr.left-sr.left+hr.width*mm[0],my=hr.top-sr.top+hr.height*mm[1];
    c2.clearRect(0,0,W,H);
    const target=W>700?34:22;while(docs.length<target)docs.push(spawn());
    const dt=Math.min(.05,(t-(ingest.last||t))/1000);ingest.last=t;
    // light stream behind the files
    c2.globalCompositeOperation="lighter";
    const fl=window._poseOn&&mouth2&&mouth2[0]>.5,X=v=>fl?W-v:v;
    for(let k=0;k<5;k++){c2.beginPath();const off=k*.9+T*.8;c2.moveTo(X(-.02*W),H*(.18+k*.06));
      c2.bezierCurveTo(X(W*.2),H*(.05+k*.05)+Math.sin(off)*14,X(W*.3),my-60+Math.cos(off)*10,mx,my);c2.lineWidth=k%2?1:2.2;c2.strokeStyle=`rgba(120,220,255,${.10+.06*Math.sin(T*2+k)})`;c2.stroke()}
    let gr=c2.createRadialGradient(mx,my,0,mx,my,W>700?46:28);gr.addColorStop(0,"rgba(170,235,255,.55)");gr.addColorStop(1,"rgba(120,220,255,0)");c2.fillStyle=gr;c2.beginPath();c2.arc(mx,my,W>700?46:28,0,7);c2.fill();
    c2.globalCompositeOperation="source-over";
    for(const d of docs){d.t+=dt*d.sp;const u=OUT?1-Math.min(d.t,1):Math.min(d.t,1),iu=1-u,
      x=iu*iu*d.x0+2*iu*u*d.c1[0]+u*u*mx+Math.sin(T*3+d.wob)*10*iu,y=iu*iu*d.y0+2*iu*u*d.c1[1]+u*u*my+Math.cos(T*2.6+d.wob)*8*iu,
      s=(W>700?22:15)*d.sz*(.25+.75*iu);
      c2.save();c2.translate(x,y);c2.rotate(d.rot*iu+Math.sin(T*2+d.wob)*.2);c2.globalAlpha=Math.min(1,d.t*6)*(u>.9?(1-u)*10:1);
      c2.shadowColor="rgba(120,220,255,.6)";c2.shadowBlur=8;
      if(d.k[0]==="XP"){c2.fillStyle=d.k[1];c2.beginPath();c2.roundRect(-s*.45,-s*.45,s*.9,s*.9,s*.18);c2.fill();c2.shadowBlur=0;c2.strokeStyle="#fff";c2.lineWidth=Math.max(1.2,s*.09);c2.beginPath();c2.moveTo(-s*.2,-s*.22);c2.lineTo(s*.2,s*.22);c2.moveTo(s*.2,-s*.22);c2.lineTo(-s*.2,s*.22);c2.stroke()}
      else if(d.k[0]==="TAG"){c2.fillStyle=d.k[1];c2.beginPath();c2.moveTo(-s*.5,-s*.22);c2.lineTo(s*.25,-s*.22);c2.lineTo(s*.5,0);c2.lineTo(s*.25,s*.22);c2.lineTo(-s*.5,s*.22);c2.closePath();c2.fill();c2.shadowBlur=0;c2.fillStyle="rgba(60,40,20,.7)";c2.beginPath();c2.arc(s*.24,0,s*.06,0,7);c2.fill();c2.strokeStyle="rgba(220,210,190,.7)";c2.lineWidth=1;c2.beginPath();c2.moveTo(s*.24,0);c2.quadraticCurveTo(s*.6,-s*.3,s*.8,-s*.1);c2.stroke()}
      else if(d.k[0]==="COIN"){c2.fillStyle=d.k[1];c2.beginPath();c2.ellipse(0,0,s*.32*Math.abs(Math.cos(T*4+d.wob))+s*.04,s*.32,0,0,7);c2.fill();c2.shadowBlur=0;c2.strokeStyle="rgba(120,80,10,.7)";c2.lineWidth=1;c2.stroke()}
      else if(d.k[0]==="VID"){c2.fillStyle=d.k[1];c2.beginPath();c2.roundRect(-s*.6,-s*.42,s*1.2,s*.84,s*.22);c2.fill();c2.shadowBlur=0;c2.fillStyle="#fff";c2.beginPath();c2.moveTo(-s*.15,-s*.22);c2.lineTo(s*.25,0);c2.lineTo(-s*.15,s*.22);c2.closePath();c2.fill()}
      else if(d.k[0]==="CLIP"){c2.fillStyle="#e8eef5";c2.fillRect(-s*.7,-s*.45,s*1.4,s*.9);c2.shadowBlur=0;c2.fillStyle="#3a4d63";c2.fillRect(-s*.62,-s*.37,s*1.24,s*.6);c2.fillStyle="#ff2a2a";c2.fillRect(-s*.62,s*.3,s*.7,s*.06);c2.fillStyle="#fff";c2.beginPath();c2.moveTo(-s*.1,-s*.2);c2.lineTo(s*.15,-s*.07);c2.lineTo(-s*.1,s*.06);c2.fill()}
      else if(d.k[0]==="MAIL"){c2.fillStyle=d.k[1];c2.fillRect(-s*.55,-s*.35,s*1.1,s*.7);c2.shadowBlur=0;c2.strokeStyle="rgba(90,60,10,.6)";c2.lineWidth=1.2;c2.beginPath();c2.moveTo(-s*.55,-s*.35);c2.lineTo(0,s*.05);c2.lineTo(s*.55,-s*.35);c2.stroke()}
      else if(d.k[0]==="DIR"){c2.fillStyle=d.k[1];c2.beginPath();c2.roundRect(-s*.6,-s*.35,s*1.2,s*.8,2);c2.fill();c2.fillRect(-s*.6,-s*.45,s*.45,s*.15)}
      else{c2.fillStyle="#f4f7fb";c2.beginPath();c2.moveTo(-s*.4,-s*.5);c2.lineTo(s*.2,-s*.5);c2.lineTo(s*.4,-s*.3);c2.lineTo(s*.4,s*.5);c2.lineTo(-s*.4,s*.5);c2.closePath();c2.fill();
        c2.shadowBlur=0;c2.fillStyle=d.k[1];c2.fillRect(-s*.46,s*.02,s*.74,s*.26);
        if(s>12){c2.fillStyle="#fff";c2.font=`700 ${s*.2}px JetBrains Mono,monospace`;c2.textAlign="center";c2.textBaseline="middle";c2.fillText(d.k[0],-s*.09,s*.16)}
        c2.fillStyle="rgba(40,60,80,.35)";for(let r=0;r<3;r++)c2.fillRect(-s*.28,-s*.34+r*s*.1,s*.5,s*.03)}
      c2.restore();
      if(d.t>=1)Object.assign(d,spawn())}
    if(!still&&who)raf=requestAnimationFrame(ingest);
  }
  function size2(){cv2.width=W*dpr;cv2.height=H*dpr;c2.setTransform(dpr,0,0,dpr,0,0)}
  return{set(k,tint,m,kinds,m2){mouth2=m2||null;KINDS=kinds==="video"?VIDS:kinds==="sell"?SELL:kinds==="rico"?RICO:kinds==="pl"?PLK:kinds==="night"?NIGHT:FILES;OUT=kinds==="sell"||kinds==="rico"||kinds==="pl";cancelAnimationFrame(raf);who=k||null;if(tint)rgb=hex(tint);size();size2();cx.clearRect(0,0,W,H);c2.clearRect(0,0,W,H);docs=[];ingest.last=0;
    if(who==="carl"){still?frame(1000):raf=requestAnimationFrame(frame)}
    else if(who==="stream"){mouth=m;const go=()=>{for(let i=0;i<40&&still;i++)ingest(1000+i*200);if(!still)raf=requestAnimationFrame(ingest)};const h=$("as-hero");h.complete?go():h.onload=go}}};
})();


// ---------- the stage ----------
const section = $("agents");
section.style.setProperty("--as-count", String(AGENTS.length + 0.4));
const stage = $("as-stage"), hero = $("as-hero"), hero2 = $("as-hero2");
let cur = -1, poseT = 0;
window._poseOn = false;

function render(i) {
  if (i === cur) return;
  cur = i;
  const a = AGENTS[i];
  section.style.setProperty("--as-tint", a.tint);
  stage.style.setProperty("--as-hue", a.hue);
  $("as-num").textContent = `${String(i + 1).padStart(2, "0")} / ${String(AGENTS.length).padStart(2, "0")}`;
  $("as-cls").textContent = a.cls;
  $("as-name").textContent = a.name;
  $("as-lvl").innerHTML = `<span class="as-lv">LV</span><b>${esc(a.lvl[0])}</b>${esc(a.lvl[1])}`;
  $("as-status").dataset.s = a.status;
  $("as-status").lastChild.textContent = a.status;
  $("as-stats").innerHTML = a.stats.map(([n, v]) => `<li><span class="as-grade as-g${grade(v)}">${grade(v)}</span><span class="as-gname">${esc(n)}</span><span class="as-gval">${v}</span><span class="as-power"><i style="width:${v}%"></i></span></li>`).join("");
  $("as-load").innerHTML = a.loadout.map((x) => `<li>${esc(x)}</li>`).join("");
  $("as-special").innerHTML = `<span class="as-k">Special move</span>${esc(a.special)}`;
  $("as-strength").textContent = a.strength;
  $("as-weakness").textContent = a.weakness;
  $("as-ring").innerHTML = a.ring.map(([v, l]) => `<div><b>${esc(v)}</b><small>${esc(l)}</small></div>`).join("");
  const btn = $("as-btn");
  btn.hidden = !a.button;
  if (a.button) { btn.href = a.button.href; btn.textContent = a.button.label + " →"; }
  const more = $("as-more");
  more.hidden = !a.more;
  if (a.more) { more.href = a.more.href; more.textContent = a.more.label; }
  // poses
  clearInterval(poseT); window._poseOn = false;
  hero.hidden = $("as-shadow").hidden = !a.img;
  hero.classList.remove("as-off"); hero2.classList.add("as-off");
  hero2.hidden = !a.img2; hero2.classList.toggle("as-flip", !!a.flip2);
  if (a.img) { hero.src = IMG + a.img; hero.alt = a.name; }
  if (a.img2) {
    hero2.src = IMG + a.img2; hero2.alt = "";
    let on = false;
    poseT = setInterval(() => { on = !on; window._poseOn = on; hero.classList.toggle("as-off", on); hero2.classList.toggle("as-off", !on); }, 9000);
  }
  Live.set(a.live, a.tint, a.mouth, a.kinds, a.mouth2);
  for (const id of ["as-id", "as-stats-card", "as-ring", "as-side"]) { const e = $(id); e.classList.remove("as-swap"); void e.offsetWidth; e.classList.add("as-swap"); }
  [...$("as-dots").children].forEach((d, j) => d.setAttribute("aria-selected", j === i ? "true" : "false"));
}

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const range = () => ({ top: section.offsetTop, len: section.offsetHeight - innerHeight });
const jump = (i) => {
  const n = AGENTS.length, k = ((i % n) + n) % n, { top, len } = range();
  scrollTo({ top: top + ((k + 0.5) / n) * len, behavior: reduced ? "auto" : "smooth" });
};
AGENTS.forEach((a, i) => {
  const d = document.createElement("button");
  d.type = "button"; d.setAttribute("role", "tab"); d.setAttribute("aria-label", a.name);
  d.addEventListener("click", () => jump(i));
  $("as-dots").append(d);
});
const onScroll = () => {
  const { top, len } = range();
  const p = Math.max(0, Math.min(0.9999, (scrollY - top) / len));
  render(Math.floor(p * AGENTS.length));
};
addEventListener("scroll", () => requestAnimationFrame(onScroll), { passive: true });
addEventListener("resize", onScroll);
$("as-prev").addEventListener("click", () => jump(cur - 1));
$("as-next").addEventListener("click", () => jump(cur + 1));
$("as-skip").addEventListener("click", () => $("crews").scrollIntoView({ behavior: reduced ? "auto" : "smooth" }));
addEventListener("keydown", (e) => {
  const r = section.getBoundingClientRect();
  if (r.top > 10 || r.bottom < innerHeight - 10) return;
  if (e.key === "ArrowRight") jump(cur + 1);
  if (e.key === "ArrowLeft") jump(cur - 1);
});
let x0 = null, y0 = null;
stage.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
stage.addEventListener("touchend", (e) => {
  if (x0 == null) return;
  const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) jump(cur + (dx < 0 ? 1 : -1));
  x0 = null;
});
onScroll();
if (cur < 0) render(0);
