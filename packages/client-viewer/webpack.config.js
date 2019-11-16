const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');

// eslint-disable-next-line no-console
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

const config = isProd => ({
  context: path.resolve(__dirname, './src'),

  entry: {
    'viewer-main': './index.tsx',
  },

  output: {
    filename: isProd ? '[name]-[hash].js' : '[name].js',
    chunkFilename: isProd ? '[name]-[hash].js' : '[name].js',
    path: path.resolve(__dirname, 'packs'),
    publicPath: '/packs/',
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/](@material-ui[\//]|react)/,
          name: 'viewer-vendor',
          chunks: 'all',
        },
      },
    },
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
      template: './index.html',
      minify: isProd,
      alwaysWriteToDisk: true,
    }),
    new HtmlWebpackPlugin({
      filename: 'cast.html',
      template: './cast.html',
      minify: isProd,
      alwaysWriteToDisk: true,
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
    port: 8082,
    watchOptions: {
      ignored: /node_modules/,
    },
    proxy: {
      '/gql/ws': {
        target: 'ws://localhost:3000/',
        ws: true,
      },
      '/api/*': {
        target: 'http://localhost:3000',
      },
      '/auth/*': {
        target: 'http://localhost:3000',
      },
      '/gql': {
        target: 'http://localhost:3000',
      },
    },
    host: '0.0.0.0',
  },
});

module.exports = (command, { mode }) =>
  config(mode === 'production', command === 'webpack-dev-server');
