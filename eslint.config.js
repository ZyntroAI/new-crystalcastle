import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: [
      '**/node_modules/**', '**/dist/**',
      'backend/**', 'frontend/**', 'scripts/**', 'docs/**', 'pages/**',
      'github-coding/**', '**/*.test.*', '**/*.config.js',
      '*.js', '*.ts', '*.jsx', '*.tsx', '*.md', '*.json',
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser, parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  { files: ['**/*.{js,jsx}'], rules: { ...js.configs.recommended.rules } },
]
