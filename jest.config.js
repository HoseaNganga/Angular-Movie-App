const isFullTest = process.env.JEST_FULL === "true";
module.exports = {
  preset: "jest-preset-angular",
  setupFilesAfterEnv: isFullTest ? [] : ["<rootDir>/setup-jest.ts"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/dist/"],
  transform: {
    "^.+\\.ts$": "ts-jest", // Only transform .ts files
  },
  transformIgnorePatterns: [
    "/node_modules/(?!flat)/", // Exclude modules except 'flat' from transformation
  ],
};
