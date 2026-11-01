(function(){
  function init(){
    var els=[].slice.call(document.querySelectorAll('.rv'));
    if(!('IntersectionObserver' in window)||!els.length){return}
    document.documentElement.classList.add('js');
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -6% 0px',threshold:.05});
    els.forEach(function(e){io.observe(e)});
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init)}else{init()}
})();
