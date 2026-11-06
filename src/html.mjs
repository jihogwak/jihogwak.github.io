const HTML_ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => HTML_ENTITIES[character]);
}

export function html(strings, ...values) {
  return strings.reduce((result, part, index) => result + part + (values[index] ?? ''), '');
}

export function renderLink(href, label, className = 'text-link') {
  const external = /^https?:\/\//.test(href);
  return html`<a
    class="${escapeHtml(className)}"
    href="${escapeHtml(href)}"
    ${external ? 'target="_blank" rel="noopener noreferrer"' : ''}
    >${escapeHtml(label)}<span aria-hidden="true">↗</span>${external
      ? '<span class="sr-only"> (새 탭)</span>'
      : ''}</a
  >`;
}

export function renderHeading(label, title, id) {
  return html`<div class="section-heading">
    <h2 id="${escapeHtml(id)}">${escapeHtml(title)}</h2>
    <span>${escapeHtml(label)}</span>
  </div>`;
}
