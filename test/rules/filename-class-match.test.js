const assert = require("node:assert/strict");
const { test } = require("node:test");
const { expectWarnings } = require("../helpers/lint");

const rule = "filename-class-match";

for (const [filename, className] of [
  ["SearchBox.vue", "search-box"],
  ["CheckFailures.vue", "check-failures"],
  ["CheckSMTPFailures.vue", "check-smtp-failures"],
  ["CheckIPsFailures.vue", "check-ips-failures"],
  ["MonitoringMailerIPs.vue", "monitoring-mailer-ips"],
  ["XMLParser.vue", "xml-parser"],
  ["BaseInput.island.vue", "base-input"],
  ["components/SearchBox.vue", "search-box"]
]) {
  test(`${rule}: accepts ${filename} as ${className}`, async () => {
    await expectWarnings(rule, `$c: ".${className}";\n#{$c} { display: block; }`, 0, { filename });
  });
}

test(`${rule}: rejects a class that does not match the filename`, async () => {
  const { warnings } = await expectWarnings(rule, '$c: ".wrong";', 1, { filename: "SearchBox.vue" });
  assert.match(warnings[0].text, /'wrong'.*'search-box'/);
});

test(`${rule}: accepts single-quoted scope variables`, async () => {
  await expectWarnings(rule, "$c: '.search-box';", 0, { filename: "SearchBox.vue" });
});

test(`${rule}: supports prefix and suffix options`, async () => {
  const options = {
    filename: "SearchBox.vue",
    secondary: { prefix: "c-", suffix: "-widget" }
  };
  await expectWarnings(rule, '$c: ".c-search-box-widget";', 0, options);
  await expectWarnings(rule, '$c: ".search-box";', 1, options);
});

for (const filename of ["index.vue", "[id].vue", "[[slug]].vue", "SearchBox.scss"]) {
  test(`${rule}: skips ${filename}`, async () => {
    await expectWarnings(rule, '$c: ".unrelated";', 0, { filename });
  });
}

test(`${rule}: ignores files without a scope variable`, async () => {
  await expectWarnings(rule, ".unrelated { display: block; }", 0, { filename: "SearchBox.vue" });
});

test(`${rule}: does not rename classes in fix mode`, async () => {
  const result = await expectWarnings(rule, '$c: ".wrong";', 1, { filename: "SearchBox.vue", fix: true });
  assert.match(result.code, /\$c: "\.wrong";/);
});
