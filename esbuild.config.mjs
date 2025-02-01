import * as esbuild from "esbuild";

const ctx = await esbuild.context({
    entryPoints: ["./src/main.js"],
    bundle: true,
    outdir: "dist",
    minify: true,
    sourcemap: true,
    platform: "node",
    target: ["node23.13"],
    tsconfig: "tsconfig.json"
});

if (process.argv.includes("--serve")) {
    try {
        const { host, port } = await ctx.serve();
        console.log(`serving on... http://${host || "localhost"}:${port}`);
    } catch (err) {
      console.log("Error at starting Server!", err);
      process.exit(1);
    }
} else {
    await ctx.rebuild();
    console.log("compiling completed!");
    await ctx.dispose();
}

const cleanup = async () => {
    console.log("cleaning up!");
    await ctx.dispose();
    process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
