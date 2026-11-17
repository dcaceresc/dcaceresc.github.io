import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = (route) => readFileSync(`dist/${route}/index.html`, 'utf8');
const text = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const projects = page('projects');
const experience = page('work-experience');
const skills = page('skills');
const articles = [...projects.matchAll(/<article\b[^>]*>[\s\S]*?<\/article>/g)].map(([html]) => html);

test('projects lead with the existing API and separate unfinished work', () => {
  assert.equal(articles.length, 3, 'three original projects retained as case summaries');
  assert.ok(articles[0].includes('FakeGundamWikiAPI'), 'API comes first');
  assert.ok(projects.indexOf('Proyectos en desarrollo') > projects.indexOf('FakeGundamWikiAPI'));
  assert.ok(!/href="\s*"/.test(projects), 'no empty links');
  assert.ok(/href="https:\/\/fakegundamwikiapi.onrender.com\/"/.test(articles[0]));
  assert.ok(articles[0].includes('API REST') && articles[0].includes('didáctic'));
  assert.ok(articles[0].includes('.NET 8'));
  for (const [index, name, technology] of [[1, 'BuscaTuHobby', 'Angular'], [2, 'DeckHub', 'Laravel']]) {
    assert.ok(articles[index].includes(name) && articles[index].includes(technology));
    assert.ok(articles[index].includes('En desarrollo'), name);
    assert.ok(!/<a\b/.test(articles[index]), `${name} has no misleading demo link`);
  }
});

test('project summaries explain documented purpose and technology without invented proof', () => {
  for (const article of articles) {
    const content = text(article);
    assert.ok(content.includes('Objetivo') && content.includes('Tecnología'));
    assert.ok(/<img\b[^>]*alt="[^"]+"/.test(article), 'existing images retained with names');
  }
  assert.ok(!text(projects).includes('BuscaTuGumpla'));
  assert.ok(!text(projects).includes('En Contrucción'));
});

test('experience prioritizes documented contributions and retains employers and dates', () => {
  const content = text(experience);
  assert.ok(content.indexOf('Experiencia profesional') < content.indexOf('Educación'));
  for (const value of ['Facultad de Economía y Negocios', 'Hospital Clínico', 'Universidad de Chile',
    'Octubre 2021', 'Actualidad', 'Agosto 2015', 'Septiembre 2021',
    'Desarrollador de Software', 'Analista Programador', 'gestión académica', 'integración de datos']) {
    assert.ok(content.includes(value), value);
  }
  assert.ok(!/libres de errores|funcionamiento ininterrumpido/.test(content));
});

test('education and certificate remain accessible', () => {
  const content = text(experience);
  for (const value of ['Universidad Católica del Maule', 'Marzo 2008', 'Diciembre 2015', 'Ingeniero Civil Informático']) {
    assert.ok(content.includes(value), value);
  }
  assert.ok(/<a\b[^>]*href="\/Titulo.pdf"[^>]*>\s*Ver certificado\s*<\/a>/.test(experience));
});

test('skills prioritize .NET and connect only documented projects with their status', () => {
  const content = text(skills);
  const headings = [...skills.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)].map(([, body]) => text(body));
  assert.equal(headings[0], '.NET (Framework/Core)');
  for (const value of ['Angular', 'Laravel', 'SQL', 'Git', 'JavaScript/TypeScript', 'SQL Server', 'MySQL', 'PostgreSQL', 'GitHub', 'Bitbucket']) {
    assert.ok(content.includes(value), value);
  }
  for (const id of ['fake-gundam-wiki-api', 'busca-tu-hobby', 'deckhub']) {
    assert.ok(skills.includes(`href="/projects#${id}"`), id);
    assert.ok(projects.includes(`id="${id}"`), `${id} resolves`);
  }
  assert.ok(content.includes('En desarrollo'));
  assert.ok(!/Experto|OpenAI|Semantic Kernel|RAG/.test(content), 'no new proficiency or AI claims');
});

test('SQL skill retains its engines and links the Go terminal client SQLTerm', () => {
  const sections = [...skills.matchAll(/<section\b[^>]*>[\s\S]*?<\/section>/g)].map(([html]) => html);
  const sql = sections.find((html) => /<h2\b[^>]*>SQL<\/h2>/.test(html));
  assert.ok(sql, 'SQL skill section exists');
  const content = text(sql);
  assert.ok(content.includes('Gestión de bases de datos con SQL Server, MySQL y PostgreSQL.'));
  assert.ok(content.includes('SQLTerm — Cliente SQL de terminal escrito en Go para SQL Server, MySQL y PostgreSQL.'));
  const link = sql.match(/<a\b[^>]*href="https:\/\/github\.com\/dcaceresc\/sqlterm"[^>]*>[\s\S]*?<\/a>/)?.[0];
  assert.ok(link, 'SQLTerm repository linked within the SQL card');
  assert.ok(text(link).includes('SQLTerm'), 'meaningful link text');
  if (/target="_blank"/.test(link)) {
    const rel = link.match(/rel="([^"]*)"/)?.[1].split(/\s+/) ?? [];
    assert.ok(rel.includes('noopener') && rel.includes('noreferrer'), 'safe new-tab link');
  }
});

test('each professional page has one main heading and ordered section headings', () => {
  for (const [name, html] of Object.entries({ projects, experience, skills })) {
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1, name);
    assert.ok(!/<h[5-6]\b/.test(html), name);
  }
});
