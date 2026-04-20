export default {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testRegex: "/tests/unit/.*\\.test\\.ts$",
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json'
    }]
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverageFrom: ["server/src/**/*.ts", "!server/src/**/*.d.ts"],
  coverageDirectory: "coverage",
  verbose: true,
  moduleNameMapper: {
    "^uuid$": "./tests/__mocks__/uuid.js",
  },
};
