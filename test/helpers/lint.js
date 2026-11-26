const assert = require("node:assert/strict");
const path = require("node:path");
const stylelint = require("stylelint");

async function lint(rule, code, {
  filename = "Component.scss",
  primary = true,
  secondary,
  fix = false
} = {}) {
  const isVue = filename.endsWith(".vue");
  const result = await stylelint.lint({
    code: isVue ? `<template><div /></template>\n<style lang="scss">\n${code}\n</style>` : code,
    codeFilename: filename,
    fix,
    config: {
      customSyntax: isVue ? "postcss-html" : "postcss-scss",
      plugins: [path.resolve(__dirname, `../../rules/${rule}.js`)],
      rules: {
        [`crisp/${rule}`]: secondary === undefined ? primary : [primary, secondary]
      }
    }
  });

  assert.deepEqual(result.results[0].parseErrors, [], "Fixture must parse successfully");

  return {
    code: result.code,
    errored: result.errored,
    results: result.results,
    warnings: result.results[0].warnings
  };
}

async function expectWarnings(rule, code, count, options) {
  const result = await lint(rule, code, options);

  assert.equal(result.warnings.length, count, JSON.stringify(result.warnings, null, 2));
  assert.equal(result.errored, count > 0);

  for (const warning of result.warnings) {
    assert.equal(warning.rule, `crisp/${rule}`);
    assert.equal(warning.severity, "error");
  }

  return result;
}

module.exports = { lint, expectWarnings };
