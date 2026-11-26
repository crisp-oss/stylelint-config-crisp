const assert = require("node:assert/strict");
const { test } = require("node:test");
const { expectWarnings } = require("./helpers/lint");

const rule = "rule-empty-line-before";

for (const [name, code] of [
  ["root-level siblings", ".a {}\n.b {}"],
  ["first nested rule", ".a {\n  .b {}\n}"],
  ["blank line after declaration", ".a {\n  display: block;\n\n  .b {}\n}"],
  ["blank line after rule", ".a {\n  .b {}\n\n  .c {}\n}"],
  ["comment before rule", ".a {\n  display: block;\n  // Section\n  .b {}\n}"],
  ["block comment before rule", ".a {\n  .b {}\n  /* Section */\n  .c {}\n}"],
  ["CRLF blank line", ".a {\r\n  display: block;\r\n\r\n  .b {}\r\n}"],
  ["first rule after only an include", ".a {\n  @include reset;\n  .b {}\n}"],
  ["Sass interpolation with blank line", '#{$c} {\n  display: block;\n\n  #{$c}__item {}\n}']
]) {
  test(`${rule}: accepts ${name}`, async () => {
    await expectWarnings(rule, code, 0);
  });
}

for (const [name, code] of [
  ["rule after declaration", ".a {\n  display: block;\n  .b {}\n}"],
  ["rule after sibling rule", ".a {\n  .b {}\n  .c {}\n}"],
  ["declaration before intervening include", ".a {\n  display: block;\n  @include reset;\n  .b {}\n}"],
  ["Sass interpolation", '#{$c} {\n  display: block;\n  #{$c}__item {}\n}']
]) {
  test(`${rule}: rejects ${name}`, async () => {
    const { warnings } = await expectWarnings(rule, code, 1);
    assert.match(warnings[0].text, /Expected an empty line before the rule/);
  });
}

test(`${rule}: reports every missing blank line`, async () => {
  await expectWarnings(rule, ".a {\n  display: block;\n  .b {}\n  .c {}\n}", 2);
});

test(`${rule}: reports within Vue style tags`, async () => {
  await expectWarnings(rule, ".a {\n  display: block;\n  .b {}\n}", 1, { filename: "Component.vue" });
});

test(`${rule}: leaves input unchanged in fix mode`, async () => {
  const code = ".a {\n  display: block;\n  .b {}\n}";
  assert.equal((await expectWarnings(rule, code, 1, { fix: true })).code, code);
});
