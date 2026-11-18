import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }

          // Inject built hashed JS/CSS asset URLs into dist/sw.js for full offline precaching
          const distSwPath = path.resolve(distDir, 'sw.js');
          const distBundleAssets = path.resolve(distDir, 'assets');
          if (fs.existsSync(distSwPath) && fs.existsSync(distBundleAssets)) {
            const extraAssets = fs
              .readdirSync(distBundleAssets)
              .filter((name) => /\.(js|css|svg|png|woff2?)$/i.test(name))
              .map((name) => `/assets/${name}`);

            if (extraAssets.length > 0) {
              let swContent = fs.readFileSync(distSwPath, 'utf8');
              const buildStamp = `v1-${Date.now()}`;
              swContent = swContent.replace(
                "const CACHE_VERSION = 'v1';",
                `const CACHE_VERSION = '${buildStamp}';`
              );
              const injectedEntries = extraAssets
                .map((assetPath) => `  '${assetPath}',`)
                .join('\n');
              swContent = swContent.replace(
                'const PRECACHE_URLS = [',
                `const PRECACHE_URLS = [\n${injectedEntries}`
              );
              fs.writeFileSync(distSwPath, swContent, 'utf8');
            }
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
