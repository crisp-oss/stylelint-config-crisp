# Stylelint Config Crisp

[![Build and Release](https://github.com/crisp-oss/stylelint-config-crisp/workflows/Build%20and%20Release/badge.svg)](https://github.com/crisp-oss/stylelint-config-crisp/actions?query=workflow%3A%22Build+and+Release%22) [![NPM](https://img.shields.io/npm/v/stylelint-config-crisp.svg)](https://www.npmjs.com/package/stylelint-config-crisp) [![Downloads](https://img.shields.io/npm/dt/stylelint-config-crisp.svg)](https://www.npmjs.com/package/stylelint-config-crisp)

A [Stylelint](https://stylelint.io/) configuration that enforces Crisp's CSS rules.

**😘 Maintainer**: [@eliottvincent](https://github.com/eliottvincent)

## Usage

Just extend this configuration in your Stylelint config object:
```json
{
  "extends": ["stylelint-config-crisp"]
}
```

## Documentation

This is the list of configured syntaxes, plugins and rules used by Stylelint Config Crisp, and what they do.

### Custom syntaxes
- [postcss-html](https://github.com/ota-meshi/postcss-html): allows to parse `<style>` tags from Vue files

### Configurations
- [@stylistic/stylelint-config](https://github.com/stylelint-stylistic/stylelint-config): A backport of stylistic rules that were deprecated in [Stylelint 15.0.0](https://github.com/stylelint/stylelint/blob/15.0.0/docs/migration-guide/to-15.md)
- [stylelint-config-standard-scss](https://github.com/stylelint-scss/stylelint-config-standard-scss): Standard rules specific to SCSS syntax

### Plugins
- [stylelint-order](https://github.com/hudochenkov/stylelint-order): Order-related linting rules

### Rules

#### General rules
- [alpha-value-notation](https://stylelint.io/user-guide/rules/alpha-value-notation/): Alpha-values must use the number notation (instead of the percentage notation)
- [at-rule-empty-line-before](https://stylelint.io/user-guide/rules/at-rule-empty-line-before/): Requires an empty line before at-rules
  * `blockless` at-rules are ignored (usefull for root `.scss` files with a lot of `@import` rules, organized in different groups)
- [block-no-empty](https://stylelint.io/user-guide/rules/block-no-empty/): Disallows empty blocks
- [color-function-notation](https://stylelint.io/user-guide/rules/color-function-notation/): Color functions must use legacy notation (`rgba(12, 122, 231, 0.2)` instead of `rgb(12 122 231 / 0.2)`)
- [color-hex-length](https://stylelint.io/user-guide/rules/color-hex-length/): Hex colors must use long notation
- [color-no-invalid-hex](https://stylelint.io/user-guide/rules/color-no-invalid-hex/): Disallows invalid hex colors
- [declaration-block-no-redundant-longhand-properties](https://stylelint.io/user-guide/rules/declaration-block-no-redundant-longhand-properties/): Disallows redundant longhand properties
  * `inset` shorthand is ignored (prefer using the longhand properties `top`, `right`, `bottom` and `left` altogether)
  * `overflow` shorthand is ignored (prefer using the longhand properties `overflow-x` and `overflow-y` altogether)
- [declaration-block-single-line-max-declarations](https://stylelint.io/user-guide/rules/declaration-block-single-line-max-declarations/): Allows only 1 declaration per line
- [declaration-property-value-disallowed-list](https://stylelint.io/user-guide/rules/declaration-property-value-disallowed-list/): A list of disallowed property and value pairs within declaration
  * `^border: none` is disallowed (prefer `0`, for consistency)
  * `outline: none` is disallowed (prefer `0`, for consistency)
- [keyframe-block-no-duplicate-selectors](https://stylelint.io/user-guide/rules/keyframe-block-no-duplicate-selectors/): Rule is **disabled**, in order to allow cascade selectors within keyframe blocks (seems they are not supported by this rule, yet)
- [number-max-precision](https://stylelint.io/user-guide/rules/number-max-precision/): Allows a maximum of 5 decimal places in numbers
- [no-descending-specificity](https://stylelint.io/user-guide/rules/no-descending-specificity/): Rule is **disabled**, as we do not want to check source order
- [rule-empty-line-before](https://stylelint.io/user-guide/rules/rule-empty-line-before/): Requires an empty line before multi-line rules
  * `"first-nested"` is reversed (for rules that are nested and the first child of their parent node, we don't want any empty line)
  * `"after-comment"` is ignored (for rules that follow a comment)
- [selector-class-pattern](https://stylelint.io/user-guide/rules/selector-class-pattern/): Rule is **disabled** as it conflicts with our BEM notation in class selectors
- [selector-not-notation](https://stylelint.io/user-guide/rules/selector-not-notation/): Enforces simple notation for `:not()` pseudo-class selectors
- [selector-pseudo-class-no-unknown](https://stylelint.io/user-guide/rules/selector-pseudo-class-no-unknown/): Disallows unknown pseudo-class selectors
- [selector-pseudo-element-colon-notation](https://stylelint.io/user-guide/rules/selector-pseudo-element-colon-notation/): Pseudo-elements must use the single colon notation

#### SCSS rules
- [scss/at-rule-conditional-no-parentheses](https://github.com/stylelint-scss/stylelint-scss/tree/master/src/rules/at-rule-conditional-no-parentheses): Rule is **disabled** to allow parentheses in conditional at-rules (if, elsif, while)
- [scss/dollar-variable-empty-line-before](https://github.com/stylelint-scss/stylelint-scss/tree/master/src/rules/dollar-variable-empty-line-before): Rule is **disabled** to allow empty lines between logical variable blocks
- [scss/load-no-partial-leading-underscore](https://github.com/stylelint-scss/stylelint-scss/tree/master/src/rules/load-no-partial-leading-underscore): Rule is **disabled** to allow `@import`-ing files with underscore in their name
- [scss/map-keys-quotes](https://github.com/stylelint-scss/stylelint-scss/tree/master/src/rules/map-keys-quotes): Requires quoted keys in maps
- [scss/no-global-function-names](https://github.com/stylelint-scss/stylelint-scss/tree/master/src/rules/no-global-function-names): Rule is **disabled** to keep using global function names, instead of the new built-in module system
- [scss/operator-no-newline-after](https://github.com/stylelint-scss/stylelint-scss/tree/master/src/rules/operator-no-newline-after): Rule is **disabled** to allow linebreaks after Sass operators

#### Stylistic rules
- [@stylistic/block-closing-brace-newline-after](https://github.com/stylelint-stylistic/stylelint-stylistic/tree/main/lib/rules/block-closing-brace-newline-after): Requires a newline after the closing brace of blocks
  * `if` and `else` at-rules are ignored
- [@stylistic/color-hex-case](https://github.com/stylelint-stylistic/stylelint-stylistic/tree/main/lib/rules/color-hex-case): Enforces lowercase for hex colors
- [@stylistic/declaration-colon-newline-after](https://github.com/stylelint-stylistic/stylelint-stylistic/tree/main/lib/rules/declaration-colon-newline-after): Rule is **disabled** to allow multi-line decleration without newline after the colon
- [@stylistic/indentation](https://github.com/stylelint-stylistic/stylelint-stylistic/tree/main/lib/rules/indentation): Enforces 2-spaces indentation
  * Indentation inside parentheses is ignored, as we increment the indentation for multi-line expressions
- [@stylistic/number-leading-zero](https://github.com/stylelint-stylistic/stylelint-stylistic/tree/main/lib/rules/number-leading-zero): Requires a leading zero for fractional numbers less than 1
- [@stylistic/property-case](https://github.com/stylelint-stylistic/stylelint-stylistic/tree/main/lib/rules/property-case): Enforces lowercase for properties
- [@stylistic/selector-pseudo-class-case](https://github.com/stylelint-stylistic/stylelint-stylistic/tree/main/lib/rules/selector-pseudo-class-case): Enforces lowercase for pseudo-class selectors
- [@stylistic/selector-pseudo-element-case](https://github.com/stylelint-stylistic/stylelint-stylistic/tree/main/lib/rules/selector-pseudo-element-case): Enforces lowercase for pseudo-element selectors
- [@stylistic/string-quotes](https://github.com/stylelint-stylistic/stylelint-stylistic/tree/main/lib/rules/string-quotes): Enforces double quotes around strings
- [@stylistic/unit-case](https://github.com/stylelint-stylistic/stylelint-stylistic/tree/main/lib/rules/unit-case): Enforces lowercase for units

#### Order rules
- [order/order](https://github.com/hudochenkov/stylelint-order/tree/master/rules/order): Enforces the order of content within declaration blocks: dollar variables, then declarations, then nested rules

#### Crisp rules
- [at-rule-conditional-parentheses](https://github.com/crisp-oss/stylelint-config-crisp/blob/master/rules/at-rule-conditional-parentheses.js): Enforces parentheses in conditions of at-rules (`@if`, `@elseif`, `@while`)
- [rule-empty-line-before](https://github.com/crisp-oss/stylelint-config-crisp/blob/master/rules/rule-empty-line-before.js): Requires an empty line before multi-line rules the same way [rule-empty-line-before](https://stylelint.io/user-guide/rules/rule-empty-line-before/) does, but properly handles Sass interpolation `#{}` in selectors

## License

stylelint-config-crisp is released under the MIT License. See the bundled LICENSE file for details.
