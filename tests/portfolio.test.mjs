import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import test from 'node:test';

const navigation = [
  ['/', 'Inicio'], ['/projects', 'Proyectos'],
  ['/work-experience', 'Experiencia laboral'], ['/skills', 'Habilidades'],
  ['/blog', 'Blog'], ['/contact', 'Contacto'],
];
const home = readFileSync('dist/index.html', 'utf8');
const pages = readdirSync('dist', { recursive: true })
  .filter((file) => file.endsWith('index.html'));

test('home presents .NET experience for hiring without consultancy copy', () => {
  assert.match(home, /Desarrollador Full Stack \.NET/);
  assert.match(home, /gestión académica y clínica/);
  assert.doesNotMatch(home, /¿Todavía dependes de Excel|Mi misión es catalizar/);
  assert.match(home, /alt="Foto de Diego Cáceres"/);
});

test('home offers working project and contact calls to action', () => {
  for (const [href, label] of [['/projects', 'Ver proyectos'], ['/contact', 'Contactar']]) {
    assert.match(home, new RegExp(`<a\\b[^>]*href="${href}"[^>]*>\\s*${label}\\s*</a>`));
    assert.ok(pages.includes(`${href.slice(1)}/index.html`));
  }
});

test('all pages expose ordered Spanish navigation with one current section', () => {
  assert.equal(pages.length, 12);
  for (const page of pages) {
    const html = readFileSync(join('dist', page), 'utf8');
    const sidebar = html.match(/<aside\b[^>]*id="default-sidebar"[\s\S]*?<\/aside>/)?.[0];
    assert.ok(sidebar, page);
    const links = [...sidebar.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)]
      .filter(([, attributes]) => /href="\//.test(attributes));
    assert.deepEqual(links.map(([, attributes, body]) => [
      attributes.match(/href="([^"]+)"/)[1], body.replace(/<[^>]+>/g, '').trim(),
    ]), navigation, page);
    const pathname = '/' + relative('dist', join('dist', page)).replace(/index\.html$/, '').replace(/\/$/, '');
    const expected = pathname === '' || pathname === '/' ? '/' : '/' + pathname.split('/')[1];
    const active = links.filter(([, attributes]) => /aria-current="page"/.test(attributes));
    assert.equal(active.length, 1, page);
    assert.equal(active[0][1].match(/href="([^"]+)"/)[1], expected, page);
    assert.match(active[0][1], /bg-gray-200/, page);
  }
});

test('shared navigation retains mobile drawer hooks and professional links', () => {
  for (const page of pages) {
    const html = readFileSync(join('dist', page), 'utf8');
    assert.match(html, /data-drawer-target="default-sidebar"/);
    assert.match(html, /data-drawer-toggle="default-sidebar"/);
    assert.match(html, /aria-controls="default-sidebar"/);
    assert.match(html, /Abrir menú/);
    assert.match(html, /aria-label="Navegación principal"/);
    assert.match(html, /href="https:\/\/github.com\/dcaceresc"/);
    assert.match(html, /href="https:\/\/www.linkedin.com\/in\/dcaceresc\/"/);
  }
});
