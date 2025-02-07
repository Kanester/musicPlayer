import * as esbuild from 'esbuild';
import { copy } from 'esbuild-plugin-copy';
import { sassPlugin } from 'esbuild-sass-plugin';
import * as minifier from 'html-minifier-terser';
import fs from 'fs/promises';
import path from 'path';
import fg from 'fast-glob';

//minifying html
await Promise.all(
  (await fg('src/**/*.html')).map(async file => {
    await fs.mkdir(
      path.dirname(path.join('./dist', path.relative('src', file))),
      { recursive: true }
    );
    await fs.writeFile(
      path.join('./dist', path.relative('src', file)),
      await minifier.minify(await fs.readFile(file, 'utf8'), {
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true
      })
    );
  })
);

//minifying css and js
const entrypoints = await fg([
  'src/**/*.js',
  'src/**/*.ts',
  'src/**/*.css',
  'src/**/*.scss'
]);

esbuild.build({
  entryPoints: entrypoints,
  bundle: true,
  outdir: './dist',
  minify: true,
  plugins: [
    sassPlugin(),
    copy({
      assets: {
        from: (await fg('src/**/*')).filter(
          f =>
            !['.html', '.js', '.ts', '.css', '.scss'].some(ext =>
              f.endsWith(ext)
            )
        ),
        to: './dist'
      }
    })
  ]
});
