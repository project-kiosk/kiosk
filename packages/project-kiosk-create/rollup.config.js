import { defineConfig } from "rollup";
import esbuild from "rollup-plugin-esbuild";
import pkg from "./package.json" assert { type: "json" };

/** @var {import("rollup").OutputOptions} */
const output = {
  entryFileNames: "[name].[format].js",
  dir: "dist/",
  strict: true,
  sourcemap: true,
  compact: true,
};

export default defineConfig({
  input: "src/index.ts",
  output: [
    {
      ...output,
      format: "umd",
      name: pkg.name,
    },
    {
      ...output,
      format: "es",
    },
  ],
  plugins: [
    esbuild({
      minify: true,
      target: "es2017",

      loaders: {
        // require @rollup/plugin-commonjs
        ".json": "json",
      },
    }),
  ],
});
