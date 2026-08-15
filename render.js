const fs = require('fs');
const path = require('path');
const Twig = require('twig');

const outDir = path.join(__dirname, 'dist');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

const templatesDir = path.join(__dirname, 'templates');

const shop = { name: 'متجري التجريبي' };
const products = [
  { slug: 'prod-1', title: 'منتج 1', price: '10.00' },
  { slug: 'prod-2', title: 'منتج 2', price: '20.00' }
];

const tplPath = path.join(templatesDir, 'index.twig');
const tplSrc = fs.readFileSync(tplPath, 'utf8');

Twig.renderFile(tplPath, { shop, products }, (err, html) => {
  if (err) { console.error(err); process.exit(1); }
  html = html.replace(/href=\"\/assets/g, 'href="assets').replace(/src=\"\/assets/g, 'src="assets');
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
  // copy assets
  const assetSrc = path.join(__dirname, 'assets');
  const copyRecursiveSync = (src, dest) => {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    if (exists && stats.isDirectory()) {
      if (!fs.existsSync(dest)) fs.mkdirSync(dest);
      fs.readdirSync(src).forEach(child => copyRecursiveSync(path.join(src, child), path.join(dest, child)));
    } else if (exists) {
      try { fs.copyFileSync(src, dest); }
      catch (error) {
        if (error.code !== 'EBUSY') throw error;
        console.warn(`Skipped locked preview asset: ${path.basename(dest)}`);
      }
    }
  };
  copyRecursiveSync(assetSrc, path.join(outDir, 'assets'));
  console.log('Built preview → dist/index.html');
});
