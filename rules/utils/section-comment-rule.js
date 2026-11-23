const stylelint = require("stylelint");

// Require one section heading before the first matching at-rule in each block.
module.exports = (ruleName, heading, isSectionAtRule) => {
  const text = `--> ${heading} <--`;
  const commentLine = `// ${text}`;
  const looseHeading = heading.replace(/-/g, "[-\\s]");
  const looseCommentPattern = new RegExp(`^\\s*(?:-->\\s*)?${looseHeading}(?:\\s*<--)?\\s*$`, "i");
  const messages = stylelint.utils.ruleMessages(ruleName, {
    expected: `Expected "${commentLine}" comment before the first section at-rule`,
    expectedIndent: `Expected "${commentLine}" comment to match at-rule indentation`,
    expectedEmptyLine: `Expected an empty line after "${commentLine}"`
  });

  const ruleFunction = (primaryOption) => {
    return (root, result) => {
      if (!stylelint.utils.validateOptions(result, ruleName, {
        actual: primaryOption,
        possible: [true]
      })) {
        return;
      }

      root.walkAtRules((atRule) => {
        if (!isSectionAtRule(atRule) || hasPreviousSectionAtRule(atRule, isSectionAtRule)) {
          return;
        }

        // Nested queries inherit the heading of the containing section.
        let parent = atRule.parent;

        while (parent) {
          if (parent.type === "atrule" && isSectionAtRule(parent)) {
            return;
          }

          parent = parent.parent;
        }

        const indent = getIndent(atRule);
        const previousNode = atRule.prev();
        const isComment = previousNode && previousNode.type === "comment";
        const isExactComment = isComment &&
          previousNode.text === text &&
          previousNode.raws.inline === true &&
          previousNode.raws.left === " " &&
          !previousNode.raws.right;
        const newline = root.source.input.css.includes("\r\n") ? "\r\n" : "\n";
        const report = (message, fix, node = atRule) => {
          stylelint.utils.report({ ruleName, result, node, message, fix });
        };

        if (!isExactComment) {
          report(messages.expected, () => {
            const raws = { inline: true, left: " ", right: "", text };

            if (isComment && looseCommentPattern.test(previousNode.text)) {
              previousNode.text = text;
              Object.assign(previousNode.raws, raws);
              setIndent(previousNode, indent, newline);
            } else {
              atRule.parent.insertBefore(atRule, {
                text,
                source: atRule.source,
                raws: { ...raws, before: atRule.raws.before || "" }
              });
            }

            atRule.raws.before = `${newline}${newline}${indent}`;
          });

          return;
        }

        if (getIndent(previousNode) !== indent) {
          report(messages.expectedIndent, () => {
            setIndent(previousNode, indent, newline);
          }, previousNode);
        }

        if (!/^(?:\r?\n)[ \t]*(?:\r?\n)[ \t]*$/.test(atRule.raws.before || "")) {
          report(messages.expectedEmptyLine, () => {
            atRule.raws.before = `${newline}${newline}${indent}`;
          });
        }
      });
    };
  };

  ruleFunction.ruleName = ruleName;
  ruleFunction.messages = messages;
  ruleFunction.meta = { fixable: true };

  return stylelint.createPlugin(ruleName, ruleFunction);
};

function hasPreviousSectionAtRule(atRule, isSectionAtRule) {
  let previousNode = atRule.prev();

  while (previousNode) {
    if (previousNode.type === "atrule" && isSectionAtRule(previousNode)) {
      return true;
    }

    previousNode = previousNode.prev();
  }

  return false;
}

function getIndent(node) {
  return (node.raws.before || "").match(/(?:^|\r?\n)([ \t]*)$/)?.[1] || "";
}

function setIndent(node, indent, newline) {
  const before = node.raws.before || "";

  node.raws.before = /(?:^|\n)[ \t]*$/.test(before)
    ? before.replace(/[ \t]*$/, indent)
    : `${newline}${indent}`;
}
