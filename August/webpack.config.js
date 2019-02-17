const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const mode = process.env.NODE_ENV || 'development';

 module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js'
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    devServer: {
        inline: true,
        contentBase: './dist',
        port: 3000
    },
    module: {
         rules: [
             {
                 test: /\.jsx?$/,                 
                 exclude: /(node_modules)/,
                 use: 'babel-loader'
             },
             {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
             }
         ]
     },
     plugins: (mode === "production") ? [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new UglifyJSPlugin({
            uglifyOptions: {
                    ecma: 8,
                    compress: true,
                    extractComments: true
                }
            })
        ] : []
 };