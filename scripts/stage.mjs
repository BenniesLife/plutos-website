import { cp, mkdir, rm } from "node:fs/promises";
const output = new URL("../_site/", import.meta.url);
await rm(output, { recursive: true, force: true });
await mkdir(output);
// Only website files are published; tooling, tests and documentation stay in GitHub.
// Keep the old image URLs working for existing links and cached versions of the page.
for (const file of [
  "index.html",
  "styles.css",
  "script.js",
  "assets",
  "CNAME",
  ".nojekyll",
  "logo.jpg",
  "tiaan-rotm.jpg",
  "paws-rotm.jpg",
  "robots.txt",
  "sitemap.xml",
]) {
  await cp(new URL(`../${file}`, import.meta.url), new URL(file, output), {
    recursive: true,
  });
}
