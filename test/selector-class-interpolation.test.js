const assert = require("node:assert/strict");
const { test } = require("node:test");
const { lint, expectWarnings } = require("./helpers/lint");

const rule = "selector-class-interpolation";
const options = { filename: "Component.vue" };
const scope = '$c: ".component";\n';

for (const selector of [
  "#{$c}",
  "#{$c}__item",
  "#{$c}--active",
  "&--active",
  "&:hover",
  "& > span",
  "span",
  "#identifier",
  ".external",
  "&.external"
]) {
  test(`${rule}: accepts ${selector}`, async () => {
    await expectWarnings(rule, `${scope}#{$c} { ${selector} { display: block; } }`, 0, options);
  });
}

for (const selector of [
  ".component",
  ".component__item",
  ".component--active",
  "&__item",
  "&-icon",
  "&.component",
  "&.component__item",
  "&.component--active"
]) {
  test(`${rule}: rejects ${selector}`, async () => {
    const { warnings } = await expectWarnings(rule, `${scope}#{$c} { ${selector} {} }`, 1, options);
    assert.match(warnings[0].text, /Expected Sass interpolation in class selector/);
  });
}

test(`${rule}: infers file scope from a root class when $c is absent`, async () => {
  await expectWarnings(rule, ".component { .component__item {} .external {} }", 2, options);
});

test(`${rule}: does not inspect non-Vue styles`, async () => {
  await expectWarnings(rule, ".component { &__item {} }", 0);
});

test(`${rule}: ignores keyframe step selectors`, async () => {
  await expectWarnings(rule, "@keyframes fade { from { opacity: 0; } 100% { opacity: 1; } }", 0, options);
});

for (const ignore of [".component__item", "/component__/", /^\.component__/]) {
  test(`${rule}: supports ignoreSelectors entry ${ignore}`, async () => {
    await expectWarnings(rule, `${scope}.component__item {}`, 0, {
      ...options,
      secondary: { ignoreSelectors: [ignore] }
    });
  });
}

test(`${rule}: matches nested selectors with ignoreSelectors patterns`, async () => {
  await expectWarnings(rule, ".component { &__item {} }", 0, {
    ...options,
    secondary: { ignoreSelectors: [".component", /__item/] }
  });
});

test(`${rule}: unmatched ignoreSelectors still reports violations`, async () => {
  await expectWarnings(rule, `${scope}.component__item {}`, 1, {
    ...options,
    secondary: { ignoreSelectors: [".other"] }
  });
});

test(`${rule}: autofixes the root class and remains stable on a second pass`, async () => {
  const fixed = await lint(rule, ".component { display: block; }", { ...options, fix: true });
  assert.deepEqual(fixed.warnings, []);
  assert.match(fixed.code, /\$c: "\.component";/);
  assert.match(fixed.code, /#\{\$c\} \{ display: block; \}/);

  // lint() wraps Vue snippets, so extract the fixed style contents first.
  const style = fixed.code.match(/<style lang="scss">([\s\S]*?)<\/style>/)[1];
  await expectWarnings(rule, style, 0, options);
  assert.equal((await lint(rule, style, { ...options, fix: true })).code,
    `<template><div /></template>\n<style lang="scss">\n${style}\n</style>`);
});

test(`${rule}: autofixes nested element suffixes`, async () => {
  const fixed = await lint(rule, `${scope}#{$c}__item { &-icon {} }`, { ...options, fix: true });
  assert.match(fixed.code, /#\{\$c\}__item-icon \{\}/);
});

test(`${rule}: autofixes &__item to #{$c}__item`, async () => {
  const fixed = await lint(rule, `${scope}#{$c} { &__item {} }`, { ...options, fix: true });
  assert.deepEqual(fixed.warnings, []);
  assert.match(fixed.code, /#\{\$c\}__item \{\}/);

  const style = fixed.code.match(/<style lang="scss">([\s\S]*?)<\/style>/)[1];
  await expectWarnings(rule, style, 0, options);
  assert.equal((await lint(rule, style, { ...options, fix: true })).code,
    `<template><div /></template>\n<style lang="scss">\n${style}\n</style>`);
});
