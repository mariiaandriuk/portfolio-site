#!/usr/bin/env node
// Renders content/projects/*.json -> public/projects/<slug>.html
// Copies static assets. No dependencies.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'public');

const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
// Captions/alts from existing content are plain text; escape on render.

const FORM = fs.readFileSync(path.join(__dirname, 'form-template.html'), 'utf8');
const FOOTER_NOTE = 'All concepts by Maria Andriiuk. Visualizations developed with AI as a design assistant.';
const SITE = 'https://mariiaandriiuk.netlify.app';
const DEFAULT_OG_IMAGE = 'assets/tropical-pavilion-display.webp';

function imgAnchor(img, title, n, eager) {
  return `<a class="project-detail-image" href="../${esc(img.full)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${esc(title)}, view ${n}, full size"><img src="../${esc(img.src)}" alt="${esc(img.alt)}" loading="${eager ? 'eager' : 'lazy'}"/>${img.caption ? `<span class="image-size-link">${esc(img.caption)}<span>Open full size ↗</span></span>` : ''}</a>`;
}

function renderProject(d) {
  const ogImg = (d.lead && d.lead.src) || (d.cover ? 'assets/' + d.cover : DEFAULT_OG_IMAGE);
  const sections = (d.sections||[]).map(s => `<section><h2>${esc(s.heading)}</h2><p class="section-prose">${esc(s.body)}</p></section>`).join('');
  const materials = d.materials ? `<p class="materials"><strong>${esc(d.materials.heading)}</strong><br/>${esc(d.materials.body)}</p>` : '';
  const role = d.role ? `<p class="project-narrative"><strong>My role</strong><br/>${esc(d.role)}</p>` : '';
  const gallery = (d.images||[]).map((im,i) => imgAnchor(im, d.title, i+2, false)).join('');
  const lead = d.lead ? `<div class="project-lead-image">${imgAnchor(d.lead, d.title, 1, true)}</div>` : '';
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head><meta charSet="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><link rel="canonical" href="${SITE}/projects/${d.slug}.html"/><meta property="og:type" content="website"/><meta property="og:site_name" content="Maria Andriiuk — Concept Studio"/><meta property="og:title" content="${esc(d.title)} — ${esc(d.kind)} | Maria Andriiuk"/><meta property="og:description" content="${esc(d.meta_description || d.tagline || '')}"/><meta property="og:url" content="${SITE}/projects/${d.slug}.html"/><meta property="og:image" content="${SITE}/${esc(ogImg)}"/><meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content="${esc(d.title)} — ${esc(d.kind)} | Maria Andriiuk"/><meta name="twitter:description" content="${esc(d.meta_description || d.tagline || '')}"/><meta name="twitter:image" content="${SITE}/${esc(ogImg)}"/><title>${esc(d.title)} — ${esc(d.kind)} | Maria Andriiuk</title><meta name="description" content="${esc(d.meta_description || d.tagline || '')}"/>${d.lead ? `<link rel="preload" href="../${esc(d.lead.src)}" as="image"/>` : ''}<link rel="stylesheet" href="../_next/static/css/index.CaBKkS8r.css" data-rsc-css-href="../_next/static/css/index.CaBKkS8r.css" data-precedence="vite-rsc/importer-resources"/><link rel="stylesheet" href="../assets/overrides.css"/></head><body><header class="header"><a class="wordmark" href="../index.html">Maria Andriiuk<span>CONCEPT STUDIO</span></a><nav aria-label="Main navigation"><a href="../#work">Work</a><a href="../about">About</a><a href="../#services">Services</a><a href="../#contact">Contact</a></nav></header><main class="project-page"><a class="text-link" href="../#work">← All projects</a><article><div class="project-page-copy"><p class="eyebrow">${esc(d.kind)}</p><h1>${esc(d.title)}</h1><p class="project-page-summary">${esc(d.tagline)}</p>${lead}<p class="project-narrative">${esc(d.description)}</p>${materials}${role}<div class="project-page-sections">${sections}</div></div><div class="detail-images">${gallery}</div></article><section class="contact"><h2>Have a space<br/>in <em>mind?</em></h2>${FORM.replace('{subject}', 'Project enquiry — ' + d.title).replace('{redirect}', 'https://mariiaandriiuk.netlify.app/projects/' + d.slug + '.html')}</section></main><footer><a href="../#work">All projects</a><a href="../privacy">Privacy policy</a><p class="footer-note">${esc(FOOTER_NOTE)}</p></footer></body>
</html>`;
}

fs.rmSync(OUT, {recursive: true, force: true});
fs.mkdirSync(path.join(OUT, 'projects'), {recursive: true});
for (const f of fs.readdirSync(path.join(ROOT, 'content/projects'))) {
  if (!f.endsWith('.json')) continue;
  const d = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/projects', f), 'utf8'));
  if (d.published === false) continue;
  fs.writeFileSync(path.join(OUT, 'projects', d.slug + '.html'), renderProject(d));
}
// copy static dirs/files
for (const item of ['assets', '_next', 'index.html', 'about.html', 'privacy.html', 'admin', 'robots.txt']) {
  const src = path.join(ROOT, item);
  if (!fs.existsSync(src)) continue;
  fs.cpSync(src, path.join(OUT, item), {recursive: true});
}
console.log('built', fs.readdirSync(path.join(OUT, 'projects')).length, 'project pages');

// ---- index + about rendering ----
const CATS = [
  ['Restaurants & cafes', 'collection-0', 'Restaurants &amp; cafés'],
  ['Hotels', 'collection-1', 'Hotels'],
  ['Residences', 'collection-2', 'Residences'],
  ['Wellness', 'collection-3', 'Wellness &amp; retreats'],
  ['Retail', 'collection-4', 'Retail &amp; showrooms'],
  ['Studios', 'collection-5', 'Photography studios'],
];
const ORDER = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/card-order.json'), 'utf8'));
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/site.json'), 'utf8'));
const aboutC = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/about.json'), 'utf8'));
const all = fs.readdirSync(path.join(ROOT, 'content/projects'))
  .filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(path.join(ROOT, 'content/projects', f), 'utf8')))
  .filter(d => d.published !== false);
all.sort((a, b) => (ORDER[a.slug] ?? 999) - (ORDER[b.slug] ?? 999));

function card(d, n) {
  return `<article><a class="project" href="projects/${d.slug}.html" aria-label="Explore ${esc(d.title)}"><span class="project-photo"><img src="assets/${esc(d.cover || (d.lead && d.lead.src) || '')}" alt="${esc(d.cover_alt || (d.title + ' — ' + d.kind))}" loading="lazy"/></span><span class="project-caption"><span><span class="number">${String(n).padStart(2,'0')}<!-- --> /</span>${esc(d.title)}</span><span class="project-arrow">↗</span></span><span class="project-kind">${esc(d.card_kind || d.kind)}</span></a><p class="project-note">${esc(d.card_note || d.tagline)}</p></article>`;
}

let idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
for (const [cat, cid, heading] of CATS) {
  const items = all.filter(d => d.category === cat);
  const articles = items.map((d, i) => card(d, i + 1)).join('');
  const section = `<section id="${cid}" class="collection"><div class="collection-heading"><h3>${heading}</h3><span>${String(items.length).padStart(2,'0')}<!-- --> <!-- -->${items.length===1?'project':'projects'}</span></div><div class="projects">${articles}</div></section>`;
  idx = idx.replace(new RegExp(`<section id="${cid}" class="collection">.*?</section>`, 's'), section);
}
idx = idx.replace(/<span>\d+<!-- --> SELECTED CONCEPTS<\/span>/, `<span>${all.length}<!-- --> SELECTED CONCEPTS</span>`);
idx = idx.replace(/(<p class="contact-intro">).*?(<\/p>)/s, `$1${esc(site.contact_intro)}$2`);
idx = idx.replace(/(<p class="footer-note">).*?(<\/p>)/s, `$1${esc(site.footer_note)}$2`);
fs.writeFileSync(path.join(OUT, 'index.html'), idx);

let ab = fs.readFileSync(path.join(ROOT, 'about.html'), 'utf8');
ab = ab.replace(/(<p class="project-narrative">).*?(<\/p>)/s, `$1${esc(aboutC.intro)}$2`);
for (const [h, key] of [['Approach','approach'],['What I do','what_i_do'],['How I work','how_i_work']]) {
  ab = ab.replace(new RegExp(`(<section><h2>${h}</h2><p class="section-prose">).*?(</p></section>)`, 's'), `$1${esc(aboutC[key])}$2`);
}
fs.writeFileSync(path.join(OUT, 'about.html'), ab);
console.log('rendered index + about from content');

// ---- sitemap ----
const smUrls = ['/', '/about', '/privacy', ...all.map(d => `/projects/${d.slug}.html`)];
const sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  + smUrls.map(u => `  <url><loc>${SITE}${u}</loc></url>`).join('\n')
  + '\n</urlset>\n';
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), sm);
console.log('sitemap:', smUrls.length, 'urls');
