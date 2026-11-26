import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import stylelint from "stylelint";

const ROOT_DIR = path.join(import.meta.dirname, "..");

const WEB_CONFIG = {
  extends: [path.join(ROOT_DIR, "web.js")]
};

// Lint SCSS code and return the list of reported rule names
async function lint(code, fileName = "component.scss", config = WEB_CONFIG) {
  const { results } = await stylelint.lint({
    code: code,
    codeFilename: path.join(ROOT_DIR, "tests", fileName),
    config: config,
    configBasedir: ROOT_DIR
  });

  return results[0].warnings.map((warning) => {
    return warning.rule;
  });
}

test("web config extends the base config", async () => {
  const rules = await lint(`.c-card {
  color: #FFFFFF;
}
`);

  assert.ok(rules.includes("@stylistic/color-hex-case"));
  assert.ok(rules.includes("crisp/no-inline-colors"));
});

test("web config reports hex colors only once", async () => {
  const rules = await lint(`.c-card {
  color: #ffffff;
}
`);

  assert.deepEqual(rules, ["crisp/no-inline-colors"]);
});

test("web config rejects !important", async () => {
  const rules = await lint(`.c-card {
  color: var(--blue) !important;
}
`);

  assert.deepEqual(rules, ["declaration-no-important"]);
});

test("web config rejects z-index values not using z()", async () => {
  const rules = await lint(`.c-card {
  z-index: 10;
}
`);

  assert.deepEqual(rules, ["declaration-property-value-allowed-list"]);
});

test("web config allows z-index values using z(), auto or 0", async () => {
  const rules = await lint(`.c-card {
  z-index: z(modal);

  &__title {
    z-index: auto;
  }

  &__text {
    z-index: 0;
  }
}
`);

  assert.deepEqual(rules, []);
});

test("web config rejects rgb(), rgba(), hsl() and hsla() functions", async () => {
  const rules = await lint(`.c-card {
  color: rgb(var(--blue));
  background-color: rgba(var(--blue), 0.5);
  border-color: hsl(var(--blue));
  outline-color: hsla(var(--blue), 0.5);
}
`);

  assert.equal(rules.filter((rule) => {
    return rule === "function-disallowed-list";
  }).length, 4);
});

test("web config allows colors as CSS variables", async () => {
  const rules = await lint(`.c-card {
  color: var(--blue);
}
`);

  assert.deepEqual(rules, []);
});

test("web config allows color functions in colors.scss and reset.scss", async () => {
  const code = `:root {
  --blue: rgb(25, 114, 245);
}
`;

  for (const fileName of ["colors.scss", "reset.scss", "tokens/colors.scss"]) {
    assert.deepEqual(await lint(code, fileName), [], fileName);
  }
});

test("web config rejects a nesting depth greater than 3", async () => {
  const rules = await lint(`.c-card {
  &__title {
    &--active {
      &:hover {
        span {
          color: var(--blue);
        }
      }
    }
  }
}
`);

  assert.deepEqual(rules, ["max-nesting-depth"]);
});

test("web config ignores @include and @media in nesting depth", async () => {
  const rules = await lint(`.c-card {
  &__title {
    &--active {
      // --> MEDIA-QUERIES <--

      @media (min-width: 600px) {
        @include hover {
          &:hover {
            color: var(--blue);
          }
        }
      }
    }
  }
}
`);

  assert.deepEqual(rules, []);
});

test("web config rejects media features outside of the allowed list", async () => {
  const rules = await lint(`.c-card {
  // --> MEDIA-QUERIES <--

  @media (max-width: 600px) {
    display: none;
  }
}
`);

  assert.deepEqual(rules, ["media-feature-name-allowed-list"]);
});

test("web config allows media features from the allowed list", async () => {
  const rules = await lint(`.c-card {
  // --> MEDIA-QUERIES <--

  @media (min-width: 600px) {
    display: none;
  }

  @media (hover: hover) and (pointer: fine) {
    display: none;
  }

  @media (prefers-reduced-motion: reduce) {
    display: none;
  }

  @media (prefers-contrast: more) {
    display: none;
  }

  @media (forced-colors: active) {
    display: none;
  }
}
`);

  assert.deepEqual(rules, []);
});

test("web config can be restricted to some files using overrides", async () => {
  const config = {
    extends: [path.join(ROOT_DIR, "index.js")],

    overrides: [
      {
        files: ["tests/scoped/**/*.scss"],
        extends: [path.join(ROOT_DIR, "web.js")]
      }
    ]
  };

  const code = `.c-card {
  z-index: 10;
}
`;

  assert.deepEqual(
    await lint(code, "scoped/component.scss", config),
    ["declaration-property-value-allowed-list"]
  );

  assert.deepEqual(await lint(code, "legacy/component.scss", config), []);
});
