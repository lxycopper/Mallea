'use strict';
const players = new Set();
const singlePlayers = new Set();
const $ = (selector, root = document) => root.querySelector(selector);
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const icons = {
 play:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2L13 8L4 14Z" fill="currentColor" stroke="none"/></svg>',
 pause:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3V13M11 3V13" stroke-width="3"/></svg>',
 restart:'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 8A6 6 0 1 1 4 13M4 3V8H9"/></svg>',
 fullscreen:'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 8V3H8M12 3H17V8M17 12V17H12M8 17H3V12"/></svg>'
};
function ready(video) {
 if (video.readyState >= 2) return Promise.resolve();
 return new Promise((resolve,reject) => {
  const clean = () => { clearTimeout(timer); video.removeEventListener('loadeddata',pass); video.removeEventListener('error',fail); };
  const pass = () => { clean(); resolve(); };
  const fail = () => { clean(); reject(new Error('The video could not be loaded.')); };
  const timer = setTimeout(fail,20000);
  video.addEventListener('loadeddata',pass); video.addEventListener('error',fail);
 });
}
class ComparisonPlayer {
 constructor(mount,demo) {
  this.demo=demo; this.whiteSource=demo.whitebox; this.mount=mount; this.loaded=false; this.wantPlay=false; this.epoch=0; this.frame=0; this.duration=Math.min(demo.durationWhitebox||10,demo.durationRender||10); this.lastCorrection=0;
  const context=mount.dataset.context || 'gallery';
  this.name=`${demo.title} (${context})`;
  const mid=false;
  const whitePoster=mid?'static/images/demos/03-whitebox-mid.jpg':demo.posterWhitebox;
  const renderPoster=mid?'static/images/demos/03-render-mid.jpg':demo.posterRender;
  mount.innerHTML=`<div class="comparison-player" role="group" aria-label="${escapeHTML(this.name)}"><div class="compare-stage"><video class="layer render" preload="none" muted playsinline disablepictureinpicture poster="${escapeHTML(renderPoster)}" aria-label="Generated ${escapeHTML(demo.title)}"></video><video class="layer whitebox" preload="none" muted playsinline disablepictureinpicture poster="${escapeHTML(whitePoster)}" aria-label="Whitebox ${escapeHTML(demo.title)}"></video><span class="layer-tag white-tag" aria-hidden="true">3D model</span><span class="layer-tag render-tag" aria-hidden="true">Rendered</span><div class="divider" aria-hidden="true"></div><button class="video-center-play" aria-label="Play comparison — ${escapeHTML(this.name)}" title="Play comparison">${icons.play}</button><input type="range" class="compare-range" min="0" max="100" step="1" value="0" aria-label="Reveal whitebox for ${escapeHTML(this.name)}" aria-valuetext="0% whitebox, 100% generated"></div><div class="player-status" aria-live="polite"></div><div class="player-controls"><button class="icon-button play-toggle" aria-label="Play ${escapeHTML(this.name)}">${icons.play}</button><button class="icon-button restart" aria-label="Restart ${escapeHTML(this.name)}">${icons.restart}</button><input type="range" class="seek" min="0" max="${this.duration}" step="0.01" value="0" aria-label="Seek ${escapeHTML(this.name)}"><span class="player-time">0:00 / ${this.formatTime(this.duration)}</span><button class="icon-button fullscreen" aria-label="Fullscreen ${escapeHTML(this.name)}">${icons.fullscreen}</button></div></div>`;
  this.root=$('.comparison-player',mount); this.stage=$('.compare-stage',mount); this.w=$('video.whitebox',mount); this.r=$('video.render',mount); this.toggle=$('.play-toggle',mount); this.seek=$('.seek',mount); this.clock=$('.player-time',mount); this.status=$('.player-status',mount); this.range=$('.compare-range',mount); this.floatingToggle=$('.video-center-play',mount);
  this.setSplit=value=>{const split=Math.max(0,Math.min(100,value));this.range.value=String(split);this.stage.classList.toggle('split-start',split===0);this.stage.classList.toggle('split-end',split===100);this.stage.style.setProperty('--split',`${split}%`);this.range.setAttribute('aria-valuetext',`${Math.round(split)}% world model, ${Math.round(100-split)}% rendered`);};
  this.setSplit(0);
  this.range.addEventListener('input',()=>this.setSplit(Number(this.range.value)));
  // Horizontal comparison gestures leave vertical touch scrolling to the browser.
  const drag=event=>{const rect=this.stage.getBoundingClientRect();this.setSplit((event.clientX-rect.left)/rect.width*100);};
  const beginDrag=event=>{this.dragging=true;this.stage.classList.add('is-dragging');this.range.setPointerCapture(event.pointerId);drag(event);};
  const endDrag=()=>{this.dragging=false;this.pointerStart=null;this.stage.classList.remove('is-dragging');};
  this.range.addEventListener('pointerdown',event=>{
   if(event.button!==0)return;
   this.pointerStart={x:event.clientX,y:event.clientY,id:event.pointerId};
   if(event.pointerType!=='touch'){event.preventDefault();this.range.focus({preventScroll:true});beginDrag(event);}
  });
  this.range.addEventListener('pointermove',event=>{
   if(!this.pointerStart||this.pointerStart.id!==event.pointerId)return;
   if(!this.dragging){const dx=Math.abs(event.clientX-this.pointerStart.x),dy=Math.abs(event.clientY-this.pointerStart.y);if(dx>6&&dx>dy){beginDrag(event);}else return;}
   drag(event);
  });
  this.range.addEventListener('pointerup',event=>{
   if(this.dragging)drag(event);
   else if(this.pointerStart&&Math.hypot(event.clientX-this.pointerStart.x,event.clientY-this.pointerStart.y)<6)drag(event);
   if(this.range.hasPointerCapture(event.pointerId))this.range.releasePointerCapture(event.pointerId);
   endDrag();
  });
  this.range.addEventListener('pointercancel',endDrag);
  this.range.addEventListener('lostpointercapture',endDrag);
  for(const button of [this.toggle,this.floatingToggle])button.addEventListener('click',()=>this.wantPlay?this.pause():this.play());
  $('.restart',mount).addEventListener('click',async()=>{this.pause();await this.seekTo(0);});
  this.seek.addEventListener('input',()=>this.seekTo(Number(this.seek.value)));
  $('.fullscreen',mount).addEventListener('click',()=>this.root.classList.contains('is-expanded')?closeExpandedPlayer():expandPlayer(this));
  for(const video of [this.w,this.r]) { video.muted=true; video.addEventListener('error',()=>{this.pause();this.status.textContent='Video unavailable. Please try again.';}); }
  players.add(this);
 }
 async load() {
  if(!this.loaded) {this.w.src=this.whiteSource;this.r.src=this.demo.render;this.w.preload=this.r.preload='auto';this.w.load();this.r.load();this.loaded=true;}
  await Promise.all([ready(this.w),ready(this.r)]);
  this.duration=Math.min(this.w.duration,this.r.duration);this.seek.max=String(this.duration);this.updateClock();
 }
 async play() {
  const epoch=++this.epoch; this.wantPlay=true; this.status.textContent='Loading both layers…';this.updateToggle();
  for(const other of players)if(other!==this)other.pause();
  singlePlayers.forEach(player=>player.pause());
  try {
   await this.load(); if(epoch!==this.epoch||!this.wantPlay)return;
   if(this.w.currentTime>=this.duration-.04){this.w.currentTime=0;this.r.currentTime=0;}
   this.r.currentTime=this.w.currentTime;
   await Promise.all([this.w.play(),this.r.play()]);
   if(epoch!==this.epoch||!this.wantPlay){this.w.pause();this.r.pause();return;}
   this.status.textContent='';this.lastCorrection=performance.now();this.tick();
  } catch {if(epoch===this.epoch){this.pause();this.status.textContent='Playback could not start. Try Play again.';}}
 }
 pause() {this.wantPlay=false;this.epoch++;cancelAnimationFrame(this.frame);this.w.pause();this.r.pause();this.status.textContent='';this.updateToggle();this.updateClock();}
 updateToggle(){const action=this.wantPlay?'Pause':'Play';this.root.classList.toggle('is-playing',this.wantPlay);this.root.dataset.playing=String(this.wantPlay);this.toggle.innerHTML=this.floatingToggle.innerHTML=this.wantPlay?icons.pause:icons.play;this.toggle.setAttribute('aria-label',`${action} ${this.name}`);this.floatingToggle.setAttribute('aria-label',`${action} comparison — ${this.name}`);this.floatingToggle.title=`${action} comparison`;this.floatingToggle.tabIndex=this.wantPlay?-1:0;if(this.wantPlay&&document.activeElement===this.floatingToggle)this.toggle.focus({preventScroll:true});}
 updateClock(){const time=Math.min(this.w.currentTime||0,this.duration);this.seek.value=String(time);this.clock.textContent=`${this.formatTime(time)} / ${this.formatTime(this.duration)}`;this.seek.style.setProperty('--seek-progress',`${time/this.duration*100}%`);this.seek.setAttribute('aria-valuetext',`${time.toFixed(2)} seconds`);}
 formatTime(time){return `${Math.floor(time/60)}:${Math.floor(time%60).toString().padStart(2,'0')}`;}
 tick(){cancelAnimationFrame(this.frame);if(!this.wantPlay)return;const now=performance.now();
  if(this.w.currentTime>=this.duration-.02||this.r.currentTime>=this.duration-.02){this.w.currentTime=0;this.r.currentTime=0;this.w.play().catch(()=>this.pause());this.r.play().catch(()=>this.pause());}
  else if(now-this.lastCorrection>160){
   if(this.w.readyState<3||this.r.readyState<3){this.w.pause();this.r.pause();this.status.textContent='Buffering both layers…';}
   else if(this.w.paused||this.r.paused){this.w.play().catch(()=>this.pause());this.r.play().catch(()=>this.pause());this.status.textContent='';}
   if(Math.abs(this.r.currentTime-this.w.currentTime)>.065){this.r.currentTime=this.w.currentTime;}
   this.lastCorrection=now;
  }
  this.updateClock();this.frame=requestAnimationFrame(()=>this.tick());
 }
 async seekTo(time){try{await this.load();this.w.currentTime=Math.max(0,Math.min(time,this.duration));this.r.currentTime=this.w.currentTime;this.updateClock();}catch{this.pause();this.status.textContent='Could not seek. Please try again.';}}

}

