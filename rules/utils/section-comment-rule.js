const stylelint = require("stylelint");
const path = require("node:path");
const { existsSync } = require("node:fs");

// Require one section heading before the first matching at-rule in each block.
module.exports = (ruleName, heading, isSectionAtRule, ignoredAncestorAtRules = []) => {
  const text = `--> ${heading} <--`;
  const commentLine = `// ${text}`;
  const looseHeading = heading.replace(/-/g, "[-\\s]");
  const looseCommentPattern = new RegExp(`^\\s*(?:-->\\s*)?${looseHeading}(?:\\s*<--)?\\s*$`, "i");
  const messages = stylelint.utils.ruleMessages(ruleName, {
    expected: `Expected "${commentLine}" comment before the first section at-rule`,
    expectedIndent: `Expected "${commentLine}" comment to match at-rule indentation`,
    expectedEmptyLine: `Expected an empty line after "${commentLine}"`
  });

  const ruleFunction = (primaryOption, secondaryOptions = {}) => {
    return (root, result) => {
      if (!stylelint.utils.validateOptions(result, ruleName, {
        actual: primaryOption,
        possible: [true]
      }, {
        actual: secondaryOptions,
        possible: {
          ignoreFiles: (value) => Array.isArray(secondaryOptions.ignoreFiles) && typeof value === "string"
        },
        optional: true
      })) {
        return;
      }

      const filePath = root.source && root.source.input.file;

      if (filePath && isIgnoredFile(filePath, secondaryOptions.ignoreFiles || [])) {
        return;
      }

      root.walkAtRules((atRule) => {
        if (!isSectionAtRule(atRule) || hasPreviousSectionAtRule(atRule, isSectionAtRule)) {
          return;
        }

        // Nested sections inherit their heading; ignored ancestors need none.
        let parent = atRule.parent;

        while (parent) {
          if (parent.type === "atrule" &&
              (isSectionAtRule(parent) || ignoredAncestorAtRules.includes(parent.name.toLowerCase()))) {
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

function isIgnoredFile(filePath, ignoreFiles) {
  if (ignoreFiles.length === 0) {
    return false;
  }

  let directory = path.dirname(filePath);

  while (!existsSync(path.join(directory, ".git"))) {
    const parent = path.dirname(directory);

    if (parent === directory) {
      directory = process.cwd();
      break;
    }

    directory = parent;
  }

  return ignoreFiles.some((file) => path.resolve(directory, file) === path.resolve(filePath));
}

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
