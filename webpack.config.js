const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: './index.ts',
  mode: 'none',
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
    extensions: [".ts", ".js"]
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },   
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
};