const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: './resources/app.js',
    mode: 'development',
    plugins: [
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        })
    ],
    output: {
        path: path.resolve(__dirname, 'js'),
        filename: 'bundle.js',
    },
};