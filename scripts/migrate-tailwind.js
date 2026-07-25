// migrate-tailwind.js
// Simple script to replace Stitch-specific utility classes with Tailwind v4 equivalents
// Run with: node migrate-tailwind.js
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, 'src');

const mappings = {
  // spacing utilities
  'gap-xs': 'gap-1',
  'gap-sm': 'gap-2',
  'gap-md': 'gap-4',
  'gap-lg': 'gap-6',
  'space-y-xs': 'space-y-1',
  'space-y-sm': 'space-y-2',
  'space-y-md': 'space-y-4',
  'px-xs': 'px-2',
  'px-sm': 'px-3',
  'px-md': 'px-4',
  'px-lg': 'px-6',
  'px-xl': 'px-8',
  'py-xs': 'py-2',
  'py-sm': 'py-2',
  'py-md': 'py-4',
  'py-lg': 'py-6',
  'mb-xs': 'mb-1',
  'mb-sm': 'mb-2',
  'mb-md': 'mb-4',
  'mb-lg': 'mb-6',
  'mb-xl': 'mb-8',
  // font and text utilities – fallback to closest Tailwind default
  'font-body-xs': 'font-light',
  'font-body-sm': 'font-normal',
  'font-body-md': 'font-medium',
  'font-body-lg': 'font-bold',
  'font-title-sm': 'font-semibold',
  'font-title-md': 'font-bold',
  'font-headline-sm': 'font-bold',
  'font-headline-md': 'font-extrabold',
  'font-display-lg': 'font-black',
  'text-body-xs': 'text-xs',
  'text-body-sm': 'text-sm',
  'text-body-md': 'text-base',
  'text-title-sm': 'text-sm',
  'text-title-md': 'text-base',
  'text-headline-sm': 'text-lg',
  'text-headline-md': 'text-xl',
  'text-display-lg': 'text-2xl',
};

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  const unknownClasses = new Set();
  for (const [oldClass, newClass] of Object.entries(mappings)) {
    const regex = new RegExp(`\\b${oldClass}\\b`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, newClass);
    }
  }
  // Find any remaining Stitch classes that are not in the mapping
  const stitchPattern = /\b(gap-(xs|sm|md|lg)|space-y-(xs|sm|md)|px-(xs|sm|md|lg|xl)|py-(xs|sm|md|lg)|mb-(xs|sm|md|lg|xl)|font-[a-z-]+|text-[a-z-]+)\b/g;
  let match;
  while ((match = stitchPattern.exec(content)) !== null) {
    unknownClasses.add(match[0]);
  }
  if (unknownClasses.size > 0) {
    const customPath = path.join(__dirname, 'src', 'custom-utilities.css');
    let customContent = '';
    if (fs.existsSync(customPath)) {
      customContent = fs.readFileSync(customPath, 'utf8');
    }
    unknownClasses.forEach(cls => {
      if (!customContent.includes(`.${cls}`)) {
        customContent += `\n.${cls} { /* placeholder – adjust as needed */ }`;
      }
    });
    fs.writeFileSync(customPath, customContent, 'utf8');
  }
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // skip node_modules and dist
      if (['node_modules', 'dist', '.git'].includes(entry.name)) continue;
      walk(fullPath);
    } else if (entry.isFile()) {
      if (['.js', '.jsx', '.ts', '.tsx', '.html', '.css'].some(ext => entry.name.endsWith(ext))) {
        replaceInFile(fullPath);
      }
    }
  }
}

walk(rootDir);
console.log('Migration complete.');
