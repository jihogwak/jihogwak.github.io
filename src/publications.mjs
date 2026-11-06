import { escapeHtml as escape, html, renderHeading, renderLink } from './html.mjs';

const PUBLICATION_GROUPS = ['학술지 논문', '학술대회 논문', '학위논문'];
const PROFILE_AUTHOR_NAMES = new Set(['곽지호', 'Jiho Gwak', 'Gwak Jiho']);

function renderPublication(item, headingTag = 'h4') {
  const authors = (item.authors ?? [])
    .map((author) =>
      PROFILE_AUTHOR_NAMES.has(author) ? `<strong>${escape(author)}</strong>` : escape(author),
    )
    .join(', ');
  const award = item.award ? `<span class="publication-award">${escape(item.award)}</span>` : '';
  const title = `<${headingTag}>${escape(item.title)}${award ? ' ' + award : ''}</${headingTag}>`;
  return html`<article class="publication-item">
    ${item.highlight ? `<p class="publication-highlight">${escape(item.highlight)}</p>` : ''}
    <div class="publication-meta">
      ${item.date ? `<span>${escape(item.date)}</span>` : ''}<span>${escape(item.role)}</span>
    </div>
    ${title}
    <p class="publication-authors">${authors}</p>
    <p class="publication-venue">${escape(item.venue)}</p>
    ${item.links?.length
      ? `<div class="publication-links">${item.links.map((source) => renderLink(source.href, source.label)).join('')}</div>`
      : ''}
  </article>`;
}

function renderPublicationGroups(publications) {
  return PUBLICATION_GROUPS.map((group, index) => {
    const items = publications.filter((item) => item.category === group);
    if (!items.length) return '';
    return html`<section class="publication-group" aria-labelledby="publication-group-${index}">
      <h3 class="publication-group-heading" id="publication-group-${index}">
        ${escape(group)}<span>${items.length}</span>
      </h3>
      <div class="publication-list">${items.map((item) => renderPublication(item)).join('')}</div>
    </section>`;
  }).join('');
}

function renderPatents(patents) {
  return html`<details class="patent-details">
    <summary>
      <span>등록 특허 <b>${patents.length}</b></span
      ><span class="details-symbol" aria-hidden="true">+</span>
    </summary>
    <div>
      ${patents
        .map(
          (item) =>
            html`<article>
              <h3>${escape(item.title)}</h3>
              <p>${escape(item.detail)}</p>
            </article>`,
        )
        .join('')}
    </div>
  </details>`;
}

export function renderPublications({ publications, patents }) {
  const featured = publications
    .filter((item) => item.featuredOrder)
    .sort((first, second) => first.featuredOrder - second.featuredOrder);
  const remaining = publications.filter((item) => !item.featuredOrder);
  return html`<section class="page-section" id="publications" aria-labelledby="publications-title">
    ${renderHeading('PUBLICATIONS', '논문 및 학술발표', 'publications-title')}
    <p class="publication-summary">SCIE 1편 · 국제학술대회 1건 · KCI 3편 · 국내학술대회 7건</p>
    <div class="featured-publications" aria-label="주요 연구 성과">
      ${featured.map((item) => renderPublication(item, 'h3')).join('')}
    </div>
    <details class="publication-more">
      <summary>
        <span class="more-closed">더보기</span><span class="more-open">접기</span
        ><span class="details-symbol" aria-hidden="true">+</span>
      </summary>
      <div class="publication-more-content">${renderPublicationGroups(remaining)}</div>
    </details>
    ${renderPatents(patents)}
  </section>`;
}
