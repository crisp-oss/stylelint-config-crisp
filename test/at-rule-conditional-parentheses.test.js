const assert = require("node:assert/strict");
const { test } = require("node:test");
const { expectWarnings } = require("./helpers/lint");

const rule = "at-rule-conditional-parentheses";

for (const statement of [
  "@if ($enabled)",
  "@if not ($enabled)",
  "@while ($index > 0)",
  "@while not ($done)",
  "@else if ($enabled)",
  "@else if not ($enabled)",
  "@else",
  "@each $item in $items",
  "@for $i from 1 through 3",
  "@media (max-width: 800px)",
  "@supports (display: grid)"
]) {
  test(`${rule}: accepts ${statement}`, async () => {
    await expectWarnings(rule, `${statement} { .item { display: block; } }`, 0);
  });
}

for (const [statement, name] of [
  ["@if $enabled", "if"],
  ["@if not $enabled", "if"],
  ["@while $index > 0", "while"],
  ["@while not $done", "while"],
  ["@else if $enabled", "else-if"],
  ["@else if not $enabled", "else-if"]
]) {
  test(`${rule}: rejects ${statement}`, async () => {
    const { warnings } = await expectWarnings(rule, `${statement} { display: block; }`, 1);
    assert.match(warnings[0].text, new RegExp(`Expected parentheses in "@${name}" statement`));
    assert.equal(warnings[0].line, 1);
  });
}

test(`${rule}: checks nested conditions independently`, async () => {
  await expectWarnings(rule, "@if $enabled {\n  @while $count > 0 { display: block; }\n}", 2);
});

test(`${rule}: does not change conditions in fix mode`, async () => {
  const code = "@if $enabled { display: block; }";
  assert.equal((await expectWarnings(rule, code, 1, { fix: true })).code, code);
});

test(`${rule}: works inside Vue styles`, async () => {
  await expectWarnings(rule, "@if $enabled { display: block; }", 1, { filename: "Component.vue" });
});
