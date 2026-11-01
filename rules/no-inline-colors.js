const stylelint = require("stylelint");
const path = require("path");

const ruleName = "crisp/no-inline-colors";
const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: (color) => {
    return `Unexpected inline color "${color}", use a CSS variable (rgb(var(--token)))`;
  },

  rejectedSource: (variable) => {
    return `Unexpected color source variable "${variable}", use the CSS variable equivalent`;
  }
});

const DEFAULT_IGNORE_FILES = [
  "colors.scss",
  "reset.scss"
];

const HEX_COLOR_PATTERN = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;

const SOURCE_VARIABLE_PATTERN = /\$color-source--[\w-]+/g;

const RGB_CHANNELS_PATTERN = /^\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*$/;

const SKIP_VALUE_PATTERN = /url\((?:[^)]*)\)|(["'])(?:\\.|(?!\1).)*\1/gi;

const FUNCTION_NAME_CHAR_PATTERN = /[\w.-]/;

const FUNCTION_NAME_PATTERN = /^[a-z_]/;

const VAR_FUNCTION_PATTERN = /\bvar\s*\(/;

const SASS_VARIABLE_PATTERN = /\$[\w-]+/;

const NUMERIC_ARGS_PATTERN = /^[\d.]+%?$/;

const COLOR_FUNCTIONS = new Set([
  "rgb",
  "rgba",
  "hsl",
  "hsla",
  "hwb",
  "lab",
  "lch",
  "oklab",
  "oklch",
  "color"
]);

const SASS_COLOR_FUNCTIONS = new Set([
  "lighten",
  "darken",
  "mix",
  "adjust-color",
  "scale-color",
  "change-color",
  "saturate",
  "desaturate",
  "grayscale",
  "complement",
  "invert",
  "opacify",
  "transparentize",
  "fade-in",
  "fade-out",
  "color.adjust",
  "color.mix",
  "color.scale",
  "color.change",
  "color.complement",
  "color.grayscale",
  "color.invert",
  "color.saturate",
  "color.desaturate"
]);

const CSS_FILTER_FUNCTIONS = new Set([
  "invert",
  "grayscale",
  "saturate"
]);

const NAMED_COLORS = new Set([
  "aliceblue",
  "antiquewhite",
  "aqua",
  "aquamarine",
  "azure",
  "beige",
  "bisque",
  "black",
  "blanchedalmond",
  "blue",
  "blueviolet",
  "brown",
  "burlywood",
  "cadetblue",
  "chartreuse",
  "chocolate",
  "coral",
  "cornflowerblue",
  "cornsilk",
  "crimson",
  "cyan",
  "darkblue",
  "darkcyan",
  "darkgoldenrod",
  "darkgray",
  "darkgreen",
  "darkgrey",
  "darkkhaki",
  "darkmagenta",
  "darkolivegreen",
  "darkorange",
  "darkorchid",
  "darkred",
  "darksalmon",
  "darkseagreen",
  "darkslateblue",
  "darkslategray",
  "darkslategrey",
  "darkturquoise",
  "darkviolet",
  "deeppink",
  "deepskyblue",
  "dimgray",
  "dimgrey",
  "dodgerblue",
  "firebrick",
  "floralwhite",
  "forestgreen",
  "fuchsia",
  "gainsboro",
  "ghostwhite",
  "gold",
  "goldenrod",
  "gray",
  "green",
  "greenyellow",
  "grey",
  "honeydew",
  "hotpink",
  "indianred",
  "indigo",
  "ivory",
  "khaki",
  "lavender",
  "lavenderblush",
  "lawngreen",
  "lemonchiffon",
  "lightblue",
  "lightcoral",
  "lightcyan",
  "lightgoldenrodyellow",
  "lightgray",
  "lightgreen",
  "lightgrey",
  "lightpink",
  "lightsalmon",
  "lightseagreen",
  "lightskyblue",
  "lightslategray",
  "lightslategrey",
  "lightsteelblue",
  "lightyellow",
  "lime",
  "limegreen",
  "linen",
  "magenta",
  "maroon",
  "mediumaquamarine",
  "mediumblue",
  "mediumorchid",
  "mediumpurple",
  "mediumseagreen",
  "mediumslateblue",
  "mediumspringgreen",
  "mediumturquoise",
  "mediumvioletred",
  "midnightblue",
  "mintcream",
  "mistyrose",
  "moccasin",
  "navajowhite",
  "navy",
  "oldlace",
  "olive",
  "olivedrab",
  "orange",
  "orangered",
  "orchid",
  "palegoldenrod",
  "palegreen",
  "paleturquoise",
  "palevioletred",
  "papayawhip",
  "peachpuff",
  "peru",
  "pink",
  "plum",
  "powderblue",
  "purple",
  "rebeccapurple",
  "red",
  "rosybrown",
  "royalblue",
  "saddlebrown",
  "salmon",
  "sandybrown",
  "seagreen",
  "seashell",
  "sienna",
  "silver",
  "skyblue",
  "slateblue",
  "slategray",
  "slategrey",
  "snow",
  "springgreen",
  "steelblue",
  "tan",
  "teal",
  "thistle",
  "tomato",
  "turquoise",
  "violet",
  "wheat",
  "white",
  "whitesmoke",
  "yellow",
  "yellowgreen"
]);

const NAMED_COLOR_PATTERN = new RegExp(
  `(?<![-$@#.\\w])(${Array.from(NAMED_COLORS).join("|")})(?![-$\\w])`,
  "gi"
);

const ruleFunction = (primaryOption, secondaryOptions = {}) => {
  return (root, result) => {
    const validOptions = stylelint.utils.validateOptions(result, ruleName, {
      actual: primaryOption,
      possible: [true]
    }, {
      actual: secondaryOptions,
      possible: {
        ignoreFiles: [isString]
      },
      optional: true
    });

    if (!validOptions) {
      return;
    }

    const ignoreFiles = secondaryOptions.ignoreFiles || DEFAULT_IGNORE_FILES;

    if (isIgnoredFile(root.source && root.source.input.file, ignoreFiles)) {
      return;
    }

    root.walkDecls((decl) => {
      if (decl.prop.startsWith("--") && RGB_CHANNELS_PATTERN.test(decl.value)) {
        report(decl, result, messages.rejected(decl.value.trim()), decl.value.trim());
      }

      checkValue(decl.value, decl, result);
    });

    root.walkAtRules((atRule) => {
      if (!atRule.params) {
        return;
      }

      checkValue(atRule.params, atRule, result);
    });
  };
};

// Scan a CSS/SCSS value for inline colors
function checkValue(value, node, result) {
  const skipRanges = getSkipRanges(value);

  findMatches(value, SOURCE_VARIABLE_PATTERN, skipRanges).forEach((color) => {
    report(node, result, messages.rejectedSource(color), color);
  });

  findMatches(value, HEX_COLOR_PATTERN, skipRanges).forEach((color) => {
    report(node, result, messages.rejected(color), color);
  });

  findMatches(value, NAMED_COLOR_PATTERN, skipRanges).forEach((color) => {
    report(node, result, messages.rejected(color), color);
  });

  forEachFunction(value, (name, args) => {
    if (isSkippedIndex(skipRanges, args.index)) {
      return;
    }

    if (SASS_COLOR_FUNCTIONS.has(name)) {
      // `invert()`, `grayscale()` and `saturate()` are also CSS filters
      if (CSS_FILTER_FUNCTIONS.has(name) && isNumericFunctionArgs(args.value)) {
        return;
      }

      report(node, result, messages.rejected(`${name}()`), name);

      return;
    }

    // `rgb(var(--token))` and `rgb($color)` wrap a variable, they are not inline colors
    if (!COLOR_FUNCTIONS.has(name) || hasVarFunction(args.value) || hasSassVariable(args.value)) {
      return;
    }

    // Hex and named colors inside the function are reported separately
    if (hasPattern(HEX_COLOR_PATTERN, args.value) || hasPattern(NAMED_COLOR_PATTERN, args.value)) {
      return;
    }

    report(node, result, messages.rejected(`${name}(${args.value.trim()})`), name);
  });
}

// Report a violation
function report(node, result, message, word) {
  stylelint.utils.report({
    ruleName,
    result,
    node,
    message,
    word
  });
}

// Ranges that should not be scanned (url() and quoted strings)
function getSkipRanges(value) {
  const ranges = [];
  let match;

  while ((match = SKIP_VALUE_PATTERN.exec(value)) !== null) {
    ranges.push([match.index, match.index + match[0].length]);
  }

  SKIP_VALUE_PATTERN.lastIndex = 0;

  return ranges;
}

// Collect regex matches outside skipped ranges
function findMatches(value, pattern, skipRanges) {
  const matches = [];
  let match;

  pattern.lastIndex = 0;

  while ((match = pattern.exec(value)) !== null) {
    if (!isSkippedIndex(skipRanges, match.index)) {
      matches.push(match[0]);
    }
  }

  pattern.lastIndex = 0;

  return matches;
}

// Walk function calls in a value (including nested ones)
function forEachFunction(value, callback) {
  for (let index = 0; index < value.length; index++) {
    if (value[index] !== "(") {
      continue;
    }

    let nameStart = index - 1;

    while (nameStart >= 0 && FUNCTION_NAME_CHAR_PATTERN.test(value[nameStart])) {
      nameStart--;
    }

    nameStart++;

    const name = value.slice(nameStart, index).toLowerCase();

    if (!name || !FUNCTION_NAME_PATTERN.test(name)) {
      continue;
    }

    let depth = 1;
    let end = index + 1;

    while (end < value.length && depth > 0) {
      if (value[end] === "(") {
        depth++;
      } else if (value[end] === ")") {
        depth--;
      }

      end++;
    }

    callback(name, {
      value: value.slice(index + 1, end - 1),
      index: index + 1
    });
  }
}

// Check if a file name is ignored
function isIgnoredFile(filePath, ignoreFiles) {
  if (!filePath) {
    return false;
  }

  const fileName = path.basename(filePath);

  return ignoreFiles.includes(fileName);
}

function hasVarFunction(value) {
  return VAR_FUNCTION_PATTERN.test(value);
}

function hasSassVariable(value) {
  return SASS_VARIABLE_PATTERN.test(value);
}

function isNumericFunctionArgs(value) {
  const first = value.trim().split(",")[0].trim();

  return NUMERIC_ARGS_PATTERN.test(first);
}

function hasPattern(pattern, value) {
  pattern.lastIndex = 0;

  const matches = pattern.test(value);

  pattern.lastIndex = 0;

  return matches;
}

function isSkippedIndex(ranges, index) {
  return ranges.some(([start, end]) => {
    return index >= start && index < end;
  });
}

function isString(value) {
  return typeof value === "string";
}

module.exports = stylelint.createPlugin(ruleName, ruleFunction);
