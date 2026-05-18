import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "data/**",
      "public/sw.js",
    ],
    rules: {
      "@next/next/no-page-custom-font": "off",
    },
  },
];

export default eslintConfig;
