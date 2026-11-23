const sectionCommentRule = require("./utils/section-comment-rule");

module.exports = sectionCommentRule(
  "crisp/keyframes-comment",
  "KEYFRAMES",
  (atRule) => /^(?:-[a-z]+-)?keyframes$/i.test(atRule.name)
);
