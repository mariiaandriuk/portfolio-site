#!/usr/bin/env node
// Renders content/projects/*.json -> public/projects/<slug>.html
// Copies static assets. No dependencies.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'public');

const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
// Captions/alts from existing content are plain text; escape on render.

const FORM = fs.readFileSync(path.join(__dirname, 'form-template.html'), 'utf8');
const FOOTER_NOTE = 'All concepts by Mariia Andriiuk. Visualizations developed with AI as a design assistant.';
const SITE = 'https://meryemstudio.com';
const DEFAULT_OG_IMAGE = 'assets/og/tropical-pavilion-display.jpg';

function imgAnchor(img, title, n, eager) {
  return `<a class="project-detail-image" href="../${esc(img.full)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${esc(title)}, view ${n}, full size"><img src="../${esc(img.src)}" alt="${esc(img.alt)}" loading="${eager ? 'eager' : 'lazy'}"/>${img.caption ? `<span class="image-size-link">${esc(img.caption)}<span>Open full size ↗</span></span>` : ''}</a>`;
}

function renderProject(d) {
  const ogBase = (d.lead && d.lead.src) || (d.cover ? 'assets/' + d.cover : null);
  const ogDerived = ogBase ? 'assets/og/' + path.basename(ogBase).replace(/\.[^.]+$/, '') + '.jpg' : null;
  const ogImg = (ogDerived && fs.existsSync(path.join(ROOT, ogDerived))) ? ogDerived : (d.slug === 'tempus' ? ogBase : DEFAULT_OG_IMAGE);
  const sections = (d.sections||[]).map(s => `<section><h2>${esc(s.heading)}</h2><p class="section-prose">${esc(s.body)}</p></section>`).join('');
  const materials = d.materials ? `<p class="materials"><strong>${esc(d.materials.heading)}</strong><br/>${esc(d.materials.body)}</p>` : '';
  const role = d.role ? `<p class="project-narrative"><strong>My role</strong><br/>${esc(d.role)}</p>` : '';
  const credit = d.credit ? `<p class="project-narrative project-credit">${esc(d.credit)}</p>` : '';
  const gallery = (d.images||[]).map((im,i) => imgAnchor(im, d.title, i+2, false)).join('');
  const lead = d.lead ? `<div class="project-lead-image">${imgAnchor(d.lead, d.title, 1, true)}</div>` : '';
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head><meta charSet="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><link rel="canonical" href="${SITE}/projects/${d.slug}.html"/><meta property="og:type" content="website"/><meta property="og:site_name" content="Mariia Andriiuk — Concept Studio"/><meta property="og:title" content="${esc(d.title)} — ${esc(d.kind)} | Mariia Andriiuk"/><meta property="og:description" content="${esc(d.meta_description || d.tagline || '')}"/><meta property="og:url" content="${SITE}/projects/${d.slug}.html"/><meta property="og:image" content="${SITE}/${esc(ogImg)}"/><meta property="og:image:width" content="1200"/><meta property="og:image:height" content="630"/><meta property="og:image:type" content="image/jpeg"/><meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content="${esc(d.title)} — ${esc(d.kind)} | Mariia Andriiuk"/><meta name="twitter:description" content="${esc(d.meta_description || d.tagline || '')}"/><meta name="twitter:image" content="${SITE}/${esc(ogImg)}"/><title>${esc(d.title)} — ${esc(d.kind)} | Mariia Andriiuk</title><meta name="description" content="${esc(d.meta_description || d.tagline || '')}"/>${d.lead ? `<link rel="preload" href="../${esc(d.lead.src)}" as="image"/>` : ''}<link rel="stylesheet" href="../_next/static/css/index.CaBKkS8r.css" data-rsc-css-href="../_next/static/css/index.CaBKkS8r.css" data-precedence="vite-rsc/importer-resources"/><link rel="stylesheet" href="../assets/overrides.css"/></head><body><header class="header"><a class="wordmark" href="../index.html">Mariia Andriiuk<span>CONCEPT STUDIO</span></a><nav aria-label="Main navigation"><a href="../#work">Work</a><a href="../about">About</a><a href="../work-together">Work together</a><a href="../#contact">Contact</a></nav></header><main class="project-page"><a class="text-link" href="../#work">← All projects</a><article><div class="project-page-copy"><p class="eyebrow">${esc(d.kind)}</p><h1>${esc(d.title)}</h1><p class="project-page-summary">${esc(d.tagline)}</p>${lead}<p class="project-narrative">${esc(d.description)}</p>${materials}${role}<div class="project-page-sections">${sections}</div>${credit}</div><div class="detail-images">${gallery}</div></article><section class="contact"><h2>Have a space<br/>in <em>mind?</em></h2>${FORM.replace('{subject}', 'Project enquiry — ' + d.title).replace('{redirect}', 'https://meryemstudio.com/projects/' + d.slug + '.html')}</section></main><footer><a href="../#work">All projects</a><a href="../privacy">Privacy policy</a><p class="footer-note">${esc(FOOTER_NOTE)}</p></footer></body>
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
for (const item of ['assets', '_next', 'index.html', 'about.html', 'privacy.html', 'work-together.html', 'admin', 'robots.txt']) {
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
ab = ab.replace('href="./#services">Services', 'href="/work-together">Work together').replace('href="#services">Services', 'href="/work-together">Work together').replace('href="/#services">Services', 'href="/work-together">Work together').replace('href="index.html#services">Services', 'href="/work-together">Work together');
fs.writeFileSync(path.join(OUT, 'about.html'), ab);
console.log('rendered index + about from content');

// ---- sitemap ----
const smUrls = ['/', '/about', '/privacy', '/work-together', ...all.map(d => `/projects/${d.slug}.html`)];
const sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  + smUrls.map(u => `  <url><loc>${SITE}${u}</loc></url>`).join('\n')
  + '\n</urlset>\n';
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), sm);
console.log('sitemap:', smUrls.length, 'urls');

