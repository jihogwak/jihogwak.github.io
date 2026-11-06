import { escapeHtml as escape, html, renderLink } from './html.mjs';

export function renderLayout(profile, title, body, { isProject = false } = {}) {
  const navigation = isProject
    ? '<a class="back-link" href="/#about">← 프로필로</a>'
    : html`<nav aria-label="주요 메뉴">
        <a href="#about" aria-current="location">소개</a><a href="#background">이력</a
        ><a href="#publications">연구성과</a>
      </nav>`;

  return html`<!doctype html>
    <html lang="ko">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="color-scheme" content="light" />
        <meta
          name="description"
          content="${escape(
            profile.name,
          )} — 임베딩과 자연어처리를 연구하고 연구에 필요한 도구를 만드는 AI 연구자. 연구 이력과 논문·학술발표를 소개합니다."
        />
        <title>${escape(title)}</title>
        <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />
        <link rel="stylesheet" href="/style.css" />
        <script src="/site.js" defer></script>
      </head>
      <body class="${isProject ? 'case-page' : ''}">
        <a class="skip-link" href="#main">본문으로 건너뛰기</a>
        <header class="site-header">
          <div class="header-inner">
            <a class="wordmark" href="/"
              >${escape(profile.name)}<span>${escape(profile.nameEn)}</span></a
            >
            ${navigation}${renderLink('mailto:' + profile.email, 'Contact', 'header-contact')}
          </div>
        </header>
        ${body}
        <footer class="site-footer">
          <span>© ${new Date().getFullYear()} ${escape(profile.nameEn)}</span
          ><span>${escape(profile.motto)}</span><a href="#top">맨 위로 ↑</a>
        </footer>
      </body>
    </html>`;
}
