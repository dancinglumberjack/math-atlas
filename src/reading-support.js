(function(){
 'use strict';
 const defaults={preset:'standard',size:1,font:'original',line:1.75,letters:0,words:0,paper:'cream',contrast:false,focus:false,oneStep:false,ruler:false,reduceMotion:false};
 let settings={...defaults},storageAvailable=true,guideY=180,speaking=false;
 try{const saved=JSON.parse(localStorage.getItem('math-atlas-reading-v1')||'null');if(saved&&typeof saved==='object')settings={...defaults,...saved};}catch{storageAvailable=false;}
 function normalize(s){
  return {preset:['standard','dyslexia','adhd','custom'].includes(s.preset)?s.preset:'custom',size:[1,1.12,1.25,1.4].includes(Number(s.size))?Number(s.size):1,font:['original','arial','verdana','system'].includes(s.font)?s.font:'original',line:[1.65,1.75,1.9,2.1].includes(Number(s.line))?Number(s.line):1.75,letters:[0,.02,.04,.08,.12].includes(Number(s.letters))?Number(s.letters):0,words:[0,.05,.1,.16].includes(Number(s.words))?Number(s.words):0,paper:['cream','white','blue'].includes(s.paper)?s.paper:'cream',contrast:Boolean(s.contrast),focus:Boolean(s.focus),oneStep:Boolean(s.oneStep),ruler:Boolean(s.ruler),reduceMotion:Boolean(s.reduceMotion)};
 }
 settings=normalize(settings);
 function set(next,custom=false){settings=normalize({...settings,...next,...(custom?{preset:'custom'}:{})});try{localStorage.setItem('math-atlas-reading-v1',JSON.stringify(settings));}catch{storageAvailable=false;}apply();}
 function apply(){
  const body=document.body;
  body.dataset.readingFont=settings.font;body.dataset.paper=settings.paper;body.classList.toggle('reading-adjusted',settings.size!==1||settings.font!=='original'||settings.letters!==0||settings.words!==0||settings.line!==1.75);body.classList.toggle('focus-support',settings.focus);body.classList.toggle('one-step-support',settings.oneStep);body.classList.toggle('high-contrast',settings.contrast);body.classList.toggle('reduce-motion',settings.reduceMotion);
  body.style.setProperty('--reading-scale',settings.size);body.style.setProperty('--reading-size',(15*settings.size)+'px');body.style.setProperty('--reading-line',settings.line);body.style.setProperty('--reading-letters',settings.letters+'em');body.style.setProperty('--reading-words',settings.words+'em');
  const guide=document.getElementById('reading-guide');if(guide){guide.hidden=!settings.ruler;moveGuide(guideY);}
  syncControls();stopSpeech();document.dispatchEvent(new CustomEvent('atlasreadingchange',{detail:{...settings}}));
 }
 function syncControls(){
  for(const key of ['size','font','line','letters','words','paper']){const field=document.getElementById('reading-'+key);if(field)field.value=String(settings[key]);}
  for(const key of ['contrast','focus','oneStep','ruler','reduceMotion']){const field=document.getElementById('reading-'+key);if(field)field.checked=settings[key];}
  document.querySelectorAll('[data-reading-preset]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.readingPreset===settings.preset)));
  const status=document.getElementById('reading-local-status');if(status)status.textContent=storageAvailable?'Your choices are remembered in this browser.':'These choices work for this visit; browser storage is unavailable.';
  const toolbar=document.getElementById('reading-open');if(toolbar){toolbar.textContent=settings.preset==='standard'?'Reading support':'Reading support · on';}
 }
 function preset(name){
  if(name==='standard')set({...defaults});
  else if(name==='dyslexia')set({...defaults,preset:'dyslexia',size:1.12,font:'arial',line:1.9,letters:.02,words:.05});
  else if(name==='adhd')set({...defaults,preset:'adhd',font:'system',line:1.9,focus:true,oneStep:true,reduceMotion:true});
 }
 function moveGuide(y){guideY=Math.max(45,Math.min(innerHeight-35,y));const guide=document.getElementById('reading-guide');if(guide)guide.style.top=(guideY-22)+'px';}
 function stopSpeech(){if('speechSynthesis'in window&&speaking)window.speechSynthesis.cancel();speaking=false;const button=document.getElementById('listen-lesson');if(button){button.textContent='Listen to this step';button.setAttribute('aria-pressed','false');}}
 function speak(){
  if(speaking){stopSpeech();return;}if(!('speechSynthesis'in window)||!('SpeechSynthesisUtterance'in window))return;
  const step=document.querySelector('#worked-steps li:last-child'),goal=document.getElementById('lesson-goal'),why=document.getElementById('lesson-why');
  const raw=[document.getElementById('lesson-title')?.textContent,goal?.textContent,step?'Current step. '+step.textContent:why?.textContent].filter(Boolean).join('. ');
  const spoken=raw.replace(/²/g,' squared ').replace(/³/g,' cubed ').replace(/×/g,' times ').replace(/÷/g,' divided by ').replace(/−/g,' minus ').replace(/π/g,' pi ').replace(/√/g,' square root of ').replace(/≈/g,' approximately ').replace(/=/g,' equals ').replace(/°/g,' degrees ').replace(/≠/g,' is not equal to ');
  const utterance=new SpeechSynthesisUtterance(spoken);utterance.lang='en-US';utterance.rate=.88;const voice=window.speechSynthesis.getVoices().find(v=>v.localService&&/^en/i.test(v.lang));if(voice)utterance.voice=voice;
  utterance.onend=()=>{speaking=false;updateContext();};utterance.onerror=()=>{speaking=false;updateContext();const status=document.getElementById('listen-status');if(status)status.textContent='Read aloud is unavailable on this device right now.';};
  speaking=true;window.speechSynthesis.speak(utterance);const button=document.getElementById('listen-lesson');button.textContent='Stop reading';button.setAttribute('aria-pressed','true');
 }
 function updateContext(){
  const button=document.getElementById('listen-lesson');if(!button)return;const available='speechSynthesis'in window&&'SpeechSynthesisUtterance'in window;button.disabled=!available||document.getElementById('lesson-view').hidden;button.textContent=speaking?'Stop reading':'Listen to this step';button.setAttribute('aria-pressed',String(speaking));
  const status=document.getElementById('listen-status');if(status&&!available)status.textContent='Your browser does not offer read aloud. Reading settings still work.';
 }
 function init(){
  if(document.getElementById('reading-dialog'))return;
  const dialog=document.createElement('dialog');dialog.id='reading-dialog';dialog.setAttribute('aria-labelledby','reading-title');
  dialog.innerHTML=`<div class="reading-heading"><div><p class="eyebrow">Make this feel easier</p><h2 id="reading-title">Your reading preferences</h2></div><button type="button" class="text-btn" id="reading-close" aria-label="Close reading preferences">Close ✕</button></div><p class="reading-intro">Start with a preset, then choose what feels comfortable. Different readers prefer different settings.</p><div class="reading-presets"><button type="button" data-reading-preset="standard" aria-pressed="true"><strong>Standard</strong><span>Original presentation</span></button><button type="button" data-reading-preset="dyslexia" aria-pressed="false"><strong>Dyslexia reading support</strong><span>Clear type, larger text, more breathing room</span></button><button type="button" data-reading-preset="adhd" aria-pressed="false"><strong>ADHD focus support</strong><span>Less clutter, one step at a time, reduced motion</span></button></div><h3>Adjust the presentation</h3><div class="reading-fields"><label>Text size<select id="reading-size"><option value="1">100% · original</option><option value="1.12">112% · larger</option><option value="1.25">125% · large</option><option value="1.4">140% · extra large</option></select></label><label>Typeface<select id="reading-font"><option value="original">Original mixed type</option><option value="arial">Arial · clear sans serif</option><option value="verdana">Verdana · wider letters</option><option value="system">Device sans serif</option></select></label><label>Line spacing<select id="reading-line"><option value="1.65">Comfortable · 1.65</option><option value="1.75">Standard · 1.75</option><option value="1.9">Spacious · 1.9</option><option value="2.1">Extra spacious · 2.1</option></select></label><label>Letter spacing<select id="reading-letters"><option value="0">Original</option><option value="0.02">A little more</option><option value="0.04">More</option><option value="0.08">Wide</option><option value="0.12">Extra wide</option></select></label><label>Word spacing<select id="reading-words"><option value="0">Original</option><option value="0.05">A little more</option><option value="0.1">More</option><option value="0.16">Wide</option></select></label><label>Page background<select id="reading-paper"><option value="cream">Warm cream</option><option value="white">White</option><option value="blue">Soft blue</option></select></label></div><div class="reading-checks"><label><input type="checkbox" id="reading-contrast"> Stronger text contrast</label><label><input type="checkbox" id="reading-focus"> Focus layout · simplify the screen</label><label><input type="checkbox" id="reading-oneStep"> Show one worked step at a time</label><label><input type="checkbox" id="reading-reduceMotion"> Reduce motion</label><label><input type="checkbox" id="reading-ruler"> Reading guide · follow a line with your pointer</label></div><p class="subtle">When the guide is on, move your pointer to position it. You can also use Alt + ↑ / ↓.</p><div class="reading-footer"><button class="btn primary" type="button" id="reading-done">Use these settings</button><button class="text-btn" type="button" id="reading-reset">Reset to standard</button><span class="subtle" id="reading-local-status"></span></div>`;
  document.body.append(dialog);const guide=document.createElement('div');guide.id='reading-guide';guide.hidden=true;guide.setAttribute('aria-hidden','true');document.body.append(guide);
  const trigger=document.getElementById('reading-open');if(trigger){trigger.setAttribute('aria-haspopup','dialog');trigger.onclick=()=>dialog.showModal();}
  document.getElementById('reading-close').onclick=()=>dialog.close();document.getElementById('reading-done').onclick=()=>dialog.close();document.getElementById('reading-reset').onclick=()=>preset('standard');
  dialog.querySelectorAll('[data-reading-preset]').forEach(button=>button.onclick=()=>preset(button.dataset.readingPreset));
  ['size','font','line','letters','words','paper'].forEach(key=>document.getElementById('reading-'+key).onchange=e=>set({[key]:e.target.value},true));
  ['contrast','focus','oneStep','ruler','reduceMotion'].forEach(key=>document.getElementById('reading-'+key).onchange=e=>set({[key]:e.target.checked},true));
  document.addEventListener('pointermove',e=>{if(settings.ruler&&!document.querySelector('dialog[open]'))moveGuide(e.clientY);},{passive:true});
  document.addEventListener('keydown',e=>{if(settings.ruler&&e.altKey&&(e.key==='ArrowUp'||e.key==='ArrowDown')){e.preventDefault();moveGuide(guideY+(e.key==='ArrowUp'?-24:24));}});
  document.getElementById('listen-lesson')?.addEventListener('click',speak);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSpeech();});window.addEventListener('hashchange',stopSpeech);
  apply();updateContext();
 }
 window.MathReading={init,set,getSettings:()=>({...settings}),preset,updateContext,stopSpeech};
 init();
})();
