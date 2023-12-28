const stylelint = require("stylelint");

const ruleName = "crisp/at-rule-conditional-parentheses";
const messages = stylelint.utils.ruleMessages(ruleName, {
  expected: "Expected parentheses in \"@if\", \"@else-if\" and \"@while\" statements",
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

    root.walkAtRules((rule) => {
      let elseIf = false;

      // An `@else if` is a regular `@else` with `if` in its params
      if (rule.name === "else" && rule.params.startsWith("if ")) {
        elseIf = true;
      }

      if (["if", "while"].includes(rule.name) || elseIf === true) {
        let params = rule.params;

        if (elseIf === true) {
          params = params.slice(3);
        }

        if (!params.startsWith("(") || !params.endsWith(")")) {
          stylelint.utils.report({
            ruleName,
            result,
            node: rule,
            message: messages.expected
          });
        }
      }
    });
  };
};

module.exports = stylelint.createPlugin(ruleName, ruleFunction);