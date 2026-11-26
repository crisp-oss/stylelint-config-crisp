# Stylelint Config Crisp

[![Build and Release](https://github.com/crisp-oss/stylelint-config-crisp/workflows/Build%20and%20Release/badge.svg)](https://github.com/crisp-oss/stylelint-config-crisp/actions?query=workflow%3A%22Build+and+Release%22) [![NPM](https://img.shields.io/npm/v/stylelint-config-crisp.svg)](https://www.npmjs.com/package/stylelint-config-crisp) [![Downloads](https://img.shields.io/npm/dt/stylelint-config-crisp.svg)](https://www.npmjs.com/package/stylelint-config-crisp)

A [Stylelint](https://stylelint.io/) configuration that enforces Crisp's CSS rules.

**😘 Maintainer**: [@eliottvincent](https://github.com/eliottvincent)

## Usage

The package provides two configurations:
* `stylelint-config-crisp`: base rules for all Crisp projects
* `stylelint-config-crisp/web`: base rules, plus stricter rules for web projects

Just extend the desired configuration in your Stylelint config object:
```javascript
{
  "extends": ["stylelint-config-crisp"]
  // OR "extends": ["stylelint-config-crisp/web"]
}
```

## Documentation

This is the list of configured syntaxes, plugins and rules used by Stylelint Config Crisp, and what they do.

Each item has emojis denoting:
* 🟠: enabled in `stylelint-config-crisp`
* 🟢: enabled in `stylelint-config-crisp/web`

### Custom syntaxes
| Name | Description | 🟠 | 🟢 |
| :- | :- | :- | :- |
| [postcss-html](https://github.com/ota-meshi/postcss-html) | Allows to parse `<style>` tags from Vue files | 🟠 | 🟢 |

### Configurations
| Name | Description | 🟠 | 🟢 |
| :- | :- | :- | :- |
| [@stylistic/stylelint-config](https://github.com/stylelint-stylistic/stylelint-config) | Stylistic rules deprecated in Stylelint 15 | 🟠 | 🟢 |
| [stylelint-config-standard-scss](https://github.com/stylelint-scss/stylelint-config-standard-scss) | Standard rules specific to SCSS syntax | 🟠 | 🟢 |

### Plugins
| Name | Description | 🟠 | 🟢 |
| :- | :- | :- | :- |
| [stylelint-order](https://github.com/hudochenkov/stylelint-order) | Order-related linting rules | 🟠 | 🟢 |

### Rules

#### General rules

| Name | Description | 🟠 | 🟢 |
| :- | :- | :- | :- |
| [alpha-value-notation](https://stylelint.io/user-guide/rules/alpha-value-notation/) | Requires number notation for alpha values | 🟠 | 🟢 |
| [at-rule-empty-line-before](https://stylelint.io/user-guide/rules/at-rule-empty-line-before/) | Requires an empty line before at-rules, except blockless ones | 🟠 | 🟢 |
| [block-no-empty](https://stylelint.io/user-guide/rules/block-no-empty/) | Disallows empty blocks | 🟠 | 🟢 |
| [color-function-notation](https://stylelint.io/user-guide/rules/color-function-notation/) | Requires legacy notation for color functions | 🟠 | 🟢 |
| [color-hex-length](https://stylelint.io/user-guide/rules/color-hex-length/) | Hex colors must use long notation | 🟠 | 🟢 |
| [color-no-invalid-hex](https://stylelint.io/user-guide/rules/color-no-invalid-hex/) | Disallows invalid hex colors | 🟠 | 🟢 |
| [custom-property-pattern](https://stylelint.io/user-guide/rules/custom-property-pattern/) | Requires kebab-case for CSS variables | 🟠 | 🟢 |
| [declaration-block-no-redundant-longhand-properties](https://stylelint.io/user-guide/rules/declaration-block-no-redundant-longhand-properties/) | Disallows redundant longhand properties, except for `inset` and `overflow` | 🟠 | 🟢 |
| [declaration-block-single-line-max-declarations](https://stylelint.io/user-guide/rules/declaration-block-single-line-max-declarations/) | Allows only 1 declaration per line | 🟠 | 🟢 |
| [declaration-property-value-disallowed-list](https://stylelint.io/user-guide/rules/declaration-property-value-disallowed-list/) | Requires `0` instead of `none` for borders and outlines | 🟠 | 🟢 |
| [declaration-no-important](https://stylelint.io/user-guide/rules/declaration-no-important/) | Disallows `!important` within declarations |  | 🟢 |
| [declaration-property-value-allowed-list](https://stylelint.io/user-guide/rules/declaration-property-value-allowed-list/) | Restricts `z-index` values to `z()`, `auto` and `0` |  | 🟢 |
| [function-disallowed-list](https://stylelint.io/user-guide/rules/function-disallowed-list/) | Disallows RGB and HSL functions, except in color and reset files |  | 🟢 |
| [keyframe-block-no-duplicate-selectors](https://stylelint.io/user-guide/rules/keyframe-block-no-duplicate-selectors/) | Rule is **disabled** to allow cascade selectors within keyframes | 🟠 | 🟢 |
| [max-nesting-depth](https://stylelint.io/user-guide/rules/max-nesting-depth/) | Limits nesting depth to 3, ignoring `@include` and `@media` |  | 🟢 |
| [media-feature-name-allowed-list](https://stylelint.io/user-guide/rules/media-feature-name-allowed-list/) | Only allows `min-width` (mobile-first), `hover`, `pointer`, `prefers-reduced-motion`, `prefers-contrast` and `forced-colors` media features |  | 🟢 |
| [number-max-precision](https://stylelint.io/user-guide/rules/number-max-precision/) | Allows a maximum of 5 decimal places in numbers | 🟠 | 🟢 |
| [media-feature-range-notation](https://stylelint.io/user-guide/rules/media-feature-range-notation/) | Media feature ranges must use the `prefix` notation | 🟠 | 🟢 |
| [no-descending-specificity](https://stylelint.io/user-guide/rules/no-descending-specificity/) | Rule is **disabled** to allow any specificity order | 🟠 | 🟢 |
| [rule-empty-line-before](https://stylelint.io/user-guide/rules/rule-empty-line-before/) | Requires an empty line before multi-line rules, except first-nested rules and rules after comments | 🟠 | 🟢 |
| [selector-class-pattern](https://stylelint.io/user-guide/rules/selector-class-pattern/) | Rule is **disabled** as it conflicts with our BEM notation in class selectors | 🟠 | 🟢 |
| [selector-not-notation](https://stylelint.io/user-guide/rules/selector-not-notation/) | Enforces simple notation for `:not()` pseudo-class selectors | 🟠 | 🟢 |
| [selector-pseudo-class-no-unknown](https://stylelint.io/user-guide/rules/selector-pseudo-class-no-unknown/) | Disallows unknown pseudo-class selectors | 🟠 | 🟢 |
| [selector-pseudo-element-colon-notation](https://stylelint.io/user-guide/rules/selector-pseudo-element-colon-notation/) | Pseudo-elements must use the single colon notation | 🟠 | 🟢 |

#### SCSS rules

| Name | Description | 🟠 | 🟢 |
| :- | :- | :- | :- |
| [scss/at-rule-conditional-no-parentheses](https://github.com/stylelint-scss/stylelint-scss/tree/master/src/rules/at-rule-conditional-no-parentheses) | Rule is **disabled** to allow parentheses in conditional at-rules | 🟠 | 🟢 |
| [scss/dollar-variable-empty-line-before](https://github.com/stylelint-scss/stylelint-scss/tree/master/src/rules/dollar-variable-empty-line-before) | Rule is **disabled** to allow empty lines between logical variable blocks | 🟠 | 🟢 |
| [scss/load-no-partial-leading-underscore](https://github.com/stylelint-scss/stylelint-scss/tree/master/src/rules/load-no-partial-leading-underscore) | Rule is **disabled** to allow leading underscores in imports | 🟠 | 🟢 |
| [scss/map-keys-quotes](https://github.com/stylelint-scss/stylelint-scss/tree/master/src/rules/map-keys-quotes) | Requires quoted keys in maps | 🟠 | 🟢 |
| [scss/no-global-function-names](https://github.com/stylelint-scss/stylelint-scss/tree/master/src/rules/no-global-function-names) | Rule is **disabled** to allow global Sass functions | 🟠 | 🟢 |
| [scss/operator-no-newline-after](https://github.com/stylelint-scss/stylelint-scss/tree/master/src/rules/operator-no-newline-after) | Rule is **disabled** to allow linebreaks after Sass operators | 🟠 | 🟢 |

#### Stylistic rules

| Name | Description | 🟠 | 🟢 |
| :- | :- | :- | :- |
| [@stylistic/block-closing-brace-newline-after](https://github.com/stylelint-stylistic/stylelint-stylistic/tree/main/lib/rules/block-closing-brace-newline-after) | Requires a newline after closing braces, except for `if` and `else` at-rules | 🟠 | 🟢 |
| [@stylistic/color-hex-case](https://github.com/stylelint-stylistic/stylelint-stylistic/tree/main/lib/rules/color-hex-case) | Enforces lowercase for hex colors | 🟠 | 🟢 |
| [@stylistic/declaration-colon-newline-after](https://github.com/stylelint-stylistic/stylelint-stylistic/tree/main/lib/rules/declaration-colon-newline-after) | Rule is **disabled** to allow multi-line declarations without a newline after the colon | 🟠 | 🟢 |
| [@stylistic/indentation](https://github.com/stylelint-stylistic/stylelint-stylistic/tree/main/lib/rules/indentation) | Enforces 2-space indentation, ignoring parentheses | 🟠 | 🟢 |
| [@stylistic/number-leading-zero](https://github.com/stylelint-stylistic/stylelint-stylistic/tree/main/lib/rules/number-leading-zero) | Requires a leading zero for fractional numbers less than 1 | 🟠 | 🟢 |
| [@stylistic/property-case](https://github.com/stylelint-stylistic/stylelint-stylistic/tree/main/lib/rules/property-case) | Enforces lowercase for properties | 🟠 | 🟢 |
| [@stylistic/selector-pseudo-class-case](https://github.com/stylelint-stylistic/stylelint-stylistic/tree/main/lib/rules/selector-pseudo-class-case) | Enforces lowercase for pseudo-class selectors | 🟠 | 🟢 |
| [@stylistic/selector-pseudo-element-case](https://github.com/stylelint-stylistic/stylelint-stylistic/tree/main/lib/rules/selector-pseudo-element-case) | Enforces lowercase for pseudo-element selectors | 🟠 | 🟢 |
| [@stylistic/string-quotes](https://github.com/stylelint-stylistic/stylelint-stylistic/tree/main/lib/rules/string-quotes) | Enforces double quotes around strings | 🟠 | 🟢 |
| [@stylistic/unit-case](https://github.com/stylelint-stylistic/stylelint-stylistic/tree/main/lib/rules/unit-case) | Enforces lowercase for units | 🟠 | 🟢 |

#### Order rules

| Name | Description | 🟠 | 🟢 |
| :- | :- | :- | :- |
| [order/order](https://github.com/hudochenkov/stylelint-order/tree/master/rules/order) | Orders dollar variables before declarations, then nested rules | 🟠 | 🟢 |

#### Crisp rules

| Name | Description | 🟠 | 🟢 |
| :- | :- | :- | :- |
| [at-rule-conditional-parentheses](https://github.com/crisp-oss/stylelint-config-crisp/blob/master/rules/at-rule-conditional-parentheses.js) | Enforces parentheses in conditions of at-rules (`@if`, `@elseif`, `@while`) | 🟠 | 🟢 |
| [filename-class-match](https://github.com/crisp-oss/stylelint-config-crisp/blob/master/rules/filename-class-match.js) | Requires class names to match the filename in Vue files | 🟠 | 🟢 |
| [keyframes-comment](https://github.com/crisp-oss/stylelint-config-crisp/blob/master/rules/keyframes-comment.js) | Requires a section comment before keyframes, except inside mixins | 🟠 | 🟢 |
| [media-queries-comment](https://github.com/crisp-oss/stylelint-config-crisp/blob/master/rules/media-queries-comment.js) | Requires a section comment before media queries, except inside mixins | 🟠 | 🟢 |
| [mixins-comment](https://github.com/crisp-oss/stylelint-config-crisp/blob/master/rules/mixins-comment.js) | Requires a section comment before mixin definitions | 🟠 | 🟢 |
| [no-inline-colors](https://github.com/crisp-oss/stylelint-config-crisp/blob/master/rules/no-inline-colors.js) | Disallows inline colors in favor of CSS variables | 🟠 | 🟢 |
| [rule-empty-line-before](https://github.com/crisp-oss/stylelint-config-crisp/blob/master/rules/rule-empty-line-before.js) | Requires an empty line before multi-line rules, with support for Sass interpolation | 🟠 | 🟢 |
| [selector-class-interpolation](https://github.com/crisp-oss/stylelint-config-crisp/blob/master/rules/selector-class-interpolation.js) | Requires Sass interpolation in Vue class selectors | 🟠 | 🟢 |

## License

stylelint-config-crisp is released under the MIT License. See the bundled LICENSE file for details.
