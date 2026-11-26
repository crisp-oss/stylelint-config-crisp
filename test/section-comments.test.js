const assert = require("node:assert/strict");
const path = require("node:path");
const os = require("node:os");
const fs = require("node:fs");
const { test } = require("node:test");
const stylelint = require("stylelint");

const sections = [
  {
    rule: "media-queries-comment",
    heading: "MEDIA-QUERIES",
    blocks: [
      "@include mq($until: 840px) {}",
      "@media (max-width: 840px) {}",
      "@media print {}",
      "@media (prefers-reduced-motion: reduce) {}",
      "@container (width > 840px) {}"
    ]
  },
  {
    rule: "keyframes-comment",
    heading: "KEYFRAMES",
    blocks: [
      "@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }",
      "@-webkit-keyframes fade-in { from { opacity: 0; } }"
    ]
  },
  {
    rule: "mixins-comment",
    heading: "MIXINS",
    blocks: [
      "@mixin paint-path($color) { color: $color; }",
      "@mixin hidden { display: none; }"
    ]
  }
];

async function lint(code, rule, options = {}) {
  const { secondary, ...lintOptions } = options;

  return stylelint.lint({
    code,
    codeFilename: "Component.vue",
    fix: false,
    config: {
      customSyntax: "postcss-html",
      plugins: [path.resolve(__dirname, `../rules/${rule}.js`)],
      rules: { [`crisp/${rule}`]: secondary === undefined ? true : [true, secondary] }
    },
    ...lintOptions
  });
}

