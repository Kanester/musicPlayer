import * as esbuild from "esbuild";
import { copy } from "esbuild-plugin-copy";
import * as minifier from "html-minifier-terser";
import fs from "fs/promises";
import fg from "fast-glob";
import path from "path";

const outputDir = "./dist";

await Promise.all(
    (await fg("src/**/*.html")).map(async file => {
        const outFile = path.join(outputDir, path.relative("src", file));
        await fs.mkdir(path.dirname(outFile), { recursive: true });
        await fs.writeFile(
            outFile,
            await minifier.minify(await fs.readFile(file, "utf8"), {
                collapseWhitespace: true,
                removeComments: true,
                minifyCSS: true,
                minifyJS: true
            })
        );
    })
);

const ctx = await esbuild.context({
    entryPoints: ["src/main.js"],
    bundle: true,
    outdir: outputDir,
    minify: true,
    plugins: [
        copy({
            assets: {
                from: (await fg("src/**/*")).filter(f => !f.endsWith(".html")),
                to: ["./"]
            },
            watch: true
        })
    ]
});

process.argv.includes("--serve")
    ? ctx
          .serve({ servedir: outputDir })
          .then(({ host, port }) =>
              console.log(`🚀 Serving at http://${host || "localhost"}:${port}`)
          )
    : (await ctx.rebuild(),
      console.log("✅ Build complete!"),
      await ctx.dispose());

process.on(
    "SIGINT",
    async () => (
        await ctx.dispose(), console.log("\n🧹 Cleanup done!"), process.exit(0)
    )
);
