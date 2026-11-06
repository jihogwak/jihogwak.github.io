import { escapeHtml as escape, html, renderHeading, renderLink } from './html.mjs';
import { renderLayout } from './layout.mjs';
import { renderPublications } from './publications.mjs';

function renderIdentity(profile) {
  return html`<aside class="identity" aria-label="프로필">
    <img
      class="portrait"
      src="/assets/profile-new.jpg"
      width="1060"
      height="1484"
      alt="${escape(profile.name)} 프로필 사진"
    />
    <h1>${escape(profile.name)}<span>${escape(profile.nameEn)}</span></h1>
    <p class="identity-role">${escape(profile.role)}</p>
    <div class="affiliation">
      <strong>${escape(profile.school)}</strong>
      <p>${escape(profile.department)}<br />${escape(profile.status)}</p>
    </div>
    ${renderLink('mailto:' + profile.email, profile.email, 'email-link')}
    <div class="identity-note">
      <span class="tiny-label">RESEARCH INTERESTS</span>
      <p>
        NLP & Text Embeddings<br />LLM Agents & Retrieval<br />Text Classification<br />Text
        Augmentation
      </p>
    </div>
    <p class="identity-motto">Every Answer<br />Has a Story.</p>
  </aside>`;
}

function renderAbout(profile) {
  return html`<section class="page-section about-section" id="about" aria-labelledby="about-title">
    ${renderHeading('ABOUT', '소개', 'about-title')}
    <div class="biography">
      ${profile.intro
        .map(
          (paragraph, index) => `<p${index === 0 ? ' class="lead"' : ''}>${escape(paragraph)}</p>`,
        )
        .join('')}
    </div>
    <div class="research-interests" aria-label="연구 관심 분야">
      ${profile.interests.map((interest) => `<span>${escape(interest)}</span>`).join('')}
    </div>
    <div class="research-note">
      <span aria-hidden="true">↳</span>
      <p>${escape(profile.summary)}</p>
    </div>
  </section>`;
}

function renderEducation(education) {
  return html`<h3 class="subheading">학력</h3>
    <div class="education-list">
      ${education
        .map(
          (item) =>
            html`<article class="education-item">
              <span class="degree-label">${escape(item.label)}</span>
              <div>
                <h4>${escape(item.title)}</h4>
                <p>${escape(item.detail)}</p>
              </div>
            </article>`,
        )
        .join('')}
    </div>`;
}

function renderResearchProjects(experience) {
  return html`<h3 class="subheading">참여 연구과제</h3>
    <div class="experience-list research-project-list">
      ${experience
        .map(
          (item) =>
            html`<article class="experience-item">
              <div class="experience-organization">
                ${escape(item.organization)}<span class="experience-date"
                  >${escape(item.period)}</span
                >
              </div>
              <div><h4>${escape(item.title)}</h4></div>
            </article>`,
        )
        .join('')}
    </div>`;
}

function renderExperience(experience) {
  return html`<h3 class="subheading">경험</h3>
    <div class="experience-list lab-experience-list">
      ${experience
        .map(
          (item) =>
            html`<article class="experience-item">
              <h4>${escape(item.organization)} ${escape(item.title)}</h4>
              <span class="experience-date">${escape(item.period)}</span>
            </article>`,
        )
        .join('')}
    </div>`;
}

function renderSkills(skills) {
  return html`<h3 class="subheading">기술 스택 · 활용 경험</h3>
    <dl class="skill-list">
      ${skills
        .map(
          (item) =>
            html`<div>
              <dt>${escape(item.name)}</dt>
              <dd>
                <strong>${escape(item.tools)}</strong>
                <p>${escape(item.use)}</p>
              </dd>
            </div>`,
        )
        .join('')}
    </dl>`;
}

function renderBackground(data) {
  return html`<section class="page-section" id="background" aria-labelledby="background-title">
    ${renderHeading('BACKGROUND', '학력 및 연구 경험', 'background-title')}
    ${renderEducation(data.education)}${renderResearchProjects(data.experience)}${renderExperience(
      data.labExperience,
    )}${renderSkills(data.skills)}
  </section>`;
}

function renderContact(profile) {
  return html`<section class="contact-section" aria-labelledby="contact-title">
    <span class="tiny-label">GET IN TOUCH</span>
    <h2 id="contact-title">모든 연구에는 이야기가 있습니다.</h2>
    ${renderLink('mailto:' + profile.email, profile.email, 'contact-email')}
  </section>`;
}

export function renderProfile(data) {
  const body = html`<div class="page-layout" id="top">
    ${renderIdentity(data.profile)}
    <main id="main">
      ${renderAbout(data.profile)}${renderBackground(data)}${renderPublications(
        data,
      )}${renderContact(data.profile)}
    </main>
  </div>`;
  return renderLayout(data.profile, data.profile.name + ' | AI Researcher & Developer', body);
}
