module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    // TypeScript already enforces undefined references — no-undef causes
    // false positives for script setup compiler macros (defineProps etc.)
    'no-undef': 'off',
    // The TS generic forms defineProps<T>() and defineEmits<T>() are valid
    // syntax but trip these rules in eslint-plugin-vue v8
    'vue/valid-define-props': 'off',
    'vue/valid-define-emits': 'off',
  },
};

