const sectionCommentRule = require("./utils/section-comment-rule");

module.exports = sectionCommentRule(
  "crisp/mixins-comment",
  "MIXINS",
  (atRule) => /^mixin$/i.test(atRule.name)
);
