import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const distIndexPath = join(process.cwd(), "dist", "public", "index.html");
const dist404Path = join(process.cwd(), "dist", "public", "404.html");
const indexHtml = await readFile(distIndexPath, "utf8");
const base = "/english-academy/";
const redirectScript = `<script>(function(){try{var k="english-academy-spa-redirect";var p=window.location.pathname+window.location.search+window.location.hash;sessionStorage.setItem(k,p);window.location.replace(${JSON.stringify(base)});}catch(e){window.location.replace(${JSON.stringify(base)});}})();</script>`;
const fallbackHtml = indexHtml.replace("</head>", `${redirectScript}</head>`);
await mkdir(dirname(dist404Path), { recursive: true });
await writeFile(dist404Path, fallbackHtml, "utf8");
console.log(`Generated ${dist404Path}`);
