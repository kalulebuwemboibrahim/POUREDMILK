document.addEventListener('DOMContentLoaded',()=>{
 const page=document.body.dataset.page;
 document.querySelectorAll('.nav a').forEach(a=>{if(a.dataset.page===page)a.classList.add('active')});
 const toggle=document.querySelector('.menu-toggle'), nav=document.querySelector('.nav');
 if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'Close':'Menu'});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.textContent='Menu'}));}
 const scaler=document.querySelector('#scaler');
 if(scaler){const base=Number(scaler.dataset.base||8);const out=document.querySelector('#scale-output');const servings=document.querySelector('#servings');const ingredients=[['Flour','250','g'],['Sugar','200','g'],['Cocoa powder','45','g'],['Eggs','2','large'],['Milk','180','ml'],['Oil','120','ml']];function fmt(n){return Math.abs(n-Math.round(n))<.001?String(Math.round(n)):n.toFixed(1)}function render(){const factor=Math.max(1,Number(servings.value||base))/base;out.innerHTML=ingredients.map(i=>`<li><strong>${i[0]}</strong> — ${fmt(Number(i[1])*factor)} ${i[2]}</li>`).join('')}servings.addEventListener('input',render);render()}
 const converter=document.querySelector('#converter');
 if(converter){const value=document.querySelector('#convert-value'),unit=document.querySelector('#convert-unit'),out=document.querySelector('#convert-output');function convert(){let v=Number(value.value||0),r='';if(unit.value==='cup-g')r=`${v} cup(s) ≈ ${(v*120).toFixed(0)} g flour`;if(unit.value==='g-cup')r=`${v} g flour ≈ ${(v/120).toFixed(2)} cup(s)`;if(unit.value==='oz-g')r=`${v} oz ≈ ${(v*28.3495).toFixed(1)} g`;if(unit.value==='g-oz')r=`${v} g ≈ ${(v/28.3495).toFixed(2)} oz`;if(unit.value==='ml-cup')r=`${v} ml ≈ ${(v/236.588).toFixed(2)} cup(s)`;if(unit.value==='cup-ml')r=`${v} cup(s) ≈ ${(v*236.588).toFixed(0)} ml`;if(unit.value==='c-f')r=`${v}°C = ${(v*9/5+32).toFixed(0)}°F`;if(unit.value==='f-c')r=`${v}°F = ${((v-32)*5/9).toFixed(0)}°C`;out.textContent=r}value.addEventListener('input',convert);unit.addEventListener('change',convert);convert()}
 const search=document.querySelector('#recipe-search'), filters=[...document.querySelectorAll('.filter')], cards=[...document.querySelectorAll('.searchable-recipe')], count=document.querySelector('#recipe-count');
 if(search&&cards.length){let active='all';function update(){const q=search.value.trim().toLowerCase();let n=0;cards.forEach(card=>{const okFilter=active==='all'||card.dataset.category===active||card.dataset.level===active;const okQuery=!q||card.dataset.title.includes(q);const show=okFilter&&okQuery;card.hidden=!show;if(show)n++});count.textContent=`${n} recipe${n===1?'':'s'}`}filters.forEach(btn=>btn.addEventListener('click',()=>{filters.forEach(b=>b.classList.remove('active'));btn.classList.add('active');active=btn.dataset.filter;update()}));search.addEventListener('input',update);update()}
});

/* POUREDMILK — full-page language interface.
   The selector controls the Google Website Translator so explanations,
   recipes, long-form guides, buttons and dynamically rendered text are
   translated, rather than only a small navigation dictionary.
*/
(() => {
  const supported = ['en','fr','ar','es','pt','de','it','nl','tr','sw','hi','zh-CN','ja','ko','ru'];
  const select = document.getElementById('languageSelect');
  if(!select) return;
  const saved = localStorage.getItem('pouredmilk-language') || 'en';
  select.value = saved === 'zh-CN' ? 'zh' : saved;

  function setDirection(lang){
    const rtl = lang === 'ar';
    document.documentElement.lang = lang;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.body.classList.toggle('is-rtl', rtl);
  }

  function googleLang(lang){ return lang === 'zh' ? 'zh-CN' : lang; }

  window.pouredmilkTranslate = function(lang){
    const target = googleLang(lang);
    localStorage.setItem('pouredmilk-language', target);
    setDirection(target);
    const combo = document.querySelector('.goog-te-combo');
    if(!combo){
      // The Google widget loads asynchronously. Retry briefly instead of
      // requiring the visitor to refresh or choose the language twice.
      let tries=0;
      const timer=setInterval(()=>{
        const c=document.querySelector('.goog-te-combo');
        if(c || ++tries>30){clearInterval(timer); if(c) change(c,target);}
      },250);
      return;
    }
    change(combo,target);
  };

  function change(combo,target){
    combo.value = target;
    combo.dispatchEvent(new Event('change'));
    setDirection(target);
  }

  select.addEventListener('change', e => window.pouredmilkTranslate(e.target.value));
  setDirection(saved === 'zh-CN' ? 'zh' : saved);

  // Google may replace translated text after navigation. Keep the interface
  // selector synced with the stored language on each page.
  window.addEventListener('pageshow',()=>{
    const current=localStorage.getItem('pouredmilk-language')||'en';
    select.value=current==='zh-CN'?'zh':current;
    setDirection(current==='zh-CN'?'zh':current);
  });
})();

// Google Website Translator callback.
function googleTranslateElementInit(){
  new google.translate.TranslateElement({
    pageLanguage:'en',
    includedLanguages:'en,fr,ar,es,pt,de,it,nl,tr,sw,hi,zh-CN,ja,ko,ru',
    autoDisplay:false,
    multilanguagePage:true
  }, 'google_translate_element');
  const saved=localStorage.getItem('pouredmilk-language');
  if(saved && saved!=='en') setTimeout(()=>window.pouredmilkTranslate && window.pouredmilkTranslate(saved==='zh-CN'?'zh':saved),900);
}

/* POUREDMILK author-photo controls */
(function(){
  try{
    var saved=localStorage.getItem('pouredmilk-author-photo');
    if(!saved) return;
    var zoom=parseFloat(localStorage.getItem('pouredmilk-author-photo-zoom')||'1');
    var pos=localStorage.getItem('pouredmilk-author-photo-position')||'50';
    document.querySelectorAll('.author-portrait img, .author-photo img, img[data-author-photo]').forEach(function(img){
      img.src=saved;
      img.style.objectPosition='center '+pos+'%';
      img.style.transform='scale('+zoom+')';
    });
  }catch(e){}
})();
