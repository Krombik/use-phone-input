import { build } from 'tsup';
import ts from 'typescript';
import fs from 'fs/promises';
import { FILES_TO_COPY } from './constants.mjs';
import {
  addNestedPackagesJson,
  getMainPackageJson,
  handleChild,
} from './utils.mjs';
import Path from 'path';

const run = async (outDir: string) => {
  await fs.rm(outDir, { recursive: true, force: true });

  if (
    ts
      .createProgram(['src/index.ts'], {
        emitDeclarationOnly: true,
        declaration: true,
        stripInternal: true,
        strictNullChecks: true,
        outDir,
      })
      .emit().emitSkipped
  ) {
    throw new Error('TypeScript compilation failed');
  }

  const children = await fs.readdir(outDir);

  for (let i = 0; i < children.length; i++) {
    const file = children[i];

    const path = `${outDir}/${file}`;

    await handleChild(path);
  }

  await addNestedPackagesJson(outDir);

  const dynamicImportsRecord = {} as Record<string, string>;

  const dynamicImportRegExp = /\bimport\(`(.*)`\)/;

  const dynamicImportFiles: string[] = [];

  await build({
    outDir,
    minify: false,
    entry: ['src/index.ts', `src/!(utils|types)/**/*.ts`],
    splitting: true,
    sourcemap: true,
    clean: false,
    target: 'es2020',
    treeshake: { preset: 'smallest' },
    dts: false,
    format: ['cjs', 'esm'],
    platform: 'browser',
    external: ['react'],
    esbuildOptions: (options) => {
      options.chunkNames = '_chunks/[ext]/[name]-[hash]';
    },
    esbuildPlugins: [
      {
        name: 'dynamic-import',
        setup(build) {
          build.onLoad({ filter: /\.ts$/ }, async ({ path }) => {
            const exec = dynamicImportRegExp.exec(
              await fs.readFile(path, 'utf8')
            );

            if (exec) {
              const item = exec[1];

              dynamicImportsRecord[item] = Path.relative(
                'src',
                Path.resolve(Path.dirname(path), Path.dirname(item))
              );
            }

            return null;
          });

          build.onEnd(({ outputFiles }) => {
            if (outputFiles) {
              for (let i = 0; i < outputFiles.length; i++) {
                const file = outputFiles[i];

                const { path } = file;

                if (!path.endsWith('.map')) {
                  const { text } = file;

                  const exec = dynamicImportRegExp.test(text);

                  if (exec) {
                    dynamicImportFiles.push(path);
                  }
                }
              }
            }
          });
        },
      },
    ],
  });

  for (let i = 0; i < dynamicImportFiles.length; i++) {
    const item = dynamicImportFiles[i];

    const file = await fs.readFile(item, 'utf8');

    const exec = dynamicImportRegExp.exec(file)!;

    await fs.writeFile(
      item,
      `${file.slice(0, exec.index)}import(\`${Path.relative(
        Path.dirname(item),
        `${outDir}/${dynamicImportsRecord[exec[1]]}`
      )}/${Path.basename(exec[1])}/index${Path.extname(item)}\`)${file.slice(
        exec.index + exec[0].length
      )}`
    );
  }

  await fs.writeFile(`${outDir}/package.json`, await getMainPackageJson());

  for (let i = 0; i < FILES_TO_COPY.length; i++) {
    const fileName = FILES_TO_COPY[i];

    await fs.copyFile(fileName, `${outDir}/${fileName}`);
  }
};

run('build');