let expandedPlayer=null;
let expandedDialog=null;
function closeExpandedPlayer(){
 if(expandedDialog?.open)expandedDialog.close();
}
function expandPlayer(player){
 if(!expandedDialog){
  expandedDialog=document.createElement('dialog');expandedDialog.className='player-dialog';expandedDialog.setAttribute('aria-label','Expanded video comparison');
  expandedDialog.innerHTML='<button class="expanded-close" aria-label="Close expanded comparison">×</button>';
  document.body.append(expandedDialog);
  $('.expanded-close',expandedDialog).addEventListener('click',closeExpandedPlayer);
  expandedDialog.addEventListener('close',()=>{
   if(!expandedPlayer)return;
   const previous=expandedPlayer;expandedPlayer=null;previous.mount.append(previous.root);previous.root.classList.remove('is-expanded');
   $('.fullscreen',previous.root).focus({preventScroll:true});
  });
 }
 if(expandedPlayer===player)return;
 if(expandedPlayer){expandedDialog.close();}
 expandedPlayer=player;player.root.classList.add('is-expanded');expandedDialog.append(player.root);expandedDialog.showModal();
}

const galleryGroups=[{id:'physics',label:'Physics'},{id:'mechanisms',label:'Mechanisms'},{id:'interaction',label:'Interaction'},{id:'exploration',label:'Exploration'}];
function galleryGroup(demo){
 if(demo.category==='chain')return 'mechanisms';
 if(demo.category==='physics')return 'physics';
 if(demo.category==='exploration'||demo.id==='565654414381281280')return 'exploration';
 return 'interaction';
}
function comparisonCard(demo,context='gallery'){
 const card=document.createElement('article');card.className='demo-card';card.id=context==='gallery'?`demo-${demo.id}`:`feature-${context}-${demo.id}`;
 const group=galleryGroup(demo);if(context==='gallery')card.dataset.galleryGroup=group;
 card.innerHTML=`<div class="player-mount" data-context="${escapeHTML(context)}"></div><div class="demo-caption">${context==='gallery'?`<span class="demo-tag">${escapeHTML(galleryGroups.find(item=>item.id===group).label)}</span>`:''}<p class="demo-description">${escapeHTML(demo.description)}</p></div>`;
 new ComparisonPlayer($('.player-mount',card),demo);return card;
}
function initGallery(demos){
 const order=['01','02','03','565650901563580418','565651248415711241','04','05','06','565645381968560130','565645630938275843','565645779475329032','565645900439048197','07','565650994584862728','565654414381281280','565654305249652744','565652346354520069','h3-v3-015','h3-v3-016'];
 const sorted=demos.slice().sort((a,b)=>galleryGroups.findIndex(group=>group.id===galleryGroup(a))-galleryGroups.findIndex(group=>group.id===galleryGroup(b))||order.indexOf(a.id)-order.indexOf(b.id));
 $('#gallery').replaceChildren(...sorted.map(demo=>comparisonCard(demo)));
}
function pauseAll(){players.forEach(player=>player.pause());}
function featurePanel(feature,examples){
 const panel=document.createElement('article');panel.className='feature-panel';panel.id=`panel-${feature.id}`;panel.setAttribute('aria-labelledby',`heading-${feature.id}`);
 panel.innerHTML=`<header class="feature-heading"><h3 class="feature-name" id="heading-${feature.id}">${escapeHTML(feature.heading)}</h3><p class="feature-subtitle">${escapeHTML(feature.subtitle||feature.shortHeading)}</p></header><div class="feature-media-grid"></div><div class="feature-copy-grid"><p class="feature-takeaway">${escapeHTML(feature.takeaway||feature.short)}</p><div class="feature-text"><p class="feature-summary">${escapeHTML(feature.summary||feature.body)}</p><details class="feature-details"><summary>How it works</summary><div class="detail-body"><ul>${(feature.mechanism||[]).map(fact=>`<li>${escapeHTML(fact)}</li>`).join('')}</ul></div></details></div></div>`;
 const media=$('.feature-media-grid',panel);
 if(examples.length===1)media.classList.add('single-example');
 if(examples.length)media.replaceChildren(...examples.map(demo=>comparisonCard(demo,feature.id)));
 else{
  media.classList.add('future-grid');media.innerHTML=`<div class="future-demo"><span class="future-symbol" aria-hidden="true">↗</span><p>An evolving world.<br><span>Demonstration in preparation.</span></p></div><div class="future-demo"><span class="future-symbol" aria-hidden="true">↻</span><p>The same persistent state.<br><span>Demonstration in preparation.</span></p></div>`;
 }
 return panel;
}

