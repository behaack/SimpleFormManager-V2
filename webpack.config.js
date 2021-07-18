const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: './index.ts',
  devtool: 'inline-source-map',  
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },  
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        test: /\.js(\?.*)?$/i,
      }),
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "./README.md", to: "README.md" },
        { from: "./LICENSE", to: "/LICENSE" },
        { from: "./package.json", to: "package.json" }
      ],
    }),
  ],    
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
};