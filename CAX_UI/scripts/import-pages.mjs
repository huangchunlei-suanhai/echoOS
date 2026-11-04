import { readdir, readFile, mkdir, writeFile, copyFile } from 'node:fs/promises';
import { dirname, relative, resolve, basename, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const destination = resolve(root, 'public/assets/pages');
const editions = [
  {
    id: '9.30', label: '9.30', folder: '9.30', catalog: 'catalog.json',
    source: 'https://www.figma.com/design/rK2pzdICRD9Drw7uUhy2Ne/?node-id=399-5081',
    allowPending: false,
  },
  {
    id: 'new', label: '新版', folder: 'new', catalog: 'catalog-new.json',
    source: 'https://www.figma.com/design/rK2pzdICRD9Drw7uUhy2Ne/?node-id=605-5195',
    allowPending: true,
  },
];

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

await mkdir(destination, { recursive: true });
const pages = [];
const versions = [];
const ids = new Set();

for (const edition of editions) {
  const source = resolve(root, 'source', edition.folder);
  const catalog = JSON.parse(await readFile(resolve(root, 'source', edition.catalog), 'utf8'));
  if (!Array.isArray(catalog.pages)) throw new Error(`${edition.catalog}: pages 必须是数组`);
  await mkdir(source, { recursive: true });
  const files = (await walk(source)).sort((a, b) => a.localeCompare(b, 'zh-CN', { numeric: true }));
  const sourceFiles = new Map(files.map(file => [relative(source, file).split(sep).join('/'), file]));
  const listed = new Set();
  for (const entry of catalog.pages) {
    if (!entry.file || listed.has(entry.file)) throw new Error(`${edition.catalog}: 文件名缺失或重复：${entry.file}`);
    listed.add(entry.file);
    if (!sourceFiles.has(entry.file) && (!edition.allowPending || catalog.verifiedComplete)) {
      throw new Error(`清单中的文件不存在：${edition.folder}/${entry.file}`);
    }
  }
  if (catalog.verifiedComplete && (files.length === 0 || catalog.pages.length !== files.length)) {
    throw new Error(`${edition.label}: 声明完整收录前，必须逐一登记全部 PNG`);
  }

  const entries = [
    ...catalog.pages,
    ...[...sourceFiles.keys()].filter(file => !listed.has(file)).map(file => ({ file })),
  ];
  for (const [index, setting] of entries.entries()) {
    const file = sourceFiles.get(setting.file);
    const id = setting.id ?? createHash('sha256').update(`${edition.id}/${setting.file}`).digest('hex').slice(0, 12);
    if (typeof id !== 'string' || !id || ids.has(id)) throw new Error(`页面 ID 无效或重复：${edition.folder}/${setting.file}`);
    ids.add(id);
    const folder = setting.file.includes('/') ? setting.file.split('/')[0] : '全部页面';
    const page = {
      id, title: setting.title ?? basename(setting.file, extname(setting.file)),
      category: setting.category ?? folder,
      description: setting.description ?? '',
      version: edition.id,
      source: setting.nodeId
        ? `https://www.figma.com/design/rK2pzdICRD9Drw7uUhy2Ne/?node-id=${setting.nodeId.replace(':', '-')}`
        : edition.source,
      nodeId: setting.nodeId ?? null,
      order: setting.order ?? index + 1,
      sourceFile: `${edition.folder}/${setting.file}`,
      pending: !file,
    };
    if (file) {
      const bytes = await readFile(file);
      const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 16);
      const metadata = await sharp(bytes).metadata();
      await copyFile(file, resolve(destination, `${hash}.png`));
      const isLong = metadata.height > metadata.width * 1.5;
      const previewSize = isLong
        ? { width: 840, height: 560, fit: 'cover', position: 'top', withoutEnlargement: true }
        : { width: 840, withoutEnlargement: true };
      await sharp(bytes).resize(previewSize).webp({ quality: 82 }).toFile(resolve(destination, `${hash}-thumb.webp`));
      Object.assign(page, {
        width: metadata.width, height: metadata.height,
        image: `assets/pages/${hash}.png`, thumbnail: `assets/pages/${hash}-thumb.webp`,
      });
    }
    pages.push(page);
  }
  versions.push({
    id: edition.id, label: edition.label, source: edition.source,
    count: entries.length, readyCount: files.length,
    verifiedComplete: catalog.verifiedComplete === true,
  });
}

pages.sort((a, b) => editions.findIndex(item => item.id === a.version) - editions.findIndex(item => item.id === b.version) || a.order - b.order);
await writeFile(resolve(root, 'public/pages.json'), JSON.stringify({
  versions, verifiedComplete: versions.every(version => version.verifiedComplete), pages,
}, null, 2) + '\n');
console.log(`已登记 ${pages.length} 个页面，其中 ${pages.filter(page => !page.pending).length} 张原稿已导入。`);
