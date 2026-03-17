import eslint from '@eslint/js';
import perfectionist from 'eslint-plugin-perfectionist';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**'] },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      perfectionist,
      'react-hooks': reactHooks,
    },
    rules: {
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { assertionStyle: 'never' },
      ],
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowBoolean: true, allowNumber: true },
      ],
      'max-lines': [
        'error',
        { max: 100, skipBlankLines: true, skipComments: true },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              importNames: ['useEffect'],
              message:
                'useEffect is banned. Use useSyncExternalStore for data loading, render-time ref checks for derived state, or event handlers for side effects. Only DOM event subscriptions (addEventListener/removeEventListener) are allowed — use use-keyboard-shortcuts or a useSyncExternalStore wrapper instead.',
              name: 'react',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          message: 'Default exports are not allowed. Use named exports.',
          selector: 'ExportDefaultDeclaration',
        },
      ],
      'perfectionist/sort-imports': 'error',
      'perfectionist/sort-jsx-props': 'error',
      'perfectionist/sort-object-types': 'error',
      'perfectionist/sort-objects': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react-hooks/rules-of-hooks': 'error',
    },
  },
);
