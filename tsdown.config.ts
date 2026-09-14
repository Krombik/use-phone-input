import { defineConfig } from 'tsdown';
import fs from 'fs/promises';
import { join, relative } from 'path';

const outDir = 'build';

const _filesToCopy = ['LICENSE', 'README.md'];

const _pickFrom = (obj: Record<string, any>, keys: string[]) =>
  keys.reduce<Record<string, any>>(
    (acc, key) => (obj[key] != null ? { ...acc, [key]: obj[key] } : acc),
    {}
  );

const _toRoot = (path: string) => `./${path}`;

const _getIndexFile = (path: string, ext: string) =>
  _toRoot(join(path, `./index.${ext}`));

type _Module = { types: string; default: string };

type _Export = { require: _Module; import: _Module };

type _Exports = Record<string, _Export>;

const _getExport = (path: string): _Exports => ({
  [path]: {
    require: {
      types: _getIndexFile(path, 'd.cts'),
      default: _getIndexFile(path, 'cjs'),
    },
    import: {
      types: _getIndexFile(path, 'd.ts'),
      default: _getIndexFile(path, 'js'),
    },
  },
});

const _getExports = async (path: string, obj: _Exports) => {
  const dirs = await fs.readdir(path);

  for (let i = 0; i < dirs.length; i++) {
    const folderPath = `${path}/${dirs[i]}`;

    if ((await fs.lstat(folderPath)).isDirectory()) {
      obj = {
        ...obj,
        ..._getExport(_toRoot(relative(outDir, folderPath))),
        ...(await _getExports(folderPath, obj)),
      };
    }
  }

  return obj;
};

export default defineConfig({
  entry: ['src/index.ts', 'src/!(types)/**/*.ts'],
  format: ['esm', 'cjs'],
  outDir,
  clean: true,
  sourcemap: true,
  platform: 'browser',
  target: 'es2020',
  external: ['react'],
  treeshake: true,
  dts: true,
  // every export is a default export, so the `.cjs` outputs have to keep
  // `exports.default` rather than collapsing to `module.exports`
  cjsDefault: false,
  // We generate package.json (and its exports) ourselves in build:done.
  exports: false,
  hooks: {
    async 'build:done'() {
      await fs.writeFile(
        `${outDir}/package.json`,
        JSON.stringify(
          {
            ..._pickFrom(
              JSON.parse((await fs.readFile('package.json')).toString()),
              [
                'name',
                'version',
                'author',
                'description',
                'keywords',
                'repository',
                'license',
                'bugs',
                'homepage',
                // `type: "module"` is required so Node treats the `.js` outputs
                // as ESM (`.cjs` stays CJS); without it native Node ESM loads
                // them as CommonJS and throws on the import/export syntax.
                'type',
                'peerDependencies',
                'peerDependenciesMeta',
                'dependencies',
                'engines',
              ]
            ),
            publishConfig: { access: 'public' },
            main: _getIndexFile('./', 'cjs'),
            module: _getIndexFile('./', 'js'),
            types: _getIndexFile('./', 'd.ts'),
            exports: {
              './package.json': './package.json',
              ...(await _getExports(outDir, _getExport('.'))),
            },
            sideEffects: false,
          },
          undefined,
          2
        )
      );

      for (let i = 0; i < _filesToCopy.length; i++) {
        await fs.copyFile(_filesToCopy[i], `${outDir}/${_filesToCopy[i]}`);
      }
    },
  },
});