for (const { rule, heading, blocks } of sections) {
  const comment = `// --> ${heading} <--`;

  for (const block of blocks) {
    test(`${rule}: requires and fixes heading for ${block}`, async () => {
      const code = `<style lang="scss">\n${block}\n</style>`;
      const result = await lint(code, rule);
      assert.equal(result.results[0].warnings.length, 1);

      const fixed = await lint(code, rule, { fix: true });
      assert.equal(fixed.code, `<style lang="scss">\n${comment}\n\n${block}\n</style>`);
      assert.equal((await lint(fixed.code, rule)).errored, false);
      assert.equal((await lint(fixed.code, rule, { fix: true })).code, fixed.code);
    });
  }

  test(`${rule}: one heading covers sibling and nested blocks`, async () => {
    const code = `<style lang="scss">
${comment}

${blocks[0]}
${blocks[1]}
</style>`;
    assert.equal((await lint(code, rule)).errored, false);

    const outer = {
      "keyframes-comment": "keyframes outer",
      "media-queries-comment": "media print",
      "mixins-comment": "mixin outer"
    }[rule];
    const nested = `<style lang="scss">\n${comment}\n\n@${outer} {\n  ${blocks[0]}\n}\n</style>`;
    assert.equal((await lint(nested, rule)).errored, false);
  });

  test(`${rule}: reports and fixes missing blank line`, async () => {
    const code = `<style lang="scss">\n${comment}\n${blocks[0]}\n</style>`;
    const result = await lint(code, rule);
    assert.equal(result.results[0].warnings.length, 1);
    assert.match(result.results[0].warnings[0].text, /empty line/);
    assert.equal((await lint(code, rule, { fix: true })).code,
      code.replace(`${comment}\n`, `${comment}\n\n`));
  });

  test(`${rule}: normalizes heading syntax and indentation`, async () => {
    for (const wrongComment of [
      `/* --> ${heading} <-- */`,
      `// ${heading.toLowerCase().replaceAll("-", " ")}`,
      `//--> ${heading} <--`
    ]) {
      const code = `<style lang="scss">\n.a {\n${wrongComment}\n  ${blocks[0]}\n}\n</style>`;
      assert.equal((await lint(code, rule)).errored, true);
      const fixed = await lint(code, rule, { fix: true });
      assert.equal(fixed.code, `<style lang="scss">\n.a {\n  ${comment}\n\n  ${blocks[0]}\n}\n</style>`);
      assert.equal((await lint(fixed.code, rule)).errored, false);
    }
  });

  test(`${rule}: reports indentation without mutating input`, async () => {
    const code = `<style lang="scss">\n.a {\n${comment}\n\n  ${blocks[0]}\n}\n</style>`;
    const result = await lint(code, rule);
    assert.match(result.results[0].warnings[0].text, /indentation/);
    assert.equal((await lint(code, rule, { fix: true })).code,
      code.replace(`\n${comment}`, `\n  ${comment}`));
  });

  test(`${rule}: preserves unrelated comments and CRLF`, async () => {
    const code = `<style lang="scss">\r\n// Explanation\r\n${blocks[0]}\r\n</style>`;
    const fixed = await lint(code, rule, { fix: true });
    assert.equal(fixed.code, `<style lang="scss">\r\n// Explanation\r\n${comment}\r\n\r\n${blocks[0]}\r\n</style>`);
  });

  test(`${rule}: each style tag and independent parent needs a heading`, async () => {
    const code = `<template><div /></template>
<style lang="scss">
.a {
  ${blocks[0]}
}
.b {
  ${blocks[0]}
}
</style>
<style lang="scss">
${blocks[0]}
</style>`;
    assert.equal((await lint(code, rule)).results[0].warnings.length, 3);
    const fixed = await lint(code, rule, { fix: true });
    assert.equal((await lint(fixed.code, rule)).errored, false);
  });

  test(`${rule}: works in standalone SCSS`, async () => {
    const options = {
      codeFilename: "component.scss",
      customSyntax: "postcss-scss"
    };
    const result = await lint(blocks[0], rule, { ...options, fix: true });
    assert.equal(result.code, `${comment}\n\n${blocks[0]}`);
    assert.equal((await lint(result.code, rule, options)).errored, false);
  });

  test(`${rule}: ignores configured repository-relative paths without autofixing`, async () => {
    for (const filename of ["animations.scss", "styles/animations.scss", "mixins.scss", "Shared.vue"]) {
      const isVue = filename.endsWith(".vue");
      const code = isVue ? `<style lang="scss">\n${blocks[0]}\n</style>` : blocks[0];
      const options = {
        codeFilename: filename,
        customSyntax: isVue ? "postcss-html" : "postcss-scss",
        secondary: { ignoreFiles: ["animations.scss", "styles/animations.scss", "mixins.scss", "Shared.vue"] }
      };
      assert.equal((await lint(code, rule, options)).errored, false);
      const fixed = await lint(code, rule, { ...options, fix: true });
      assert.equal(fixed.errored, false);
      assert.equal(fixed.code, code);
    }
  });

  test(`${rule}: path exclusions are exact and optional`, async () => {
    for (const [filename, secondary] of [
      ["animations.scss", undefined],
      ["animations.scss", { ignoreFiles: [] }],
      ["other.scss", { ignoreFiles: ["animations.scss"] }],
      ["styles/animations.scss", { ignoreFiles: ["animations.scss"] }],
      ["other/animations.scss", { ignoreFiles: ["styles/animations.scss"] }],
      ["animations.scss", { ignoreFiles: ["styles/animations.scss"] }],
      ["other-animations.scss", { ignoreFiles: ["animations.scss"] }],
      ["animations.scss.bak", { ignoreFiles: ["animations.scss"] }]
    ]) {
      const result = await lint(blocks[0], rule, {
        codeFilename: filename,
        customSyntax: "postcss-scss",
        secondary
      });
      assert.equal(result.results[0].warnings.length, 1);
      assert.equal(result.errored, true);
    }
  });

  for (const gitMarker of ["directory", "file"]) {
    test(`${rule}: resolves paths from the Git root (${gitMarker}), not the working directory`, async (t) => {
      const repository = fs.mkdtempSync(path.join(os.tmpdir(), "crisp-section-comments-"));
      t.after(() => fs.rmSync(repository, { recursive: true, force: true }));

      if (gitMarker === "directory") {
        fs.mkdirSync(path.join(repository, ".git"));
      } else {
        fs.writeFileSync(path.join(repository, ".git"), "gitdir: /unused/worktree\n");
      }

      for (const [filename, ignored] of [
        ["styles/animations.scss", true],
        ["other/animations.scss", false],
        ["animations.scss", false]
      ]) {
        const options = {
          codeFilename: path.join(repository, filename),
          customSyntax: "postcss-scss",
          secondary: { ignoreFiles: ["styles/animations.scss"] }
        };
        assert.equal((await lint(blocks[0], rule, options)).errored, !ignored);
        const fixed = await lint(blocks[0], rule, { ...options, fix: true });
        assert.equal(fixed.code === blocks[0], ignored);
      }
    });
  }

  test(`${rule}: respects Stylelint disable comments during autofix`, async () => {
    const code = `<style lang="scss">
/* stylelint-disable ${`crisp/${rule}`} */
${blocks[0]}
</style>`;
    const result = await lint(code, rule, { fix: true });
    assert.equal(result.code, code);
    assert.equal(result.errored, false);
  });
}