// ---- approved artwork watermarks (source images remain unchanged) ----
const watermarkFiles = {};
const watermarkCorners = ['br', 'tl', 'bl', 'tr'];
function includeArtwork(file, project, corner) {
  if (!file || !/\.(png|jpe?g|webp)$/i.test(file)) return;
  const clean = file.replace(/^\.\//, '');
  if (clean.includes('..') || !clean.startsWith('assets/')) throw Error('Invalid artwork path');
  if (!watermarkFiles[clean]) watermarkFiles[clean] = {project, corner};
}
for (const project of all) {
  if (/chilika/i.test(project.slug)) continue;
  const frames = [...(project.lead ? [project.lead] : []), ...(project.images || [])];
  frames.forEach((frame, index) => {
    const corner = watermarkCorners[index % watermarkCorners.length];
    includeArtwork(frame.src, project.slug, corner);
    includeArtwork(frame.full, project.slug, corner);
  });
  includeArtwork('assets/' + project.cover, project.slug, 'br');
}
// Include only images already referenced by generated pages or the existing hero.
for (const filename of ['index.html','work-together.html', ...all.map(d => 'projects/' + d.slug + '.html')]) {
  if (/chilika/i.test(filename)) continue;
  const html = fs.readFileSync(path.join(OUT, filename), 'utf8');
  const refs = [...html.matchAll(/(?:src|href|content)="([^"]+\.(?:png|jpe?g|webp))"/gi)];
  for (const match of refs) {
    let file = match[1].replace(SITE + '/', '').replace('https://mariiaandriiuk.netlify.app/', '').replace(/^\.\.\//, '');
    if (/portrait|chilika/i.test(file)) continue;
    includeArtwork(file, 'published-page', 'br');
  }
}
const heroFrames = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/hero-frames.json'), 'utf8'));
heroFrames.forEach((frame, i) => {
  if (!/chilika/i.test(frame.slug || frame.src)) includeArtwork(frame.src, frame.slug || 'hero', watermarkCorners[i % 4]);
});
require('child_process').execFileSync('python3', ['-c', "import base64,io,json,sys,tempfile,subprocess,os\ntry:\n from PIL import Image,ImageDraw,ImageFont,ImageStat,ImageFilter\nexcept ImportError:\n deps=tempfile.mkdtemp(prefix='portfolio-pillow-')\n subprocess.run([sys.executable,'-m','pip','install','--disable-pip-version-check','--no-input','--target',deps,'Pillow==12.0.0'],check=True)\n sys.path.insert(0,deps)\n from PIL import Image,ImageDraw,ImageFont,ImageStat,ImageFilter\nfrom pathlib import Path\nroot=Path(sys.argv[1]); manifest=json.loads(sys.argv[2]);font_bytes=base64.b64decode(sys.argv[3])\nreport=[]\ndef render(item):\n rel,settings=item\n p=root/rel\n if not p.is_file(): raise FileNotFoundError(rel)\n with Image.open(p) as src:\n  fmt=src.format;icc=src.info.get('icc_profile');im=src.convert('RGBA')\n w,h=im.size\n size=max(10,round(w*.027));font=ImageFont.truetype(io.BytesIO(font_bytes),size)\n text='meryemstudio.com';probe=ImageDraw.Draw(im);box=probe.textbbox((0,0),text,font=font)\n tw=box[2]-box[0];th=box[3]-box[1]\n pad_x=round(w*.04);pad_y=round(h*.05)\n corner=settings['corner']\n x=pad_x if corner in ['tl','bl'] else w-pad_x-tw\n y=pad_y if corner in ['tl','tr'] else h-pad_y-th\n # Keep the chosen corner, but avoid existing board titles and fine captions.\n candidates=[round(h*f) for f in ([.012,.025,.04,.06,.085,.11] if corner in ['tl','tr'] else [.85,.88,.91,.94,.965])]\n def busyness(top):\n  patch=im.crop((x,top,x+tw,top+th)).convert('L')\n  return ImageStat.Stat(patch.filter(ImageFilter.FIND_EDGES)).mean[0]\n y=min(candidates,key=busyness)\n # Use the approved white mark on dark corners, quiet dark ink on pale corners.\n crop=im.crop((x,y,x+tw,y+th)).convert('L')\n lum=ImageStat.Stat(crop).mean[0]\n ink=(255,255,255,100) if lum<155 else (35,31,29,100)\n shadow=(0,0,0,35) if lum<155 else (255,255,255,25)\n overlay=Image.new('RGBA',im.size);draw=ImageDraw.Draw(overlay)\n draw.text((x+1,y+2-box[1]),text,font=font,fill=shadow)\n draw.text((x,y-box[1]),text,font=font,fill=ink)\n out=Image.alpha_composite(im,overlay)\n opts={}\n if icc:opts['icc_profile']=icc\n if fmt in ['JPEG','WEBP']:\n  out=out.convert('RGB');opts.update(quality=95)\n  if fmt=='JPEG':opts['subsampling']=0\n if fmt=='PNG': opts['compress_level']=1\n out.save(p,format=fmt,**opts)\n return {'path':rel,'corner':corner,'size':[w,h],'tone':'light' if lum<155 else 'dark','project':settings['project']}\nfrom concurrent.futures import ThreadPoolExecutor\nwith ThreadPoolExecutor(max_workers=4) as pool:\n report=list(pool.map(render,sorted(manifest.items())))\nprint('Watermarked',len(report),'published artwork image files; source assets preserved.')\n# Verification manifest is build output, not a public site resource.\nif os.environ.get('WATERMARK_QA_REPORT'):\n Path(os.environ['WATERMARK_QA_REPORT']).write_text(json.dumps(report,indent=2))\n", OUT, JSON.stringify(watermarkFiles), "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"], {stdio: 'inherit', maxBuffer: 1024 * 1024 * 4});
