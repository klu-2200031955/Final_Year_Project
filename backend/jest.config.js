module.exports = {
  testEnvironment: "node",
  collectCoverage: true,
  collectCoverageFrom: ["functions/**/*.js"],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 80,
      statements: 80,
    },
  }
};
