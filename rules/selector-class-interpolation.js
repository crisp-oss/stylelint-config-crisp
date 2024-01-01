const stylelint = require("stylelint");

const ruleName = "crisp/selector-class-interpolation";
const messages = stylelint.utils.ruleMessages(ruleName, {
  expected: "Expected Sass interpolation in class selector"
});

const ruleFunction = (primaryOption, secondaryOptions = {}, context) => {
  return (root, result) => {
    // Validate options for the rule
    const validOptions = stylelint.utils.validateOptions(result, ruleName, {
      actual: primaryOption,
      possible: [true]
    }, {
      actual: secondaryOptions,
      possible: {
        ignoreSelectors: [isStringOrRegExp]
      },
      optional: true
    });

    if (!validOptions) {
      return;
    }

    // Skip non-Vue files
    if (!root.source.input.file.endsWith(".vue")) {
      return;
    }

    let fileScopeClass;

    // First pass (identify the parent selector - via variable)
    root.walkDecls(decl => {
      if (decl.prop === "$c") {
        // Remove leading `.` and `"`
        fileScopeClass = decl.value.replace(/^["']?\./, "").replace(/["']?$/, "");

        return;
      }
    });

    if (!fileScopeClass) {
      // Second pass (identify the parent selector - via first class)
      root.walkRules(rule => {
        if (rule.parent && rule.parent.type === "root") {
          const fileScopeClassMatch = rule.selector.match(/^\.[\w-]+/);

          if (fileScopeClassMatch) {
            // Capture the class name without the dot
            fileScopeClass = fileScopeClassMatch[0].substring(1);

            return;
          }
        }
      });
    }

    // Third pass (check all class selectors)
    root.walkRules(rule => {
      // Skip rules without selectors (e.g. @font-face, @keyframes, variables)
      if (!rule.selector) {
        return;
      }

      // Skip selector if ignored via rule options
      if (isSelectorIgnored(rule, secondaryOptions.ignoreSelectors || [])) {
        return;
      }

      // Skip selectors other than `.*`, `&__*` , `&-*` or `&.*`
      if (!rule.selector.startsWith(".") &&
          !rule.selector.startsWith("&__") &&
          !(rule.selector.startsWith("&-") && !rule.selector.startsWith("&--")) &&
          !rule.selector.startsWith("&.")
      ) {
        return;
      }

      let isInterpolated = isInterpolatedClassSelector(rule);

      if (!isInterpolated) {
        // Skip classes elements outside of CSS file scope
        if (fileScopeClass) {
          if (rule.selector.startsWith(".") &&
            !rule.selector.startsWith(`.${fileScopeClass}`)) {
            return;
          }

          if (rule.selector.startsWith("&.") &&
            !rule.selector.startsWith(`&.${fileScopeClass}`)) {
            return;
          }
        }

        if (context.fix) {
          fixSelector(rule);
        } else {
          reportSelector(rule, result);
        }
      }
    });
  };
};

// Helper function to resolve the actual selector name
function resolveSelector(rule, parentSelector = "") {
  // Skip rules without selectors (e.g. @font-face, @keyframes)
  if (!rule.selector) {
    return "";
  }

  if (rule.selector.startsWith("&")) {
    const combinedSelector = (parentSelector + " " + rule.selector.replace("&", "")).trim();

    // Recurse?
    if (rule.parent && rule.parent.type !== "root") {
      return resolveSelector(rule.parent, combinedSelector);
    }

    return combinedSelector;
  }

  return parentSelector ? (parentSelector + " " + rule.selector).trim() : rule.selector;
}

// Helper function to check if a value is a RegExp or a string
function isStringOrRegExp(value) {
  return value instanceof RegExp || typeof value === "string";
}

// Check if selector is ignored via options
function isSelectorIgnored(rule, ignoreSelectors = []) {
  // Resolve the actual selector name
  const resolvedSelector = resolveSelector(rule);

  const isIgnored = ignoreSelectors.some(ignoreItem => {
    if (typeof ignoreItem === "string") {
      // Check if it's a stringified regex (e.g. "/pattern/")
      if (ignoreItem.startsWith("/") && ignoreItem.endsWith("/")) {
        const regexPattern = ignoreItem.slice(1, -1);
        const regex = new RegExp(regexPattern);

        return regex.test(resolvedSelector);
      }

      // It's a regular string
      return ignoreItem === resolvedSelector;
    }

    // It's a real RegExp
    return ignoreItem.test(resolvedSelector);
  });

  return isIgnored;
}

// Check if the rule is a top-level class selector
function isTopLevelClassSelector(rule) {
  return rule.parent && rule.parent.type === "root" && rule.selector.startsWith(".");
}

// Check if selector uses Sass interpolation
function isInterpolatedClassSelector(rule) {
  return /#\{[^}]+\}/.test(rule.selector);
}

// Apply fixes for nested selector
function fixNestedSelector(rule, selector) {
  let newSelector = selector;

  if (selector.startsWith("&__")) {
    // Transform `&__foo` to `#{$c}__foo`
    selector.replace(/&__([^ ,{]+)/g, "#{$c}__$1");
  }

  if (selector.startsWith("&-")) {
    const parentMatch = (rule.parent && rule.parent.selector)
      ? rule.parent.selector.match(/__([^ ,{]+)/)
      : null;

    if (parentMatch) {
      // Transform
      // ```
      // &__foo {
      //   &-bar {
      // ```
      // to
      // ```
      // #{$c}__foo {
      //   #{$c}__foo-bar {
      // ```
      newSelector = newSelector.replace(/&-([^ ,{]+)/g, `#{$c}__${parentMatch[1]}-$1`);
    }
  }

  return newSelector;
}

// Fix selector
function fixSelector(rule) {
  let newSelector = rule.selector;

  if (isTopLevelClassSelector(rule)) {
    newSelector = `#{$c}`;

    rule.root().prepend(`$c: "${rule.selector}";\n`);
  } else {
    // Auto-fix nested selector
    newSelector = fixNestedSelector(rule, newSelector);
  }

  rule.selector = newSelector;
}

// Report selectors
function reportSelector(rule, result) {
  stylelint.utils.report({
    ruleName,
    result,
    node: rule,
    message: messages.expected,
    word: rule.selector
  });
}

module.exports = stylelint.createPlugin(ruleName, ruleFunction);