const sectionCommentRule = require("./utils/section-comment-rule");

const SIZE_QUERY_PATTERN = /(?:max|min)-(?:width|height)|(?:width|height)\s*[<>]=?/;

// Include all media queries and retain support for size-based container queries.
function isBreakpointAtRule(atRule) {
  const name = atRule.name.toLowerCase();

  if (name === "media") {
    return true;
  }

  if (name === "include") {
    return /^mq\s*\(/.test(atRule.params.trim());
  }

  if (name === "container") {
    return SIZE_QUERY_PATTERN.test(atRule.params);
  }

  return false;
}

module.exports = sectionCommentRule(
  "crisp/media-queries-comment",
  "MEDIA-QUERIES",
  isBreakpointAtRule
);
