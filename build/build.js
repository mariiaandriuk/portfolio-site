#!/usr/bin/env node
// Renders content/projects/*.json -> public/projects/<slug>.html
// Copies static assets. No dependencies.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'public');

const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
// Captions/alts from existing content are plain text; escape on render.

const FORM = fs.readFileSync(path.join(__dirname, 'form-template.html'), 'utf8');
const FOOTER_NOTE = 'All concepts by Maria Andriiuk. Visualizations developed with AI as a design assistant.';

function imgAnchor(img, title, n, eager) {
  return `<a class="project-detail-image" href="../${esc(img.full)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${esc(title)}, view ${n}, full size"><img src="../${esc(img.src)}" alt="${esc(img.alt)}" loading="${eager ? 'eager' : 'lazy'}"/>${img.caption ? `<span class="image-size-link">${esc(img.caption)}<span>Open full size ↗</span></span>` : ''}</a>`;
}

function renderProject(d) {
  const sections = (d.sections||[]).map(s => `<section><h2>${esc(s.heading)}</h2><p class="section-prose">${esc(s.body)}</p></section>`).join('');
  const materials = d.materials ? `<p class="materials"><strong>${esc(d.materials.heading)}</strong><br/>${esc(d.materials.body)}</p>` : '';
  const role = d.role ? `<p class="project-narrative"><strong>My role</strong><br/>${esc(d.role)}</p>` : '';
  const gallery = (d.images||[]).map((im,i) => imgAnchor(im, d.title, i+2, false)).join('');
  const lead = d.lead ? `<div class="project-lead-image">${imgAnchor(d.lead, d.title, 1, true)}</div>` : '';
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head><meta name="robots" content="noindex,nofollow"/><meta charSet="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${esc(d.title)} — ${esc(d.kind)} | Maria Andriiuk</title><meta name="description" content="${esc(d.meta_description || d.tagline || '')}"/>${d.lead ? `<link rel="preload" href="../${esc(d.lead.src)}" as="image"/>` : ''}<link rel="stylesheet" href="../_next/static/css/index.CaBKkS8r.css" data-rsc-css-href="../_next/static/css/index.CaBKkS8r.css" data-precedence="vite-rsc/importer-resources"/><link rel="stylesheet" href="../assets/overrides.css"/></head><body><header class="header"><a class="wordmark" href="../index.html">Maria Andriiuk<span>CONCEPT STUDIO</span></a><nav aria-label="Main navigation"><a href="../#work">Work</a><a href="../about">About</a><a href="../#services">Services</a><a href="../#contact">Contact</a></nav></header><main class="project-page"><a class="text-link" href="../#work">← All projects</a><article><div class="project-page-copy"><p class="eyebrow">${esc(d.kind)}</p><h1>${esc(d.title)}</h1><p class="project-page-summary">${esc(d.tagline)}</p>${lead}<p class="project-narrative">${esc(d.description)}</p>${materials}${role}<div class="project-page-sections">${sections}</div></div><div class="detail-images">${gallery}</div></article><section class="contact"><h2>Have a space<br/>in <em>mind?</em></h2>${FORM.replace('{subject}', 'Project enquiry — ' + d.title).replace('{redirect}', 'https://graphite-studio-preview-73kq.surge.sh/projects/' + d.slug + '.html')}</section></main><footer><a href="../#work">All projects</a><a href="../privacy">Privacy policy</a><p class="footer-note">${esc(FOOTER_NOTE)}</p></footer></body>
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
for (const item of ['assets', '_next', 'index.html', 'about.html', 'privacy.html', 'admin']) {
  const src = path.join(ROOT, item);
  if (!fs.existsSync(src)) continue;
  fs.cpSync(src, path.join(OUT, item), {recursive: true});
}
console.log('built', fs.readdirSync(path.join(OUT, 'projects')).length, 'project pages');