for (const { rule, heading, blocks } of sections.filter(({ rule }) => rule !== "mixins-comment")) {
  for (const block of blocks) {
    for (const wrap of [
      (code) => code,
      (code) => `.a {\n    ${code}\n  }`,
      (code) => `@if ($enabled) {\n    ${code}\n  }`
    ]) {
      test(`${rule}: ignores ${wrap(block)} inside a mixin`, async () => {
        const code = `@mixin example {\n  ${wrap(block)}\n}`;
        const options = { codeFilename: "component.scss", customSyntax: "postcss-scss" };
        const result = await lint(code, rule, options);
        assert.deepEqual(result.results[0].warnings, []);
        const fixed = await lint(code, rule, { ...options, fix: true });
        assert.equal(fixed.code, code);
        assert.equal(fixed.errored, false);
      });
    }
  }

  test(`${rule}: still requires headings outside mixins`, async () => {
    const code = `<style lang="scss">
@mixin example {
  ${blocks[0]}
}

${blocks[0]}
</style>`;
    const result = await lint(code, rule);
    assert.equal(result.results[0].warnings.length, 1);
    const fixed = await lint(code, rule, { fix: true });
    assert.equal(fixed.code, code.replace(`\n\n${blocks[0]}`, `\n\n// --> ${heading} <--\n\n${blocks[0]}`));
    assert.equal((await lint(fixed.code, rule)).errored, false);
  });

  test(`${rule}: preserves existing section comments inside mixins`, async () => {
    const code = `<style lang="scss">
@mixin example {
// ${heading}
  ${blocks[0]}
}
</style>`;
    assert.equal((await lint(code, rule)).errored, false);
    assert.equal((await lint(code, rule, { fix: true })).code, code);
  });
}

test("ignores unrelated at-rules", async () => {
  const code = '<style lang="scss">\n@include paint-path(red);\n@supports (display: grid) {}\n</style>';

  for (const { rule } of sections) {
    assert.equal((await lint(code, rule)).errored, false);
  }
});

test("all section rules work together with the complete configuration", async () => {
  const code = `<style lang="scss">
$c: ".component";

@mixin hidden {
  display: none;

  @media print {
    display: block;
  }

  @keyframes pulse {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }
}

#{$c} {
  display: block;
}

@include mq($until: 840px) {
  #{$c} {
    display: none;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>`;
  const options = {
    code,
    codeFilename: "Component.vue",
    config: require("../index")
  };
  const fixed = await stylelint.lint({ ...options, fix: true });
  assert.match(fixed.code, /\/\/ --> MIXINS <--\n\n@mixin/);
  assert.equal((fixed.code.match(/\/\/ --> MEDIA-QUERIES <--/g) || []).length, 1);
  assert.equal((fixed.code.match(/\/\/ --> KEYFRAMES <--/g) || []).length, 1);
  assert.match(fixed.code, /\/\/ --> MEDIA-QUERIES <--\n\n@include/);
  assert.match(fixed.code, /\/\/ --> KEYFRAMES <--\n\n@keyframes/);
  const checked = await stylelint.lint({ ...options, code: fixed.code, fix: false });
  assert.deepEqual(checked.results[0].warnings, []);
  assert.equal((await stylelint.lint({ ...options, code: fixed.code, fix: true })).code, fixed.code);
});
