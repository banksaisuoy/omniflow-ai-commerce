const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
    },
    specPattern: "cypress/integration/**/*.spec.{js,jsx,ts,tsx}",
    baseUrl: "http://localhost:8080",
    supportFile: false
  },
});