#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建输出目录（如果不存在）
const outputDir = path.join(__dirname, '../dist');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// 生成带日期和序号的文件名
const now = new Date();
const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
let seq = 1;

// 检查已有文件并确定序号
const files = fs.readdirSync(outputDir).filter(file => 
  file.startsWith('adarkroom-' + dateStr) && file.endsWith('.zip')
);

if (files.length > 0) {
  // 提取已有文件的最大序号
  const maxSeq = Math.max(...files.map(file => {
    const match = file.match(/adarkroom-\d{8}(\d{2})\.zip/);
    return match ? parseInt(match[1], 10) : 0;
  }));
  seq = maxSeq + 1;
}

const seqStr = seq.toString().padStart(2, '0');
const zipName = `adarkroom-${dateStr}${seqStr}.zip`;

// 创建一个文件来写入
const output = fs.createWriteStream(path.join(outputDir, zipName));
const archive = archiver('zip', {
  zlib: { level: 9 } // 设置压缩级别
});

// 监听错误和完成事件
output.on('close', () => {
  console.log(`打包完成！总大小: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
});

archive.on('error', (err) => {
  throw err;
});

// 将输出流管道连接到文件
archive.pipe(output);

// 要打包的目录和文件列表
const filesToAdd = [
  { source: 'index.html', name: 'index.html' },
  { source: 'browserWarning.html', name: 'browserWarning.html' },
  { source: 'mobileWarning.html', name: 'mobileWarning.html' },
  { source: 'favicon.ico', name: 'favicon.ico' },
  { dir: 'css', name: 'css' },
  { dir: 'script', name: 'script' },
  { dir: 'img', name: 'img' },
  { dir: 'lib', name: 'lib' },
  { dir: 'lang', name: 'lang' },
  { dir: 'audio', name: 'audio' }
];

// 添加文件和目录到压缩包
filesToAdd.forEach(item => {
  if (item.dir) {
    archive.directory(item.dir, item.name);
  } else {
    archive.file(item.source, { name: item.name });
  }
});

// 完成归档
archive.finalize();