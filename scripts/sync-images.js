import { promises as fs } from 'fs';
import path from 'path';

async function copyDirectory(sourceDir, targetDir) {
  await fs.mkdir(targetDir, { recursive: true });
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath);
    } else if (entry.isFile()) {
      await fs.copyFile(sourcePath, targetPath);
    }
  }
}

async function main() {
  const repoRoot = path.resolve(process.cwd(), '..');
  const source = path.join(repoRoot, 'images');
  const target = path.resolve(process.cwd(), 'public', 'images');
  try {
    // If source doesn't exist, skip silently
    try {
      await fs.access(source);
      await copyDirectory(source, target);
      // eslint-disable-next-line no-console
      console.log(`[sync-images] Copied images from ${source} to ${target}`);
    } catch {
      // eslint-disable-next-line no-console
      console.log(`[sync-images] Source not found, skip: ${source}`);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[sync-images] Failed to copy images:', error);
    process.exit(1);
  }
}

await main();


