import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { build, PROJECT_ROOT } from '../build.mjs';
import { escapeHtml, renderLink } from '../src/html.mjs';

const content = JSON.parse(await readFile(path.join(PROJECT_ROOT, 'content.json'), 'utf8'));

async function createFixture(context, data = content) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'portfolio-build-'));
  context.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(path.join(root, 'content.json'), JSON.stringify(data));
  return root;
}

test('build keeps featured publications separate from the collapsed list', async (context) => {
  const root = await createFixture(context);
  assert.equal(build(root), content.projects.length);
  const page = await readFile(path.join(root, 'index.html'), 'utf8');
  const featuredEnd = page.indexOf('<details class="publication-more">');
  const featuredPage = page.slice(0, featuredEnd);
  const remainingPage = page.slice(featuredEnd);

  for (const publication of content.publications) {
    assert.ok(
      (publication.featuredOrder ? featuredPage : remainingPage).includes(
        escapeHtml(publication.title),
      ),
    );
  }
  assert.doesNotMatch(page, /<details[^>]*\bopen\b/);
  assert.equal((page.match(/class="publication-item"/g) ?? []).length, content.publications.length);
  assert.match(page, /SCIE 1편 · 국제학술대회 1건 · KCI 3편 · 국내학술대회 7건/);
});

test('build preserves project navigation and produces repeatable output', async (context) => {
  const root = await createFixture(context);
  build(root);
  const original = await readFile(path.join(root, 'index.html'), 'utf8');
  for (const [index, project] of content.projects.entries()) {
    const page = await readFile(path.join(root, 'projects', project.slug, 'index.html'), 'utf8');
    const nextProject = content.projects[(index + 1) % content.projects.length];
    assert.ok(page.includes(`href="/projects/${nextProject.slug}/"`));
    assert.ok(page.includes(escapeHtml(project.displayTitle)));
  }
  build(root);
  assert.equal(await readFile(path.join(root, 'index.html'), 'utf8'), original);
});

test('invalid or duplicate slugs fail before overwriting existing pages', async (context) => {
  for (const slug of ['../outside', 'nested/project', '']) {
    const data = structuredClone(content);
    data.projects[0].slug = slug;
    const root = await createFixture(context, data);
    await writeFile(path.join(root, 'index.html'), 'Existing page');
    assert.throws(() => build(root), /Invalid or duplicate project slug/);
    assert.equal(await readFile(path.join(root, 'index.html'), 'utf8'), 'Existing page');
  }
  const data = structuredClone(content);
  data.projects[1].slug = data.projects[0].slug;
  const root = await createFixture(context, data);
  assert.throws(() => build(root), /duplicate project slug/);
});

test('profile text and link attributes are escaped', async (context) => {
  const data = structuredClone(content);
  data.profile.name = '<script>alert("name")</script>';
  data.profile.intro = ['Research & <experiments>'];
  const root = await createFixture(context, data);
  build(root);
  const page = await readFile(path.join(root, 'index.html'), 'utf8');
  assert.doesNotMatch(page, /<script>alert/);
  assert.ok(page.includes('Research &amp; &lt;experiments&gt;'));
  const external = renderLink('https://example.com/?a="b"&c=1', '<Research>');
  assert.match(external, /rel="noopener noreferrer"/);
  assert.ok(external.includes('&quot;b&quot;&amp;c=1'));
  assert.ok(external.includes('&lt;Research&gt;'));
  assert.doesNotMatch(renderLink('mailto:research@example.com', 'Contact'), /target=/);
});
