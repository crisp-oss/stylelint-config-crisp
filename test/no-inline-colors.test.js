const assert = require("node:assert/strict");
const { test } = require("node:test");
const { expectWarnings } = require("./helpers/lint");

const rule = "no-inline-colors";

for (const value of [
  "#fff", "#abcd", "#AABBCC", "#aabbccdd",
  "red", "ReBeCcApUrPlE",
  "rgb(12, 122, 231)", "rgba(12, 122, 231, 0.2)",
  "rgb(12 122 231 / 20%)", "hsl(120, 50%, 50%)",
  "hsla(120, 50%, 50%, 0.5)", "hwb(90 10% 10%)",
  "lab(50% 10 20)", "lch(50% 20 90)",
  "oklab(50% 0.1 0.2)", "oklch(50% 0.1 90)",
  "color(display-p3 1 0 0)", "RGB(12, 122, 231)"
]) {
  test(`${rule}: rejects ${value}`, async () => {
    const { warnings } = await expectWarnings(rule, `.a { color: ${value}; }`, 1);
    assert.match(warnings[0].text, /Unexpected inline color/);
    assert.equal(warnings[0].line, 1);
    assert.ok(warnings[0].column > 1);
  });
}

for (const name of [
  "lighten", "darken", "mix", "adjust-color", "scale-color", "change-color",
  "saturate", "desaturate", "grayscale", "complement", "invert",
  "opacify", "transparentize", "fade-in", "fade-out",
  "color.adjust", "color.mix", "color.scale", "color.change",
  "color.complement", "color.grayscale", "color.invert", "color.saturate",
  "color.desaturate"
]) {
  test(`${rule}: rejects Sass color function ${name}`, async () => {
    const { warnings } = await expectWarnings(rule, `.a { color: ${name}($token, 10%); }`, 1);
    assert.ok(warnings[0].text.includes(`${name}()`));
  });
}

for (const [property, value] of [
  ["color", "rgb(var(--red))"],
  ["color", "rgb(var(--red), 0.5)"],
  ["color", "rgba(var(--red), 0.5)"],
  ["color", "rgb($token)"],
  ["color", "rgba($token, 0.5)"],
  ["color", "var(--red)"],
  ["color", "$red"],
  ["color", "transparent"],
  ["color", "currentColor"],
  ["color", "inherit"],
  ["color", "initial"],
  ["color", "unset"],
  ["background", "linear-gradient(rgb(var(--red)), rgb(var(--blue)))"],
  ["background", 'url("/images/red.svg#fff")'],
  ["background", "url(data:image/svg+xml;base64,red)"],
  ["content", '"red #fff rgb(1, 2, 3) $color-source--red"'],
  ["content", "'blue #abc'"],
  ["animation-name", "fade-in"],
  ["font-family", "red-font"],
  ["filter", "invert(1) grayscale(50%) saturate(0.5)"],
  ["filter", "blur(4px)"],
  ["--size", "12"]
]) {
  test(`${rule}: accepts ${property}: ${value}`, async () => {
    await expectWarnings(rule, `.a { ${property}: ${value}; }`, 0);
  });
}

for (const code of [
  ".a { color: $color-source--red; }",
  "$token: $color-source--red;",
  "@include paint-path($color-source--red);"
]) {
  test(`${rule}: rejects source variable in ${code}`, async () => {
    const { warnings } = await expectWarnings(rule, code, 1);
    assert.match(warnings[0].text, /Unexpected color source variable "\$color-source--red"/);
  });
}

test(`${rule}: checks custom-property RGB channels`, async () => {
  await expectWarnings(rule, ":root { --red: 255, 0, 0; }", 1);
});

test(`${rule}: checks Sass declarations and at-rule arguments`, async () => {
  await expectWarnings(rule, "$token: #fff;\n@include paint-path(red);", 2);
});

test(`${rule}: finds colors nested in gradients without double-reporting functions`, async () => {
  await expectWarnings(rule, ".a { background: linear-gradient(rgb(1, 2, 3), #ffffff, red); }", 3);
  await expectWarnings(rule, ".a { color: rgb(red); }", 1);
});

test(`${rule}: does not let skipped strings hide subsequent colors`, async () => {
  await expectWarnings(rule, '.a { background: url("red.svg") red; content: "red" #fff; }', 2);
});

test(`${rule}: regex state does not leak across declarations`, async () => {
  await expectWarnings(rule, ".a { color: red; background: red; border-color: #fff; outline-color: #fff; }", 4);
});

for (const filename of ["colors.scss", "reset.scss", "tokens/colors.scss"]) {
  test(`${rule}: ignores ${filename} by default`, async () => {
    await expectWarnings(rule, ".a { color: red; }", 0, { filename });
  });
}

test(`${rule}: default exclusions match complete filenames only`, async () => {
  await expectWarnings(rule, ".a { color: red; }", 1, { filename: "my-colors.scss" });
});

test(`${rule}: custom ignoreFiles replaces defaults`, async () => {
  const secondary = { ignoreFiles: ["theme.scss"] };
  await expectWarnings(rule, ".a { color: red; }", 0, { filename: "theme.scss", secondary });
  await expectWarnings(rule, ".a { color: red; }", 1, { filename: "colors.scss", secondary });
  await expectWarnings(rule, ".a { color: red; }", 1, {
    filename: "colors.scss",
    secondary: { ignoreFiles: [] }
  });
});

test(`${rule}: checks Vue styles`, async () => {
  await expectWarnings(rule, ".a { color: red; }", 1, { filename: "Component.vue" });
});

test(`${rule}: does not guess replacement tokens in fix mode`, async () => {
  const code = ".a { color: red; }";
  assert.equal((await expectWarnings(rule, code, 1, { fix: true })).code, code);
});
