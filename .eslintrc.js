module.exports = {
    'env': {
        'browser': true,
        'node': true,
        'es6': true,
    },
    'extends': ['eslint:recommended', 'plugin:node/recommended'],
    'parserOptions': {
        'ecmaVersion': 2017
    },
    'rules': {
        'no-console': ['error', { 'allow': ['warn', 'error']}],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'semi': [
            'error',
            'always'
        ]
    }
};
