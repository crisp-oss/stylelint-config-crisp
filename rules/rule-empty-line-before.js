const stylelint = require("stylelint");

const ruleName = "crisp/rule-empty-line-before";
const messages = stylelint.utils.ruleMessages(ruleName, {
  expected: "Expected an empty line before the rule",
});

const ruleFunction = (primaryOption, secondaryOptions, context) => {
  return (root, result) => {
    const validOptions = stylelint.utils.validateOptions(result, ruleName, {
      actual: primaryOption,
      possible: [true]
    });

    if (!validOptions) {
      return;
    }

    root.walkRules((rule) => {
      // Skip root-level rules and the first child of any rule
      if (rule.parent.type === "root" || !rule.prev()) {
        return;
      }

      let previousNode = rule.prev();

      // Find the first relevant node (declaration, rule, or comment)
      while (previousNode && previousNode.type !== "comment") {
        if (previousNode.type === "decl" || previousNode.type === "rule") {
          const hasEmptyLineBefore = /(\r?\n\s*\r?\n\s*)/.test(rule.raws.before);

          if (!hasEmptyLineBefore) {
            stylelint.utils.report({
              ruleName,
              result,
              node: rule,
              message: messages.expected
            });
          }

          break;
        }

        previousNode = previousNode.prev();
      }
    });
  };
};

module.exports = stylelint.createPlugin(ruleName, ruleFunction);
