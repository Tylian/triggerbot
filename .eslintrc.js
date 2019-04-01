module.exports = {
    "parser": "babel-eslint",
    "parserOptions": {
        "ecmaVersion": 6
    },
    "env": {
        "node": true
    },
    "extends": "airbnb-base",
    "rules": {
        // Allow console in node
        "no-console": ["off"],

        // Require no space after keywords but before parenthesis
        "keyword-spacing": ["error", {
            "before": true,
            "after": true,
            "overrides": {
                "if": { "after": false },
                "for": { "after": false },
                "while": { "after": false }
            }
        }],

        // Personal preference: { "hello": "world" } object spacing
        "object-curly-spacing": ["error", "always"],

        // Early returns/guard statements
        "consistent-return": ["off"],
        "curly": ["error", "multi", "consistent"],
    }
};