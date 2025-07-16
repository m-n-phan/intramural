import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";

export default [
  {
    ignores: ["dist/", "node_modules/", "client/dist/"],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      }
    }
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ...pluginReactConfig,
    rules: {
      ...pluginReactConfig.rules,
      "react/react-in-jsx-scope": "off",
    },
    settings: {
      react: {
        version: "detect",
      }
    }
  },
  {
    rules: {
      "react/prop-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-useless-catch": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
    }
  }
];