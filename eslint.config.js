import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      ...tseslint.configs.recommendedTypeChecked.rules,
'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
    files: ['**/*.{ts,tsx}'],
    ignores: ['dist/'],
  }
);
