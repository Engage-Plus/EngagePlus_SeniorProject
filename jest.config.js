// One Jest run for the whole monorepo (TR4). Type checking is done by `npm run typecheck`;
// ts-jest only transpiles here so tests stay fast.
const transform = {
  "^.+\\.tsx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.jest.json" }],
};
const moduleNameMapper = {
  "^(\\.{1,2}/.*)\\.js$": "$1",
  "^@engageplus/shared$": "<rootDir>/packages/shared/src/index.ts",
  "\\.css$": "<rootDir>/tests/styleStub.cjs",
};
const base = { rootDir: ".", transform, moduleNameMapper };

export default {
  projects: [
    { ...base, displayName: "shared", testEnvironment: "node", roots: ["<rootDir>/packages/shared/src"] },
    { ...base, displayName: "api", testEnvironment: "node", roots: ["<rootDir>/apps/api/src"] },
    {
      ...base,
      displayName: "web",
      testEnvironment: "jsdom",
      roots: ["<rootDir>/apps/web/src"],
      setupFiles: ["<rootDir>/tests/webSetup.cjs"],
    },
    { ...base, displayName: "repo", testEnvironment: "node", roots: ["<rootDir>/tests"] },
  ],
};
