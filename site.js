function initializeNavigation() {
  const header = document.querySelector('.site-header');
  const links = Array.from(document.querySelectorAll('.site-header nav a'));
  const sections = links.map((link) => document.getElementById(link.hash.slice(1))).filter(Boolean);
  if (!header || !sections.length) return;

  let framePending = false;
  function updateActiveSection() {
    framePending = false;
    const threshold = header.getBoundingClientRect().height + 100;
    let activeSection = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= threshold) activeSection = section;
    }
    for (const link of links) {
      if (link.hash === '#' + activeSection.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }

  function scheduleUpdate() {
    if (framePending) return;
    framePending = true;
    requestAnimationFrame(updateActiveSection);
  }
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  updateActiveSection();
}

initializeNavigation();