function initDiagram(){
 const dialog=$('.diagram-dialog');$('.diagram-open').addEventListener('click',()=>{pauseAll();dialog.showModal();});$('.diagram-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
}
async function init(){
 try{
  const [copy,demos,extras,featureDemos]=await Promise.all(['content','demos','extra-demos','feature-demos'].map(name=>fetch(`static/data/${name}.json`,{cache:'no-store'}).then(response=>{if(!response.ok)throw Error(`Missing ${name}`);return response.json();})));
  $('#hero-description').textContent=copy.heroDescription||'An executable world, shaped around the interactions that matter.';
  $('#introduction').replaceChildren(...(copy.introShort||copy.introduction).map(text=>{const paragraph=document.createElement('p');paragraph.textContent=text;return paragraph;}));
  const available=extras.filter(demo=>demo.whitebox&&demo.render);
  const adaptive=available.filter(demo=>demo.feature==='adaptive').slice(0,2);
  const zeroGravity=available.find(demo=>demo.title==='Zero-gravity chamber');
  const attributes=[demos.find(demo=>demo.id==='03'),zeroGravity||demos.find(demo=>demo.id==='06')].filter(Boolean);
  const examples={adaptive,attributes,extension:featureDemos.filter(demo=>demo.feature==='extension')};
  $('#feature-panels').replaceChildren(...copy.features.map(feature=>featurePanel(feature,examples[feature.id]||[])));
  const featuredIds=new Set(Object.values(examples).flat().map(demo=>demo.id));
  initGallery([...demos,...available].filter(demo=>!featuredIds.has(demo.id)));
  initDiagram();document.dispatchEvent(new CustomEvent('mallea:ready'));
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)for(const player of players)if(player.root===entry.target)player.pause();}),{threshold:0});players.forEach(player=>observer.observe(player.root));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseAll();});
  if(location.hash){const target=document.getElementById(location.hash.slice(1));if(target)requestAnimationFrame(()=>target.scrollIntoView({behavior:'instant'}));}
 }catch(error){console.error('Page content could not be loaded',error);$('#introduction').textContent='Content could not be loaded. Please reload the page.';$('#gallery').textContent='Video index could not be loaded.';}
}
init();
