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
      possible: [true, false]
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

    root.walkRules(rule => {
      // Skip non-Vue files
      if (!root.source.input.file.endsWith(".vue")) {
        return;
      }

      // Skip rules without selectors (e.g., @font-face, @keyframes)
      if (!rule.selector) {
        return;
      }

      // Resolve the actual selector name
      const resolvedSelector = resolveSelector(rule);
      const ignoreSelectors = secondaryOptions.ignoreSelectors || [];

      // Determine if the resolved selector should be ignored
      const isIgnored = ignoreSelectors.some(ignoreItem => {
        if (typeof ignoreItem === "string") {
          // Check if it's a stringified regex (e.g., "/pattern/")
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

      if (isIgnored) {
        return;
      }

      if (context.fix) {
        let newSelector = rule.selector;

        // Auto-fix for top-level class selector
        if (isTopLevelClassSelector(rule)) {
          const className = rule.selector.substring(1);
          newSelector = `#{$c}`;
          rule.root().prepend(`$c: ".${className}";\n`);
        } else {
          // Auto-fix logic for nested selectors
          newSelector = applyNestedSelectorFixes(rule, newSelector);
        }

        rule.selector = newSelector;
      } else {
        // Reporting logic for selectors not using Sass interpolation
        reportNonInterpolatedSelectors(rule, result, primaryOption);
      }
    });
  };
};

// Helper function to resolve the actual selector name
function resolveSelector(rule, parentSelector = "") {
  // Skip rules without selectors (e.g., @font-face, @keyframes)
  if (!rule.selector) {
    return "";
  }

  if (rule.selector.startsWith("&")) {
    const combinedSelector = (parentSelector + " " + rule.selector.replace("&", "")).trim();

    return rule.parent && rule.parent.type !== "root" ? resolveSelector(rule.parent, combinedSelector) : combinedSelector;
  }

  return parentSelector ? (parentSelector + " " + rule.selector).trim() : rule.selector;
}

// Helper function to check if a value is a RegExp or a string
function isStringOrRegExp(value) {
  return value instanceof RegExp || typeof value === "string";
}

// Check if the rule is a top-level class selector
function isTopLevelClassSelector(rule) {
  return rule.parent && rule.parent.type === "root" && rule.selector.startsWith(".");
}

// Apply fixes for nested selectors
function applyNestedSelectorFixes(rule, selector) {
  let newSelector = selector.replace(/&__([^ ,{]+)/g, "#{$c}__$1");
  const parentMatch = rule.parent && rule.parent.selector ? rule.parent.selector.match(/__([^ ,{]+)/) : null;
  if (parentMatch) {
    newSelector = newSelector.replace(/&-([^ ,{]+)/g, `#{$c}__${parentMatch[1]}-$1`);
  }
  return newSelector;
}

// Report selectors that do not use Sass interpolation
function reportNonInterpolatedSelectors(rule, result, primaryOption) {
  if (rule.selector.startsWith(".") || rule.selector.startsWith("&__") || rule.selector.startsWith("&.")) {
    const containsInterpolation = /#\{[^}]+\}/.test(rule.selector);
    const expected = primaryOption === true;

    if (containsInterpolation !== expected) {
      stylelint.utils.report({
        ruleName,
        result,
        node: rule,
        message: messages.expected,
        word: rule.selector
      });
    }
  }
}

module.exports = stylelint.createPlugin(ruleName, ruleFunction);