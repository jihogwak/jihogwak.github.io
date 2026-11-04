const navLinks=[...document.querySelectorAll('.site-header nav a')];
const sections=navLinks.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
if(sections.length){
 let scheduled=false;
 const update=()=>{
  scheduled=false;
  const threshold=document.querySelector('.site-header').getBoundingClientRect().height+100;
  let active=sections[0];
  for(const section of sections)if(section.getBoundingClientRect().top<=threshold)active=section;
  for(const link of navLinks){if(link.hash==='#'+active.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}
 };
 addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update)}},{passive:true});
 addEventListener('resize',update);update();
}
