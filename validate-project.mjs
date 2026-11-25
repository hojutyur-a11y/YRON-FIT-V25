import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();
const fail = (message) => { console.error(`FAIL: ${message}`); process.exitCode = 1; };
const pass = (message) => console.log(`PASS: ${message}`);

const indexPath = path.join(root, "index.html");
const sourcePath = path.join(root, "VYRON_FIT_V25.html");
if (!fs.existsSync(indexPath) || !fs.existsSync(sourcePath)) {
  fail("index.html or VYRON_FIT_V25.html is missing");
} else {
  const index = fs.readFileSync(indexPath, "utf8");
  const source = fs.readFileSync(sourcePath, "utf8");
  if (index !== source) fail("index.html differs from VYRON_FIT_V25.html");
  else pass("index.html matches the preserved V25 application");
  if (!/<html[^>]+lang=["']ar["'][^>]*dir=["']rtl["']|<html[^>]+dir=["']rtl["'][^>]*lang=["']ar["']/i.test(index))
    fail("Arabic RTL document metadata not found");
  else pass("Arabic RTL document metadata found");
  if (!/name=["']viewport["']/i.test(index)) fail("viewport meta tag missing");
  else pass("mobile viewport metadata found");

  const scripts = [...index.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
  if (!scripts.length) fail("no inline application scripts found");
  for (let i = 0; i < scripts.length; i++) {
    try { new vm.Script(scripts[i][1], { filename: `index.inline-script-${i + 1}.js` }); }
    catch (error) { fail(`inline script ${i + 1} syntax error: ${error.message}`); }
  }
  if (scripts.length && !process.exitCode) pass(`parsed ${scripts.length} inline script block(s)`);
}
for (const required of ["src/modules/app.js", "tests/header-stability/suite.js", "CHANGES.md", "README.md", "SECURITY.md", ".gitignore"]) {
  if (!fs.existsSync(path.join(root, required))) fail(`required project file missing: ${required}`);
  else pass(`found ${required}`);
}
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
if (!pkg.scripts?.["test:header"]) fail("header test script not configured");
else pass("header stability test command configured");
if (process.exitCode) process.exit(process.exitCode);
console.log("\nProject validation completed. Browser tests are separate.");
