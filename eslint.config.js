import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import pluginReact from 'eslint-plugin-react';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
    { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
    { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'], languageOptions: { globals: globals.browser } },
    { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'], plugins: { js }, extends: ['js/recommended'] },
    tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    {
        plugins: {
            react,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            'import': importPlugin
        },
        rules: {
            ...js.configs.recommended.rules,
            ...react.configs.recommended.rules,
            ...react.configs['jsx-runtime'].rules,
            ...reactHooks.configs.recommended.rules,
            'react/jsx-no-target-blank': 'off',
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true }
            ],
            'no-console': ['error', { 'allow': ['warn', 'error'] }],
            'no-empty': 1,
            'no-irregular-whitespace': 1,
            'indent': ['error', 4],
            'max-len': ['error', { 'code': 1000 }],
            'linebreak-style': 'off',
            'quotes': ['error', 'single'],
            'arrow-parens': ['error', 'as-needed'],
            'react/prop-types': ['off'],
            'camelcase': ['error', { 'properties': 'never' }],
            'object-curly-spacing': ['error', 'always'],
            'no-multiple-empty-lines': ['error', { 'max': 1, 'maxEOF': 0 }],
            'space-infix-ops': ['error', { 'int32Hint': false }],
            'no-multi-spaces': ['error'],
            'arrow-spacing': ['error', { 'before': true, 'after': true }],
            'react/react-in-jsx-scope': 'off',
            'comma-dangle': ['error', {
                'arrays': 'never',
                'objects': 'never'
            }],
            'semi': ['error', 'always'],
            'import/order': [
                'error',
                {
                    groups: [
                        'builtin',
                        'external',
                        ['internal', 'parent', 'sibling', 'index'],
                        'unknown',
                        'type',
                        'object'
                    ],
                    pathGroups: [
                        {
                            pattern: 'react',
                            group: 'external',
                            position: 'before'
                        },
                        {
                            pattern: '@/**',
                            group: 'internal',
                            position: 'after'
                        },
                        {
                            pattern: '*.css',
                            group: 'unknown',
                            position: 'after'
                        }
                    ],
                    pathGroupsExcludedImportTypes: ['react'],
                    'newlines-between': 'always',
                    alphabetize: {
                        order: 'asc',
                        caseInsensitive: true
                    }
                }
            ]
        }
    }
]);