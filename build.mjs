import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arrow='<span aria-hidden="true">↗</span>';
function link(href,label,cls='text-link'){
 const external=href.startsWith('https://');
 return `<a class="${cls}" href="${esc(href)}"${external?' target="_blank" rel="noopener noreferrer"':''}>${esc(label)}${arrow}${external?'<span class="sr-only"> (새 탭)</span>':''}</a>`;
}
const heading=(label,title,id)=>`<div class="section-heading"><h2${id?` id="${id}"`:''}>${title}</h2><span>${label}</span></div>`;
function publicationItem(item,tag='h4'){
 return `<article class="publication-item">${item.highlight?`<p class="publication-highlight">${esc(item.highlight)}</p>`:''}<div class="publication-meta">${item.date?`<span>${esc(item.date)}</span>`:''}<span>${esc(item.role)}</span></div><${tag}>${esc(item.title)}${item.award?` <span class="publication-award">${esc(item.award)}</span>`:''}</${tag}><p class="publication-authors">${(item.authors??[]).map(author=>['곽지호','Jiho Gwak','Gwak Jiho'].includes(author)?`<strong>${esc(author)}</strong>`:esc(author)).join(', ')}</p><p class="publication-venue">${esc(item.venue)}</p>${item.links?.length?`<div class="publication-links">${item.links.map(source=>link(source.href,source.label)).join('')}</div>`:''}</article>`;
}
function publicationList(data){
 const groups=['학술지 논문','학술대회 논문','학위논문'];
 const featured=data.publications.filter(item=>item.featuredOrder).sort((a,b)=>a.featuredOrder-b.featuredOrder);
 const remaining=data.publications.filter(item=>!item.featuredOrder);
 const entries=groups.map((group,index)=>{
  const items=remaining.filter(item=>item.category===group);
  if(!items.length)return '';
  return `<section class="publication-group" aria-labelledby="publication-group-${index}"><h3 class="publication-group-heading" id="publication-group-${index}">${esc(group)}<span>${items.length}</span></h3><div class="publication-list">${items.map(item=>publicationItem(item)).join('')}</div></section>`;
 }).join('');
 return `<section class="page-section" id="publications" aria-labelledby="publications-title">${heading('PUBLICATIONS','논문 및 학술발표','publications-title')}<p class="publication-summary">SCIE 1편 · 국제학술대회 1건 · KCI 3편 · 국내학술대회 7건</p><div class="featured-publications" aria-label="주요 연구 성과">${featured.map(item=>publicationItem(item,'h3')).join('')}</div><details class="publication-more"><summary><span class="more-closed">더보기</span><span class="more-open">접기</span><span class="details-symbol" aria-hidden="true">+</span></summary><div class="publication-more-content">${entries}</div></details><details class="patent-details"><summary><span>등록 특허 <b>${data.patents.length}</b></span><span class="details-symbol" aria-hidden="true">+</span></summary><div>${data.patents.map(item=>`<article><h3>${esc(item.title)}</h3><p>${esc(item.detail)}</p></article>`).join('')}</div></details></section>`;
}
function shell(data,title,body,isProject=false){
const p=data.profile;
return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="description" content="${esc(p.name)} — 임베딩과 자연어처리를 연구하고 연구에 필요한 도구를 만드는 AI 연구자. 연구 이력과 논문·학술발표를 소개합니다."><title>${esc(title)}</title><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css"><script src="/site.js" defer></script></head>
<body${isProject?' class="case-page"':''}><a class="skip-link" href="#main">본문으로 건너뛰기</a><header class="site-header"><div class="header-inner"><a class="wordmark" href="/">${esc(p.name)}<span>${esc(p.nameEn)}</span></a>${isProject?'<a class="back-link" href="/#about">← 프로필로</a>':'<nav aria-label="주요 메뉴"><a href="#about" aria-current="location">소개</a><a href="#background">이력</a><a href="#publications">연구성과</a></nav>'}${link('mailto:'+p.email,'Contact','header-contact')}</div></header>${body}<footer class="site-footer"><span>© ${new Date().getFullYear()} ${esc(p.nameEn)}</span><span>${esc(p.motto)}</span><a href="#top">맨 위로 ↑</a></footer></body></html>`;
}
function index(data){
 const p=data.profile;
 const identity=`<aside class="identity" aria-label="프로필"><img class="portrait" src="/assets/profile-new.jpg" width="1060" height="1484" alt="곽지호 프로필 사진"><h1>${esc(p.name)}<span>${esc(p.nameEn)}</span></h1><p class="identity-role">${esc(p.role)}</p><div class="affiliation"><strong>${esc(p.school)}</strong><p>${esc(p.department)}<br>${esc(p.status)}</p></div>${link('mailto:'+p.email,p.email,'email-link')}<div class="identity-note"><span class="tiny-label">RESEARCH INTERESTS</span><p>NLP & Text Embeddings<br>LLM Agents & Retrieval<br>Text Classification<br>Text Augmentation</p></div><p class="identity-motto">Every Answer<br>Has a Story.</p></aside>`;
 const about=`<section class="page-section about-section" id="about" aria-labelledby="about-title">${heading('ABOUT','소개','about-title')}<div class="biography">${p.intro.map((para,i)=>`<p${i===0?' class="lead"':''}>${esc(para)}</p>`).join('')}</div><div class="research-interests" aria-label="연구 관심 분야">${p.interests.map(x=>`<span>${esc(x)}</span>`).join('')}</div><div class="research-note"><span aria-hidden="true">↳</span><p>${esc(p.summary)}</p></div></section>`;
 const background=`<section class="page-section" id="background" aria-labelledby="background-title">${heading('BACKGROUND','학력 및 연구 경험','background-title')}<h3 class="subheading">학력</h3><div class="education-list">${data.education.map(item=>`<article class="education-item"><span class="degree-label">${esc(item.label)}</span><div><h4>${esc(item.title)}</h4><p>${esc(item.detail)}</p></div></article>`).join('')}</div><h3 class="subheading">참여 연구과제</h3><div class="experience-list research-project-list">${data.experience.map(item=>`<article class="experience-item"><div class="experience-organization">${esc(item.organization)}<span class="experience-date">${esc(item.period)}</span></div><div><h4>${esc(item.title)}</h4></div></article>`).join('')}</div><h3 class="subheading">경험</h3><div class="experience-list lab-experience-list">${data.labExperience.map(item=>`<article class="experience-item"><h4>${esc(item.organization)} ${esc(item.title)}</h4><span class="experience-date">${esc(item.period)}</span></article>`).join('')}</div><h3 class="subheading">기술 스택 · 활용 경험</h3><dl class="skill-list">${data.skills.map(item=>`<div><dt>${esc(item.name)}</dt><dd><strong>${esc(item.tools)}</strong><p>${esc(item.use)}</p></dd></div>`).join('')}</dl></section>`;
 const publications=publicationList(data);
 const contact=`<section class="contact-section" aria-labelledby="contact-title"><span class="tiny-label">GET IN TOUCH</span><h2 id="contact-title">연구와 개발, 그 사이의 이야기.</h2><p>함께 풀어보고 싶은 문제나 나누고 싶은 이야기가 있다면 편하게 연락 주세요.</p>${link('mailto:'+p.email,p.email,'contact-email')}</section>`;
 return shell(data,p.name+' | AI Researcher & Developer',`<div class="page-layout" id="top">${identity}<main id="main">${about}${background}${publications}${contact}</main></div>`);
}
function project(data,item){
 const body=`<main id="main" class="case-main"><div id="top"></div><nav class="breadcrumb" aria-label="현재 위치"><a href="/">홈</a><span>/</span><span>${esc(item.displayTitle)}</span></nav><section class="case-intro"><p class="tiny-label">${esc(item.category)}</p><h1>${esc(item.displayTitle)}</h1><p class="case-subtitle">${esc(item.sub)}</p><dl class="case-facts">${item.facts.map(([name,value])=>`<div><dt>${esc(name)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>${item.slug==='embedding'?link('/embedding-model-landscape/','모델 구조 시각화 열기','button-link'):''}</section><div class="case-body"><aside class="case-index"><span class="tiny-label">ON THIS PAGE</span>${item.chapters.map((c,i)=>`<a href="#chapter-${i+1}">${String(i+1).padStart(2,'0')} ${esc(c[0])}</a>`).join('')}</aside><div class="case-chapters">${item.chapters.map(([label,title,text],i)=>`<section id="chapter-${i+1}"><p class="tiny-label">${String(i+1).padStart(2,'0')} / ${esc(label)}</p><h2>${esc(title)}</h2><p>${esc(text)}</p>${i===4&&item.link?link('/'+item.link,item.linkLabel,'text-link'):''}</section>`).join('')}<div class="case-end">${link('/#about','프로필로 돌아가기')} ${link('/projects/'+data.projects[(data.projects.indexOf(item)+1)%data.projects.length].slug+'/','다음 프로젝트')}</div></div></div></main>`;
 return shell(data,item.displayTitle+' | '+data.profile.name,body,true);
}
export function build(){
 const data=JSON.parse(fs.readFileSync(path.join(root,'content.json'),'utf8'));
 fs.writeFileSync(path.join(root,'index.html'),index(data));
 for(const item of data.projects){const dir=path.join(root,'projects',item.slug);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'index.html'),project(data,item));}
 return data.projects.length;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(`Built profile and ${build()} project pages.`);
