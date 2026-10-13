(()=>{
 const links=[...document.querySelectorAll('a.project-detail-image')];
 if(!links.length || !('HTMLDialogElement' in window))return;
 const dialog=document.createElement('dialog');
 dialog.className='image-viewer';dialog.setAttribute('aria-label','Full-size project image');
 dialog.innerHTML='<button class="image-viewer-close" type="button" aria-label="Close image and return to project"><span aria-hidden="true">×</span><span>Close</span></button><figure><img alt=""/><figcaption></figcaption></figure><p class="image-viewer-error" role="status" hidden>Image could not load. Close this view and try again.</p>';
 document.body.append(dialog);
 const image=dialog.querySelector('img'),caption=dialog.querySelector('figcaption'),close=dialog.querySelector('button'),error=dialog.querySelector('.image-viewer-error');
 let opener=null,oldOverflow='';
 const finish=()=>{document.body.style.overflow=oldOverflow;image.removeAttribute('src');if(opener)opener.focus({preventScroll:true});};
 close.addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',finish);
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
 image.addEventListener('error',()=>{error.hidden=false;});
 for(const link of links){
  link.addEventListener('click',e=>{
   if(e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
   e.preventDefault();opener=link;oldOverflow=document.body.style.overflow;
   const original=link.querySelector('img');image.alt=original?.alt||'Project image';
   caption.textContent=link.querySelector('.image-size-link')?.firstChild?.textContent?.trim()||image.alt;
   error.hidden=true;image.src=link.href;dialog.showModal();document.body.style.overflow='hidden';close.focus();
  });
 }
})();
