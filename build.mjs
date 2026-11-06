import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderProfile } from './src/profile.mjs';
import { renderProject } from './src/project.mjs';

export const PROJECT_ROOT = path.dirname(fileURLToPath(import.meta.url));

export function build(root = PROJECT_ROOT) {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'content.json'), 'utf8'));
  const slugs = new Set();
  for (const { slug } of data.projects) {
    if (typeof slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slugs.has(slug)) {
      throw new Error(`Invalid or duplicate project slug: ${slug}`);
    }
    slugs.add(slug);
  }

  // Render before writing, so template errors leave existing pages intact.
  const pages = [{ filename: 'index.html', content: renderProfile(data) }];
  data.projects.forEach((item, index) => {
    const nextProject = data.projects[(index + 1) % data.projects.length];
    pages.push({
      filename: path.join('projects', item.slug, 'index.html'),
      content: renderProject(data, item, nextProject),
    });
  });
  for (const page of pages) {
    const destination = path.join(root, page.filename);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, page.content.replace(/[\t ]+$/gm, ''));
  }
  return data.projects.length;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(`Built profile and ${build()} project pages.`);
}
