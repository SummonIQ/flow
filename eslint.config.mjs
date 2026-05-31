import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import betterTailwindCss from 'eslint-plugin-better-tailwindcss';
import _import from 'eslint-plugin-import';
import jsxA11Y from 'eslint-plugin-jsx-a11y';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sortKeysFix from 'eslint-plugin-sort-keys-fix';
import testingLibrary from 'eslint-plugin-testing-library';
import typescriptSortKeys from 'eslint-plugin-typescript-sort-keys';
import unusedImports from 'eslint-plugin-unused-imports';

const compat = new FlatCompat({
  allConfig: js.configs.all,
  baseDirectory: path.dirname(fileURLToPath(import.meta.url)),
  recommendedConfig: js.configs.recommended,
});

const config = [
  ...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:playwright/recommended',
    'plugin:react/recommended',
    'next/core-web-vitals',
    'next/typescript',
  ),
  {
    files: ['*.ts', '*.tsx'],
    ignores: ['**/node_modules/*', '**/.next/*', '**/.archives/*'],
  },
  {
    languageOptions: {
      ecmaVersion: 5,
      parser: tsParser,
      parserOptions: {
        project: ['tsconfig.json'],
        tsconfigRootDir: path.dirname(fileURLToPath(import.meta.url)),
      },
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'better-tailwindcss': betterTailwindCss,
      import: _import,
      'jsx-a11y': jsxA11Y,
      'simple-import-sort': simpleImportSort,
      'sort-keys-fix': sortKeysFix,
      'testing-library': testingLibrary,
      'typescript-sort-keys': typescriptSortKeys,
      'unused-imports': unusedImports,
    },
    rules: {
      '@next/next/no-duplicate-head': 'off',
      '@next/next/no-html-link-for-pages': 'off',
      '@next/next/no-img-element': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { disallowTypeAnnotations: false, prefer: 'type-imports' },
      ],
      '@typescript-eslint/member-ordering': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn'],
      camelcase: 'off',
      'import/extensions': [
        'error',
        'never',
        {
          css: 'always',
          jpeg: 'always',
          jpg: 'always',
          json: 'always',
          png: 'always',
          svg: 'always',
        },
      ],
      indent: ['warn', 2],
      'jsx-quotes': ['warn', 'prefer-double'],
      'new-cap': 'off',
      'no-multiple-empty-lines': ['warn', { max: 1 }],
      'no-unused-vars': 'off',
      'node/no-deprecated-api': 'off',
      'object-curly-spacing': 'off',
      'operator-linebreak': 'off',

      quotes: ['warn', 'single'],
      'react/jsx-filename-extension': [
        'error',
        { extensions: ['.jsx', '.tsx'] },
      ],
      'react/jsx-sort-props': ['warn'],
      'react/self-closing-comp': ['warn'],
      'react/sort-comp': ['warn'],
      semi: ['warn', 'always'],
      'simple-import-sort/exports': 'warn',
      'simple-import-sort/imports': 'warn',
      'sort-keys': 'warn',
      'sort-keys-fix/sort-keys-fix': 'warn',
      'typescript-sort-keys/interface': 'warn',
      'typescript-sort-keys/string-enum': 'warn',
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          vars: 'all',
          varsIgnorePattern: '^_',
        },
      ],
    },
    settings: {
      'better-tailwindcss': {
        // tailwindcss 4: the path to the entry file of the css based tailwind config (eg: `src/global.css`)
        entryPoint: 'app/globals.css',
        // tailwindcss 3: the path to the tailwind config file (eg: `tailwind.config.js`)
        tailwindConfig: 'tailwind.config.ts',
      },
      'import/parsers': { '@typescript-eslint/parser': ['.ts', '.tsx'] },
      'import/resolver': {
        typescript: { alwaysTryTypes: true, project: ['tsconfig.json'] },
      },
    },
  },
];

export default config;
