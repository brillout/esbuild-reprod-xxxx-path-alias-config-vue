import esbuild from 'esbuild'

build()

function build() {
  return esbuild.build({
    entryPoints: ['./src/entry.js'],
    outdir: './dist/',
    format: 'esm',
    target: 'es2020',
    bundle: true,
    // Doesn't make a difference
    resolveExtensions: ['.vue'],
    plugins: [
      {
        name: 'externalize',
        setup(build) {
          build.onResolve({filter: /.*/}, async (args) => {
            if (args.kind !== 'import-statement') return;

            // Avoid infinite loop: https://github.com/evanw/esbuild/issues/3095#issuecomment-1546916366
            const useEsbuildResolver = 'useEsbuildResolver';
            if (args.pluginData?.[useEsbuildResolver]) return;
            const {path, ...opts} = args;
            opts.pluginData = {[useEsbuildResolver]: true};

            const resolved = await build.resolve(path, opts);
            if (resolved.errors.length > 0) {
              return resolved;
            }

            console.log();
            console.log('args', args);
            console.log('resolved', resolved);
            return {external: true, path: resolved.path};
          });
        }
      }
    ]
  })
}
