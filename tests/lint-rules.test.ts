// TR8 / TC-59: the lint config itself is tested so nobody can loosen it by accident.
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const eslintBin = path.join(root, "node_modules", "eslint", "bin", "eslint.js");

function lint(source: string, filename = "apps/api/src/__lint_probe__.ts") {
  const out = spawnSync(process.execPath, [eslintBin, "--stdin", "--stdin-filename", filename], {
    cwd: root,
    input: source,
    encoding: "utf8",
  });
  return { code: out.status, output: out.stdout + out.stderr };
}

const lines = (n: number) =>
  Array.from({ length: n }, (_, i) => `export const v${i} = ${i};`).join("\n") + "\n";

test("TC-59 lint fails any file over 300 lines", () => {
  const res = lint(lines(301));
  expect(res.code).toBe(1);
  expect(res.output).toMatch(/max-lines/);
}, 60_000);

test("TC-59 lint passes a 300-line file", () => {
  expect(lint(lines(300)).code).toBe(0);
}, 60_000);

test("TC-59 lint rejects explicit any", () => {
  const res = lint("export const x: any = 1;\n");
  expect(res.code).toBe(1);
  expect(res.output).toMatch(/no-explicit-any/);
}, 60_000);
