module.exports = {
  plugins: ['prettier'],
  extends: ['eslint:recommended', 'prettier', 'prettier/react'],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    es6:true,
    browser: true,
    node: true,
    jest: true
  },
  rules: {
    'no-debugger': 2,
    'no-alert': 2,
    'no-await-in-loop': 0,
    'no-prototype-builtins': 0,
    'no-return-assign': ['error', 'except-parens'],
    'no-restricted-syntax': [
      2,
      'ForInStatement',
      'LabeledStatement',
      'WithStatement'
    ],
    'no-unused-vars': [
      0,
      {
        ignoreSiblings: true,
        argsIgnorePattern: 'React|res|next|^_'
      }
    ],
    'prefer-const': [
      'error',
      {
        destructuring: 'all'
      }
    ],
    'no-unused-expressions': [
      2,
      {
        allowTaggedTemplates: true
      }
    ],
    'no-console': 1,
    'comma-dangle': 2,
    'jsx-quotes': [2, "prefer-double"],
    quotes: [
      2,
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true
      }
    ],
    'prettier/prettier': [
      'error',
      {
        trailingComma: 'none',
        singleQuote: true,
        printWidth: 80
      }
    ]
  }
};