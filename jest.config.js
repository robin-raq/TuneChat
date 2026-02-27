/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js", "**/*.test.js"],
  collectCoverageFrom: ["server/**/*.js"],
  coveragePathIgnorePatterns: ["/node_modules/"],
  verbose: true,
};
