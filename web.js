module.exports = {
  overrides: [
    {
      "files": ["colors.scss", "reset.scss"],
      "rules": {
        "function-disallowed-list": null
      }
    }
  ],

  extends: [
    "./index.js"
  ],

  rules: {
    // General rules
    "declaration-no-important": true,
    "declaration-property-value-allowed-list": {
      "z-index": ["/^z\\(/", "auto", "0"]
    },
    "function-disallowed-list": [
      "rgb",
      "rgba",
      "hsl",
      "hsla"
    ],
    "max-nesting-depth": [
      3,

      {
        "ignoreAtRules": ["include", "media"]
      }
    ],
    "media-feature-name-allowed-list": [
      "min-width",
      "hover",
      "pointer",
      "prefers-reduced-motion",
      "prefers-contrast",
      "forced-colors"
    ]
  }
};
