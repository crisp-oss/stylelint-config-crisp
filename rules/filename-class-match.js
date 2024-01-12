const stylelint = require("stylelint");
const path = require("path");

const ruleName = "crisp/filename-class-match";
const messages = stylelint.utils.ruleMessages(ruleName, {
  expected: (className, fileName) => `Expected top-level class '${className}' to match file name '${fileName}'`
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
        prefix: [isString],
        suffix: [isString]
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

    // Identify the parent selector
    root.walkDecls(decl => {
      if (decl.prop === "$c") {
        // Remove leading `.` and `"`
        fileScopeClass = decl.value.replace(/^["']?\./, "").replace(/["']?$/, "");

        return;
      }
    });

    // No parent selector found, this will be caught by
    //   `selector-class-interpolation`
    if (!fileScopeClass) {
      return;
    }

    const fileName = path.basename(root.source.input.file, ".vue");
    const { prefix = "", suffix = "" } = secondaryOptions;
    const expectedClassName = `${prefix}${toKebabCase(fileName)}${suffix}`;

    // Skip `index` and `[[*]]` special filenames
    if (fileName === "index" || fileName.startsWith("[[")) {
      return;
    }

    if (fileScopeClass !== expectedClassName) {
      stylelint.utils.report({
        ruleName,
        result,
        node: root,
        message: messages.expected(fileScopeClass, expectedClassName)
      });
    }
  };
};

// Convert a string to kebab-case
function toKebabCase(str) {
  // Special kebab-case flavor:
  // * `CheckFailures` gets converted to `check-failures`
  // * `CheckSMTPFailures` gets converted to `check-smtp-failures`
  return str
    // Insert a hyphen between lowercase to uppercase transitions and before \
    //   a sequence of uppercase letters if followed by lowercase
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    // Replace spaces and multiple hyphens with a single hyphen
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    // Convert to lowercase
    .toLowerCase();
}

// Check if a value is a string
function isString(value) {
  return typeof value === "string";
}

module.exports = stylelint.createPlugin(ruleName, ruleFunction);
