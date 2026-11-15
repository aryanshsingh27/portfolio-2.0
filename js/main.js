// Portfolio interactions and intro sequence
(function(){
  'use strict';
  var d=document,w=window,bd=d.body,quiet=w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s,r){return(r||d).querySelector(s)}
  function $$(s,r){return[].slice.call((r||d).querySelectorAll(s))}
  $$('[data-from]').forEach(function(i){i.src=d.getElementById(i.getAttribute('data-from')).src});

  /* ---------- Aryansh: poses, speech ---------- */
  var me=$('#aryansh'),bub=$('#bubble'),say=$('#say'),sr=$('#say-sr'),cur=null,tm=null,poseTimer=null,shown=null,rest=null,muted=false,F={};
  $$('.m img',me).forEach(function(i){var p=i.getAttribute('data-pose');if(p==='rest'){rest=i}else{(F[p]=F[p]||[])[+i.getAttribute('data-f')]=i}});
  function show(el){if(shown)shown.classList.remove('on');el.classList.add('on');shown=el}
  show(rest);
  var ab=$('#about-aryansh');if(ab&&F.present)ab.src=F.present[5].src;
  function setMood(k){var tgt=F[k];if(!tgt)return;clearInterval(poseTimer);
    var cp=shown.getAttribute('data-pose'),ci=+shown.getAttribute('data-f'),path=[],i;
    if(cp===k){for(i=ci+1;i<tgt.length;i++)path.push(tgt[i])}
    else{if(cp!=='rest'){for(i=ci-1;i>=0;i--)path.push(F[cp][i]);path.push(rest)}
      for(i=0;i<tgt.length;i++)path.push(tgt[i])}
    if(quiet){show(tgt[tgt.length-1]);return}
    var n=0;poseTimer=setInterval(function(){if(n>=path.length){clearInterval(poseTimer);return}show(path[n]);n+=1},38)}
  function stop(){clearInterval(tm);me.classList.remove('talk')}
  function speak(t){stop();sr.textContent=t;bub.classList.remove('hide');
    if(quiet){say.textContent=t;return}
    say.textContent='';me.classList.add('talk');var i=0;
    tm=setInterval(function(){i+=1;say.textContent=t.slice(0,i);if(i>=t.length)stop()},22)}
  function focusSection(best){cur=best;var away=best.id==='about';me.classList.toggle('away',away);setMood(best.getAttribute('data-mood')||'wave');
    var a=getComputedStyle(best).getPropertyValue('--acc').trim();if(a)me.style.setProperty('--acc',a);
    if(away){stop();bub.classList.add('hide')}else if(!muted){speak(best.getAttribute('data-say'))}}
  $('.m',me).addEventListener('click',function(){muted=false;if(cur)speak(cur.getAttribute('data-say'))});
  $('.x',bub).addEventListener('click',function(){muted=true;stop();bub.classList.add('hide')});

  /* ---------- the desk: sheets, objects, nav highlight (one rAF-throttled pass) ---------- */
  var sheets=$$('.sheet'),objs=$$('.obj'),desks=[],links=$$('nav a[href^="#"]'),navIds={},curNav=null,ticking=false;
  links.forEach(function(a){navIds[a.getAttribute('href').slice(1)]=a});
  sheets.forEach(function(s,i){s.style.setProperty('--dir',i%2?1:-1);s.style.setProperty('--rot',[-.4,.35,-.2,.45,-.3,.25][i%6]+'deg');s.style.setProperty('--tape',[14,52,86,32,70][i%5]+'%');s._pops=$$('.pop',s);s._e=-1;s._in=false});
  objs.forEach(function(o){var p=o.parentNode,i=desks.indexOf(p);if(i<0){desks.push(p);i=desks.length-1}o._d=i;o._s=+o.getAttribute('data-speed')||0;o._y=1e9});
  function req(){if(!ticking){ticking=true;w.requestAnimationFrame(frame)}}
  function frame(){ticking=false;
    var vh=w.innerHeight,mid=vh*.5,best=null,navBest=null,navTop=-1e9,introOn=bd.classList.contains('intro'),i,s,r,t,p,e,o,dy;
    var sr_=new Array(sheets.length),dr_=new Array(desks.length);
    for(i=0;i<sheets.length;i++)sr_[i]=sheets[i].getBoundingClientRect();
    for(i=0;i<desks.length;i++)dr_[i]=desks[i].getBoundingClientRect();
    for(i=0;i<sheets.length;i++){s=sheets[i];r=sr_[i];t=r.top;
      p=t<=0?1:Math.min(1,Math.max(0,(vh-t)/(vh*.6)));e=1-Math.pow(1-p,3);
      if(Math.abs(e-s._e)>.002||(p===1&&s._e!==1)||(p===0&&s._e!==0)){s._e=e;s.style.setProperty('--p',e.toFixed(3))}
      var near=r.bottom>-vh*1.2&&t<vh*2.2;if(near!==s._near){s._near=near;s.classList.toggle('live',near)}
      if(p>.3&&!introOn&&!s._in){s._in=true;s._pops.forEach(function(x){x.classList.add('in')})}
      if(s.hasAttribute('data-say')&&t<=mid&&r.bottom>mid)best=s;
      if(s.id&&navIds[s.id]&&t<=vh*.4&&t>navTop){navTop=t;navBest=s.id}}
    for(i=0;i<objs.length;i++){o=objs[i];r=dr_[o._d];
      if(r.bottom<-vh||r.top>vh*2)continue;
      dy=Math.round((r.top+r.height/2-mid)*o._s);if(dy!==o._y){o._y=dy;o.style.setProperty('--dy',dy+'px')}}
    if(best&&best!==cur&&!introOn)focusSection(best);
    if(navBest!==curNav){curNav=navBest;links.forEach(function(a){var on=a===navIds[navBest];a.classList.toggle('on',on);if(on){a.setAttribute('aria-current','true')}else{a.removeAttribute('aria-current')}})}}
  w.addEventListener('scroll',req,{passive:true});w.addEventListener('resize',req);

  /* ---------- in-page links: one smooth, reliable scroller ---------- */
  var navEl=$('nav'),scrollAnim=null;
  function offset(){return(navEl?navEl.offsetHeight:50)+14}
  function ty(el){return el.id==='home'?0:Math.max(0,Math.round(el.getBoundingClientRect().top+w.scrollY-offset()))}
  function cancelScroll(){if(scrollAnim){w.cancelAnimationFrame(scrollAnim);scrollAnim=null}}
  function settle(el,hash){
    el.setAttribute('tabindex','-1');try{el.focus({preventScroll:true})}catch(x){}
    setTimeout(function(){var y=ty(el);if(Math.abs(y-w.scrollY)>2)w.scrollTo(0,y)},160);
    try{w.history.replaceState(null,'',hash)}catch(x){}}
  function goTo(el,hash){cancelScroll();var start=w.scrollY,dist=Math.abs(ty(el)-start),dur=quiet?0:Math.min(1200,Math.max(450,dist*.22)),t0=null;
    if(!dur||dist<2){w.scrollTo(0,ty(el));settle(el,hash);return}
    function step(ts){if(t0===null)t0=ts;var k=Math.min(1,(ts-t0)/dur),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
      w.scrollTo(0,start+(ty(el)-start)*e);
      if(k<1){scrollAnim=w.requestAnimationFrame(step)}else{scrollAnim=null;settle(el,hash)}}
    scrollAnim=w.requestAnimationFrame(step)}
  ['wheel','touchstart','keydown','mousedown'].forEach(function(ev){w.addEventListener(ev,cancelScroll,{passive:true})});
  d.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    var id=a.getAttribute('href').slice(1),el=id&&d.getElementById(id);if(!el||bd.classList.contains('intro'))return;
    e.preventDefault();goTo(el,'#'+id)});

  /* ---------- lightbox ---------- */
  var lb=$('#lb');
  d.addEventListener('click',function(e){var t=e.target;
    if(t.classList&&t.classList.contains('zoom')){$('img',lb).src=t.src;lb.classList.add('on')}
    else if(lb.classList.contains('on')){lb.classList.remove('on')}});
  d.addEventListener('keydown',function(e){if(e.key==='Escape')lb.classList.remove('on')});

  /* ---------- contact form (opens the visitor's email app) ---------- */
  var cf=$('#connect-form');
  if(cf){cf.addEventListener('submit',function(e){e.preventDefault();
    var f=new FormData(cf),n=String(f.get('name')||'').trim(),m=String(f.get('email')||'').trim(),t=String(f.get('topic')||''),g=String(f.get('message')||'').trim();
    var url='mailto:aryansh2712@gmail.com?subject='+encodeURIComponent('Portfolio message: '+t+' ('+n+')')+'&body='+encodeURIComponent(g+'\n\n'+n+'\n'+m);
    $('#form-status').textContent='Opening your email app. If nothing opens, write to aryansh2712@gmail.com directly.';
    var a=d.createElement('a');a.href=url;bd.appendChild(a);a.click();a.remove()})}

  /* ---------- opening animation ---------- */
  var intro=$('#intro'),flaps=$('#flaps'),stg=$('.stage'),skipB=$('#skip'),tms=[];
  function confetti(){var cols=['#3f5fe0','#f3ead0','#f2a33a','#ff5c8a','#2f4b94','#ffffff'],cx=w.innerWidth/2,cy=w.innerHeight/2;
    for(var i=0;i<36;i++){var e=d.createElement('i');e.className='cf';var cw=6+Math.random()*9,ch=8+Math.random()*12;
      e.style.cssText='position:fixed;z-index:175;left:'+cx+'px;top:'+cy+'px;width:'+cw+'px;height:'+ch+'px;background:'+cols[i%cols.length]+';border-radius:'+(i%3?'2px':'50%')+';pointer-events:none';
      bd.appendChild(e);
      var a=(-90+(Math.random()-.5)*150)*Math.PI/180,dd=140+Math.random()*Math.min(w.innerWidth,w.innerHeight)*.45,x=Math.cos(a)*dd,y=Math.sin(a)*dd,g=180+Math.random()*160;
      e.animate([{transform:'translate(0,0) rotate(0deg)',opacity:1},{transform:'translate('+x+'px,'+y+'px) rotate('+Math.round(Math.random()*540-270)+'deg)',opacity:1,offset:.55},{transform:'translate('+x*1.15+'px,'+(y+g)+'px) rotate('+Math.round(Math.random()*720-360)+'deg)',opacity:0}],{duration:1300+Math.random()*500,easing:'cubic-bezier(.2,.7,.4,1)',fill:'forwards'}).onfinish=(function(el){return function(){el.remove()}})(e)}}
  function done(){tms.forEach(clearTimeout);if(stg.getAnimations)stg.getAnimations().forEach(function(x){x.cancel()});stg.style.transform='';
    bd.classList.remove('intro','introshow','introopen','introlow','introshake');
    [intro,flaps,skipB].forEach(function(e){if(e)e.remove()});$$('.cf').forEach(function(e){e.remove()});
    var h=w.location.hash,t=h.length>1?d.getElementById(h.slice(1)):null;w.scrollTo(0,t?ty(t):0);
    try{w.sessionStorage.setItem('intro','1')}catch(x){}
    if(!quiet){me.classList.add('arrive');setTimeout(function(){me.classList.remove('arrive')},1000)}
    cur=null;req()}
  function play(){var s=Math.min(.62,560/w.innerWidth),r=d.documentElement.style,hint=$('.ihint',intro);
    r.setProperty('--bw',w.innerWidth*s+'px');r.setProperty('--bh',w.innerHeight*s+'px');stg.style.transform='scale('+s+')';
    w.requestAnimationFrame(function(){w.requestAnimationFrame(function(){bd.classList.add('introshow')})});
    tms.push(setTimeout(function(){bd.classList.add('introshake')},1000));
    tms.push(setTimeout(function(){bd.classList.remove('introshake');bd.classList.add('introopen');hint.textContent='ta-da!';confetti()},1650));
    tms.push(setTimeout(function(){bd.classList.add('introlow');hint.style.opacity='0';
      var a=stg.animate([{transform:'scale('+s+') rotate(0deg)',offset:0,easing:'cubic-bezier(.2,1.6,.4,1)'},{transform:'scale('+s*1.16+') translateY(-6%) rotate(-2.2deg)',offset:.3,easing:'ease-in-out'},{transform:'scale('+s*1.12+') translateY(-5%) rotate(1.2deg)',offset:.42,easing:'cubic-bezier(.5,0,.15,1)'},{transform:'scale(1) rotate(0deg)',offset:1}],{duration:1500,fill:'forwards'});
      a.onfinish=done;tms.push(setTimeout(function(){intro.style.opacity='0'},1150))},3050));
    skipB.addEventListener('click',done)}

  req();
  var seen=false;try{seen=w.sessionStorage.getItem('intro')==='1'}catch(x){}
  if(quiet||seen||(w.location.hash&&w.location.hash!=='#home')){done()}else{play()}
})();
