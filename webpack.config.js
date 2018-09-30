const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const outputDirectory = 'dist';

module.exports = {
    entry: "./src/client/index.js",
    output: {
        path: path.join(__dirname, outputDirectory),
        filename: "bundle.js"
    },
    watch: false, // false for one-time build.
    module: {
        rules: [
            {test: /\.js$/, exclude: /node_modules/, use: {loader: "babel-loader"}},
            {test: /\.scss$/, use: ["style-loader", "css-loader", "sass-loader"]},
            {test: /\.css$/, use: ["style-loader", "css-loader"]},
            {test: /\.png$/, use: ["file-loader"]}
        ]
    },
    plugins: [
        new CleanWebpackPlugin([outputDirectory]),
        new HtmlWebpackPlugin({
            template: "./public/index.html",
            favicon: "./public/favicon.ico"
        })
    ]
};