/* Core Cruises | Reederei dropdown navigation | v1.1 | 2026-10-07 */
(function(){
  'use strict';

  var LINES = [
    ['AIDA','https://www.corecruises.de/reedereien/aida/'],
    ['Mein Schiff','https://www.corecruises.de/reedereien/mein-schiff/'],
    ['MSC Cruises','https://www.corecruises.de/reedereien/msc/'],
    ['Costa Kreuzfahrten','https://www.corecruises.de/reedereien/costa-kreuzfahrten/'],
    ['Norwegian Cruise Line','https://www.corecruises.de/reedereien/norwegian-cruise-line/'],
    ['Royal Caribbean','https://www.corecruises.de/reedereien/royal-caribbean/'],
    ['Explora Journeys','https://www.corecruises.de/reedereien/explora-journeys/']
  ];

  function pathNow(){
    var p=(window.location.pathname||'/').replace(/\/index\.html$/,'/');
    return p.endsWith('/') ? p : p + '/';
  }
  function currentFor(href){
    var now=pathNow();
    var target=href;
    try{target=new URL(href,window.location.origin).pathname;}catch(e){}
    target=target.replace(/\/index\.html$/,'/');
    if(!target.endsWith('/')) target += '/';
    return window.location.hostname.indexOf('corecruises.de')!==-1 && window.location.hostname!=='mein.corecruises.de' && (now===target || now.indexOf(target)===0);
  }
  function chevron(){
    return '<svg aria-hidden="true" viewBox="0 0 20 20" fill="none"><path d="m5.5 7.5 4.5 4.5 4.5-4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  function menuLinks(){
    return LINES.map(function(item){
      var active=currentFor(item[1]) ? ' aria-current="page"' : '';
      return '<a href="'+item[1]+'"'+active+'>'+item[0]+'</a>';
    }).join('');
  }

  function enhanceDesktop(){
    var nav=document.querySelector('.cc-shell-nav');
    if(!nav || nav.querySelector('.cc-lines-nav')) return;
    var link=nav.querySelector('a[data-cc-nav="lines"]');
    if(!link) return;

    var wrap=document.createElement('div');
    wrap.className='cc-lines-nav';
    wrap.dataset.open='false';

    var toggle=document.createElement('button');
    toggle.type='button';
    toggle.className='cc-lines-nav__toggle';
    toggle.setAttribute('aria-label','Reedereien direkt auswählen');
    toggle.setAttribute('aria-expanded','false');
    var id='cc-lines-menu-'+Math.random().toString(36).slice(2,8);
    toggle.setAttribute('aria-controls',id);
    toggle.innerHTML=chevron();

    var menu=document.createElement('div');
    menu.className='cc-lines-nav__menu';
    menu.id=id;
    menu.hidden=true;
    menu.innerHTML='<span class="cc-lines-nav__label">Direkt zur Reederei</span>'+menuLinks();

    link.parentNode.insertBefore(wrap,link);
    wrap.appendChild(link);
    wrap.appendChild(toggle);
    wrap.appendChild(menu);

    function setOpen(open){
      wrap.dataset.open=open?'true':'false';
      toggle.setAttribute('aria-expanded',open?'true':'false');
      menu.hidden=!open;
    }
    toggle.addEventListener('click',function(e){
      e.stopPropagation();
      setOpen(menu.hidden);
    });
    document.addEventListener('click',function(e){
      if(!wrap.contains(e.target)) setOpen(false);
    });
    wrap.addEventListener('keydown',function(e){
      if(e.key==='Escape'){
        setOpen(false);
        toggle.focus();
      }
    });
  }

  function enhanceMobile(){
    var nav=document.querySelector('.cc-shell-mobile__nav');
    if(!nav || nav.querySelector('.cc-lines-mobile')) return;
    var link=nav.querySelector('a[data-cc-nav="lines"]');
    if(!link) return;

    var wrap=document.createElement('div');
    wrap.className='cc-lines-mobile';
    wrap.dataset.open='false';

    var row=document.createElement('div');
    row.className='cc-lines-mobile__row';

    var toggle=document.createElement('button');
    toggle.type='button';
    toggle.className='cc-lines-mobile__toggle';
    toggle.setAttribute('aria-label','Reedereien direkt auswählen');
    toggle.setAttribute('aria-expanded','false');
    var id='cc-lines-mobile-'+Math.random().toString(36).slice(2,8);
    toggle.setAttribute('aria-controls',id);
    toggle.innerHTML=chevron();

    var submenu=document.createElement('div');
    submenu.className='cc-lines-mobile__submenu';
    submenu.id=id;
    submenu.hidden=true;
    submenu.innerHTML=menuLinks();

    link.parentNode.insertBefore(wrap,link);
    row.appendChild(link);
    row.appendChild(toggle);
    wrap.appendChild(row);
    wrap.appendChild(submenu);

    function setOpen(open){
      wrap.dataset.open=open?'true':'false';
      toggle.setAttribute('aria-expanded',open?'true':'false');
      submenu.hidden=!open;
    }
    toggle.addEventListener('click',function(){setOpen(submenu.hidden);});
  }

  function init(){
    enhanceDesktop();
    enhanceMobile();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
