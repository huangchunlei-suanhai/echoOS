import { readdir, readFile, mkdir, writeFile, copyFile } from 'node:fs/promises';
import { dirname, relative, resolve, basename, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'source/9.30');
const destination = resolve(root, 'public/assets/pages');
const catalogFile = resolve(root, 'source/catalog.json');
let catalog = { pages: [], verifiedComplete: false };
try {
  catalog = JSON.parse(await readFile(catalogFile, 'utf8'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
if (!Array.isArray(catalog.pages)) throw new Error('catalog.pages 必须是数组');
const settings = new Map(catalog.pages.map(page => [page.file, page]));

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (entry.isFile() && /\.png$/i.test(entry.name)) files.push(path);
  }
  return files;
}

await mkdir(source, { recursive: true });
await mkdir(destination, { recursive: true });
const files = (await walk(source)).sort((a, b) => a.localeCompare(b, 'zh-CN', { numeric: true }));
const sourceFiles = new Set(files.map(file => relative(source, file).split(sep).join('/')));
for (const page of catalog.pages) {
  if (!sourceFiles.has(page.file)) throw new Error(`清单中的文件不存在：${page.file}`);
}
if (catalog.verifiedComplete && (files.length === 0 || catalog.pages.length !== files.length)) {
  throw new Error('声明完整收录前，必须逐一登记全部 PNG 并核对 Figma 顶层页面');
}
const pages = [];
const ids = new Set();
for (const file of files) {
  const relativeFile = relative(source, file).split(sep).join('/');
  const setting = settings.get(relativeFile) ?? {};
  const bytes = await readFile(file);
  const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 16);
  const id = setting.id ?? createHash('sha256').update(relativeFile).digest('hex').slice(0, 12);
  if (typeof id !== 'string' || !id || ids.has(id)) throw new Error(`页面 ID 无效或重复：${relativeFile}`);
  ids.add(id);
  const metadata = await sharp(bytes).metadata();
  await copyFile(file, resolve(destination, `${hash}.png`));
  const isLong = metadata.height > metadata.width * 1.5;
  const previewSize = isLong
    ? { width: 840, height: 560, fit: 'cover', position: 'top', withoutEnlargement: true }
    : { width: 840, withoutEnlargement: true };
  await sharp(bytes).resize(previewSize).webp({ quality: 82 }).toFile(resolve(destination, `${hash}-thumb.webp`));
  const folder = relativeFile.includes('/') ? relativeFile.split('/')[0] : '全部页面';
  pages.push({
    id, title: setting.title ?? basename(file, extname(file)),
    category: setting.category ?? folder,
    description: setting.description ?? '',
    nodeId: setting.nodeId ?? null,
    order: setting.order ?? pages.length,
    width: metadata.width, height: metadata.height,
    image: `assets/pages/${hash}.png`, thumbnail: `assets/pages/${hash}-thumb.webp`,
    sourceFile: relativeFile,
  });
}
pages.sort((a, b) => a.order - b.order);
await writeFile(resolve(root, 'public/pages.json'), JSON.stringify({
  version: '9.30', verifiedComplete: catalog.verifiedComplete === true,
  source: 'https://www.figma.com/design/rK2pzdICRD9Drw7uUhy2Ne/?node-id=399-5081', pages,
}, null, 2) + '\n');
console.log(`已导入 ${pages.length} 个页面。完整性核对：${catalog.verifiedComplete ? '已完成' : '待核对'}。`);
