const stylelint = require("stylelint");

const ruleName = "crisp/media-queries-comment";

const MEDIA_QUERIES_COMMENT = "--> MEDIA-QUERIES <--";
const MEDIA_QUERIES_COMMENT_LINE = `// ${MEDIA_QUERIES_COMMENT}`;

const SIZE_QUERY_PATTERN = /(?:max|min)-(?:width|height)|(?:width|height)\s*[<>]=?/;
const LOOSE_MEDIA_QUERIES_COMMENT_PATTERN = /^\s*(?:-->\s*)?MEDIA[-\s]QUERIES(?:\s*<--)?\s*$/i;

const messages = stylelint.utils.ruleMessages(ruleName, {
  expected: `Expected "${MEDIA_QUERIES_COMMENT_LINE}" comment before the first media query`,
  expectedIndent: `Expected "${MEDIA_QUERIES_COMMENT_LINE}" comment to match media query indentation`
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

    root.walkAtRules((atRule) => {
      if (!isBreakpointAtRule(atRule) || !isFirstBreakpointAtRule(atRule)) {
        return;
      }

      // Nested breakpoint queries inherit the parent section comment
      if (hasBreakpointAtRuleAncestor(atRule)) {
        return;
      }

      const indent = getNodeIndent(atRule);
      const previousNode = atRule.prev();

      if (isExactMediaQueriesComment(previousNode)) {
        if (getNodeIndent(previousNode) !== indent) {
          if (context.fix) {
            setNodeIndent(previousNode, indent);
          } else {
            stylelint.utils.report({
              ruleName,
              result,
              node: previousNode,
              message: messages.expectedIndent
            });
          }
        }

        ensureEmptyLineBefore(atRule, indent, context);

        return;
      }

      if (context.fix) {
        if (isLooseMediaQueriesComment(previousNode)) {
          previousNode.text = MEDIA_QUERIES_COMMENT;
          previousNode.raws.inline = true;
          previousNode.raws.left = " ";
          previousNode.raws.right = "";
          previousNode.raws.text = MEDIA_QUERIES_COMMENT;

          setNodeIndent(previousNode, indent);
          ensureEmptyLineBefore(atRule, indent, context);

          return;
        }

        insertMediaQueriesComment(atRule, indent);

        return;
      }

      stylelint.utils.report({
        ruleName,
        result,
        node: atRule,
        message: messages.expected
      });
    });
  };
};

// Check if an at-rule is a breakpoint media / container query
function isBreakpointAtRule(atRule) {
  if (atRule.name === "media") {
    return SIZE_QUERY_PATTERN.test(atRule.params);
  }

  if (atRule.name === "include") {
    return /^mq\s*\(/.test(atRule.params.trim());
  }

  if (atRule.name === "container") {
    return SIZE_QUERY_PATTERN.test(atRule.params);
  }

  return false;
}

// Check if this is the first breakpoint at-rule among siblings
function isFirstBreakpointAtRule(atRule) {
  let previousNode = atRule.prev();

  while (previousNode) {
    if (previousNode.type === "atrule" && isBreakpointAtRule(previousNode)) {
      return false;
    }

    previousNode = previousNode.prev();
  }

  return true;
}

// Check if a breakpoint at-rule ancestor already opened the section
function hasBreakpointAtRuleAncestor(atRule) {
  let parent = atRule.parent;

  while (parent) {
    if (parent.type === "atrule" && isBreakpointAtRule(parent)) {
      return true;
    }

    parent = parent.parent;
  }

  return false;
}

// Check if a node is the canonical media-queries section comment
function isExactMediaQueriesComment(node) {
  return node && node.type === "comment" && node.text.trim() === MEDIA_QUERIES_COMMENT;
}

// Check if a node is a media-queries section comment in any known format
function isLooseMediaQueriesComment(node) {
  return node && node.type === "comment" && LOOSE_MEDIA_QUERIES_COMMENT_PATTERN.test(node.text);
}

// Return the indentation of a node
function getNodeIndent(node) {
  const before = node.raws.before || "";
  const match = before.match(/(?:\r?\n)([ \t]*)$/);

  if (match) {
    return match[1];
  }

  return "";
}

// Set the indentation of a node
function setNodeIndent(node, indent) {
  const before = node.raws.before || "";

  if (/(?:\r?\n)[ \t]*$/.test(before)) {
    node.raws.before = before.replace(/[ \t]*$/, indent);
  } else {
    node.raws.before = `\n${indent}`;
  }
}

// Ensure an empty line between the section comment and the at-rule
function ensureEmptyLineBefore(atRule, indent, context) {
  if (/(\r?\n\s*\r?\n)/.test(atRule.raws.before || "")) {
    setNodeIndent(atRule, indent);

    return;
  }

  if (context.fix) {
    atRule.raws.before = `\n\n${indent}`;
  }
}

// Insert the media-queries section comment before the at-rule
function insertMediaQueriesComment(atRule, indent) {
  const before = atRule.raws.before || "\n";
  const prefix = before.replace(/[ \t]*$/, "");

  atRule.raws.before = `${prefix}${indent}${MEDIA_QUERIES_COMMENT_LINE}\n\n${indent}`;
}

module.exports = stylelint.createPlugin(ruleName, ruleFunction);
