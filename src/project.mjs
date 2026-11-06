import { escapeHtml as escape, html, renderLink } from './html.mjs';
import { renderLayout } from './layout.mjs';

function renderProjectIntro(item) {
  return html`<section class="case-intro">
    <p class="tiny-label">${escape(item.category)}</p>
    <h1>${escape(item.displayTitle)}</h1>
    <p class="case-subtitle">${escape(item.sub)}</p>
    <dl class="case-facts">
      ${item.facts
        .map(
          ([name, value]) =>
            html`<div>
              <dt>${escape(name)}</dt>
              <dd>${escape(value)}</dd>
            </div>`,
        )
        .join('')}
    </dl>
    ${item.slug === 'embedding'
      ? renderLink('/embedding-model-landscape/', '모델 구조 시각화 열기', 'button-link')
      : ''}
  </section>`;
}

function renderChapters(item) {
  return item.chapters
    .map(
      ([label, title, text], index) =>
        html`<section id="chapter-${index + 1}">
          <p class="tiny-label">${String(index + 1).padStart(2, '0')} / ${escape(label)}</p>
          <h2>${escape(title)}</h2>
          <p>${escape(text)}</p>
          ${index === 4 && item.link ? renderLink('/' + item.link, item.linkLabel) : ''}
        </section>`,
    )
    .join('');
}

export function renderProject(data, item, nextProject) {
  const body = html`<main id="main" class="case-main">
    <div id="top"></div>
    <nav class="breadcrumb" aria-label="현재 위치">
      <a href="/">홈</a><span>/</span><span>${escape(item.displayTitle)}</span>
    </nav>
    ${renderProjectIntro(item)}
    <div class="case-body">
      <aside class="case-index">
        <span class="tiny-label">ON THIS PAGE</span>${item.chapters
          .map(
            ([label], index) =>
              `<a href="#chapter-${index + 1}">${String(index + 1).padStart(2, '0')} ${escape(label)}</a>`,
          )
          .join('')}
      </aside>
      <div class="case-chapters">
        ${renderChapters(item)}
        <div class="case-end">
          ${renderLink('/#about', '프로필로 돌아가기')}
          ${renderLink('/projects/' + nextProject.slug + '/', '다음 프로젝트')}
        </div>
      </div>
    </div>
  </main>`;
  return renderLayout(data.profile, item.displayTitle + ' | ' + data.profile.name, body, {
    isProject: true,
  });
}
