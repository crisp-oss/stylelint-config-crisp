module.exports = {
  overrides: [
    {
      "files": ["*.vue"],
      "customSyntax": "postcss-html"
    }
  ],

  extends: [
    "stylelint-config-standard-scss",
    "@stylistic/stylelint-config"
  ],

  plugins: [
    "stylelint-order"
  ],

  rules: {
    // General rules
    "alpha-value-notation": "number",
    "at-rule-empty-line-before": [
      "always",
      {
        "except": ["blockless-after-same-name-blockless", "first-nested"],
        "ignore": ["after-comment", "blockless-after-blockless"],
        "ignoreAtRules": ["else"]
      }
    ]
    "block-no-empty": true,
    "color-function-notation": "legacy",
    "color-hex-length": "long",
    "color-no-invalid-hex": true,
    "declaration-block-no-redundant-longhand-properties": [
      true,

      {
        "ignoreShorthands": [
          "inset",
          "overflow"
        ]
      }
    ],
    "declaration-block-single-line-max-declarations": 1,
    "declaration-property-value-disallowed-list": {
      "border": ["none"],
      "border-top": ["none"],
      "border-right": ["none"],
      "border-bottom": ["none"],
      "border-left": ["none"],
      "outline": ["none"]
    },
    "number-max-precision": 5,
    "selector-class-pattern": null,
    "selector-pseudo-class-no-unknown": [
      true,

      {
        "ignorePseudoClasses": [
          "export"
        ]
      }
    ],
    "selector-pseudo-element-colon-notation": "single",

    // SCSS rules
    "scss/at-rule-conditional-no-parentheses": null,
    "scss/dollar-variable-empty-line-before": null,
    "scss/no-global-function-names": null,
    "scss/operator-no-newline-after": null,

    // Stylistic rules
    "@stylistic/block-closing-brace-newline-after": [
      "always",

      {
        "ignoreAtRules": ["if", "else"]
      }
    ],
    "@stylistic/color-hex-case": "lower",
    "@stylistic/declaration-colon-newline-after": null,
    "@stylistic/declaration-block-trailing-semicolon": "always",
    "@stylistic/indentation": [
      2,

      {
        "ignore": ["inside-parens"]
      }
    ],
    "@stylistic/number-leading-zero": "always",
    "@stylistic/property-case": "lower",
    "@stylistic/selector-pseudo-class-case": "lower",
    "@stylistic/selector-pseudo-element-case": "lower",
    "@stylistic/string-quotes": "double",
    "@stylistic/unit-case": "lower",

    // Order rules
    "order/order": [
      "dollar-variables",
      "declarations",
      "rules"
    ]
  }
}