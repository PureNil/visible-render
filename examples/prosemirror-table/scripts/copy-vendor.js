const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 定义需要复制的 ProseMirror 包
const prosemirrorPackages = [
  'prosemirror-view',
  'prosemirror-state',
  'prosemirror-model',
  'prosemirror-transform',
  'prosemirror-tables',
  'prosemirror-keymap',
  'prosemirror-schema-basic',
  'prosemirror-schema-list',
  'prosemirror-example-setup',
  'prosemirror-history',
  'prosemirror-commands',
  'prosemirror-dropcursor',
  'prosemirror-gapcursor',
  'prosemirror-inputrules',
  'prosemirror-menu'
];

// 定义源目录和目标目录
const sourceDirs = {};
const targetDirs = {};

prosemirrorPackages.forEach(pkg => {
  sourceDirs[pkg] = {
    src: path.join(__dirname, '../node_modules', pkg, 'src'),
    dist: path.join(__dirname, '../node_modules', pkg, 'dist')
  };
  
  targetDirs[pkg] = {
    src: path.join(__dirname, '../src', pkg, 'src'),
    dist: path.join(__dirname, '../src', pkg, 'dist')
  };
});

// 复制目录的函数
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`源目录不存在: ${src}`);
    return;
  }

  // 确保目标目录存在
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // 复制所有文件
  const files = fs.readdirSync(src);
  for (const file of files) {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 克隆 prosemirror-tables 源码
function cloneProsemirrorTables() {
  const tempDir = path.join(__dirname, '../temp');
  const tablesDir = path.join(tempDir, 'prosemirror-tables');
  
  // 创建临时目录
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }
  
  // 如果目录已存在，先删除
  if (fs.existsSync(tablesDir)) {
    fs.rmSync(tablesDir, { recursive: true, force: true });
  }
  
  console.log('正在克隆 prosemirror-tables 源码...');
  execSync('git clone https://github.com/ProseMirror/prosemirror-tables.git', { cwd: tempDir });
  
  // 复制源码到目标目录
  const srcDir = path.join(tablesDir, 'src');
  if (fs.existsSync(srcDir)) {
    console.log(`复制源码从 ${srcDir} 到 ${targetDirs['prosemirror-tables'].src}`);
    copyDir(srcDir, targetDirs['prosemirror-tables'].src);
  }
  
  // 清理临时目录
  fs.rmSync(tempDir, { recursive: true, force: true });
}

// 复制每个包的文件
for (const pkg of prosemirrorPackages) {
  console.log(`正在复制 ${pkg}...`);
  
  // 复制源码（如果存在）
  if (sourceDirs[pkg].src) {
    console.log(`复制源码从 ${sourceDirs[pkg].src} 到 ${targetDirs[pkg].src}`);
    copyDir(sourceDirs[pkg].src, targetDirs[pkg].src);
  }
  
  // 复制编译后的文件
  console.log(`复制编译文件从 ${sourceDirs[pkg].dist} 到 ${targetDirs[pkg].dist}`);
  copyDir(sourceDirs[pkg].dist, targetDirs[pkg].dist);
}

// 克隆并复制 prosemirror-tables 源码
// cloneProsemirrorTables();

console.log('复制完成！'); 