import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import pluginReactHooks from "eslint-plugin-react-hooks";

export default [
  {
    ignores: ["dist/", "node_modules/", "client/dist/"],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      // This is required for type-aware rules
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    }
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked, // Use the stricter type-checked config
  {
    ...pluginReactConfig,
    settings: {
      react: {
        version: "detect",
      }
    }
  },
  // React Hooks specific config
  {
    plugins: {
      'react-hooks': pluginReactHooks,
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
    },
  },
  // Your custom, strict rule overrides
  {
    rules: {
      // TypeScript - Stricter rules
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/consistent-type-imports": "error",
      
      // React - Turn off rules handled by TypeScript
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",

      // General JS - Best practices
      "no-useless-catch": "error",
      "eqeqeq": "error",
      "prefer-const": "error",
      "no-param-reassign": ["error", { props: false }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-magic-numbers": ["error", { "ignore": [0, 1, -1] }],
    }
  }
];