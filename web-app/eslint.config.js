import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        // React globals
        React: 'readonly',
        useState: 'readonly',
        useEffect: 'readonly',
        useCallback: 'readonly',
        useMemo: 'readonly',
        useRef: 'readonly',
        useContext: 'readonly',
        useReducer: 'readonly',
        // React Router globals
        useNavigate: 'readonly',
        useLocation: 'readonly',
        useParams: 'readonly',
        Link: 'readonly',
        Navigate: 'readonly',
        navigate: 'readonly',
        // Prism.js
        Prism: 'readonly',
        // Vitest globals
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'error',
      'no-undef': 'error',
      'no-empty': 'error',
      'no-case-declarations': 'off',
      'no-useless-escape': 'off',
      'no-control-regex': 'off',
      'preserve-caught-error': 'off',
      'no-const-assign': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-useless-catch': 'off',
    },
  },
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/test/**'],
  },
];
