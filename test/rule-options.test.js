const assert = require("node:assert/strict");
const { test } = require("node:test");
const config = require("../index");
const { lint, expectWarnings } = require("./helpers/lint");

const rules = [
  ["at-rule-conditional-parentheses", "@if $enabled { display: block; }"],
  ["filename-class-match", '$c: ".wrong";'],
  ["keyframes-comment", "@keyframes fade { from { opacity: 0; } }"],
  ["media-queries-comment", "@media print { .a { display: block; } }"],
  ["mixins-comment", "@mixin hidden { display: none; }"],
  ["no-inline-colors", ".a { color: red; }"],
  ["rule-empty-line-before", ".a {\n  display: block;\n  .b {}\n}"],
  ["selector-class-interpolation", ".component {}"]
];

test("every configured Crisp rule has a test fixture and is enabled", () => {
  const configuredRules = Object.keys(config.rules).filter(name => name.startsWith("crisp/"));
  assert.deepEqual(configuredRules.sort(), rules.map(([rule]) => `crisp/${rule}`).sort());

  for (const [rule] of rules) {
    assert.equal(config.rules[`crisp/${rule}`], true);
    assert.ok(config.plugins.includes(`./rules/${rule}`));
  }
});

for (const [rule, code] of rules) {
  test(`${rule}: rejects invalid primary options`, async () => {
    const result = await lint(rule, code, { filename: "Component.vue", primary: "invalid" });
    assert.equal(result.errored, true);
    assert.equal(result.results[0].invalidOptionWarnings.length, 1);
    assert.equal(result.warnings.length, 0);
  });

  test(`${rule}: can be disabled with null`, async () => {
    await expectWarnings(rule, code, 0, { filename: "Component.vue", primary: null });
  });

  test(`${rule}: respects disable comments`, async () => {
    await expectWarnings(rule, `/* stylelint-disable crisp/${rule} */\n${code}`, 0, {
      filename: "Component.vue"
    });
  });
}

for (const [rule, secondary] of [
  ["filename-class-match", { prefix: 1 }],
  ["filename-class-match", { suffix: false }],
  ["selector-class-interpolation", { ignoreSelectors: [1] }],
  ["no-inline-colors", { ignoreFiles: [1] }]
]) {
  test(`${rule}: rejects invalid secondary options ${JSON.stringify(secondary)}`, async () => {
    const result = await lint(rule, ".a {}", { filename: "Component.vue", secondary });
    assert.equal(result.errored, true);
    assert.equal(result.results[0].invalidOptionWarnings.length, 1);
  });
}

for (const rule of ["keyframes-comment", "media-queries-comment", "mixins-comment"]) {
  for (const ignoreFiles of [[1], "animations.scss", null, {}]) {
    test(`${rule}: rejects invalid ignoreFiles ${JSON.stringify(ignoreFiles)}`, async () => {
      const result = await lint(rule, ".a {}", { secondary: { ignoreFiles } });
      assert.equal(result.errored, true);
      assert.equal(result.results[0].invalidOptionWarnings.length, 1);
    });
  }
}
