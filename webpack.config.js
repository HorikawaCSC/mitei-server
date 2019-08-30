const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');

// eslint-disable-next-line no-console
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

const config = (isProd, isWatch) => ({
  context: path.resolve(__dirname, './src/client'),

  entry: {
    main: './normal/index.tsx',
    admin: './admin/index.tsx',
  },

  output: {
    filename: isProd ? '[name]-[hash].js' : '[name].js',
    chunkFilename: isProd ? '[name]-[hash].js' : '[name].js',
    path: path.resolve(__dirname, 'packs'),
    publicPath: '/packs/',
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.(jpe?g|png|gif|ttf|otf|eot|svg|woff2?)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: isProd ? '[name]-[hash].[ext]' : '[name].[ext]',
              publicPath: '/packs/',
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          !isProd ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
    ],
  },

  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },

  plugins: [
    isProd ? null : new webpack.HotModuleReplacementPlugin(),

    new CleanWebpackPlugin(),

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),

    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './normal/index.html',
      minify: isProd,
      alwaysWriteToDisk: true,
      chunks: ['main'],
    }),

    new HtmlWebpackPlugin({
      filename: 'admin.html',
      template: './admin/index.html',
      minify: isProd,
      alwaysWriteToDisk: true,
      chunks: ['admin'],
    }),

    new HtmlWebpackHarddiskPlugin(),

    new MiniCssExtractPlugin({
      filename: isProd ? '[name].[hash].css' : '[name].css',
      chunkFilename: isProd ? '[id].[hash].css' : '[id].css',
    }),
  ].filter(plugin => !!plugin),

  devServer: {
    compress: true,
    contentBase: path.join(__dirname, 'packs'),
    disableHostCheck: true,
    historyApiFallback: true,
    hot: true,
    port: 8080,
    index: '',
    watchOptions: {
      ignored: /node_modules/,
    },
    proxy: {
      '/gql/ws': {
        target: 'ws://localhost:3000/',
        ws: true,
      },
      '*': {
        target: 'http://localhost:3000',
      },
    },
    host: '0.0.0.0',
  },
});

module.exports = (command, { mode }) =>
  config(mode === 'production', command === 'webpack-dev-server');
