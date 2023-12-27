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
    "color-function-notation": "legacy",
    "color-hex-length": "long",
    "selector-class-pattern": null,

    "declaration-block-no-redundant-longhand-properties": [
      true,

      {
        "ignoreShorthands": [
          "inset",
          "overflow"
        ]
      }
    ],
    "selector-pseudo-class-no-unknown": [
      true,

      {
        "ignorePseudoClasses": [
          "export"
        ]
      }
    ],

    "alpha-value-notation": "number",
    "number-max-precision": 5,
    "selector-pseudo-element-colon-notation": "single",

    "scss/operator-no-newline-after": null,
    "scss/dollar-variable-empty-line-before": null,
    "scss/no-global-function-names": null,
    "scss/at-rule-conditional-no-parentheses": null,

    "@stylistic/declaration-colon-newline-after": null,
    "@stylistic/declaration-block-trailing-semicolon": "always",
    "@stylistic/selector-pseudo-class-case": "lower",
    "@stylistic/selector-pseudo-element-case": "lower",
    "@stylistic/property-case": "lower",
    "@stylistic/unit-case": "lower",
    "@stylistic/color-hex-case": "lower",
    "@stylistic/number-leading-zero": "always",
    "@stylistic/string-quotes": "double",
    "@stylistic/block-closing-brace-newline-after": [
      "always",

      {
        "ignoreAtRules": ["if", "else"]
      }
    ],

    "@stylistic/indentation": [
      2,

      {
        "ignore": ["inside-parens"]
      }
    ],

    "order/order": [
      "dollar-variables",
      "declarations",
      "rules"
    ]
  }
}