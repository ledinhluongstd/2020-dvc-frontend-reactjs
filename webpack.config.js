import path from "path";
import { PORT, NODE_ENV } from './config'
import HtmlWebpackPlugin from "html-webpack-plugin";

module.exports = {
  mode: NODE_ENV ,
  entry: path.join(__dirname, 'src', 'index.js'),
  output: {
    path: path.join(__dirname, 'build'),
    // filename: 'index.bundle.js'
    filename: 'main.js',
    chunkFilename: '[name].js',
    publicPath: '/'
  },
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  },
  devServer: {
    contentBase: path.join(__dirname, 'src'),
    compress: true,
    host: '0.0.0.0',
    port: PORT,
    disableHostCheck: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'index.html')
    })
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      // {
      //   test: /\.(js|jsx)$/,
      //   exclude: /src/,
      //   use: ['babel-loader']
      // },
      {
        test: /\.(css|scss)$/,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader"
        ]
      },
      {
        test: /\.(jpg|jpeg|png|gif|mp3|svg)$/,
        loaders: ["file-loader"]
      },
      {
        test: /\.(ico|woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'url-loader?limit=100000'
          }
        ]
      }
    ]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        default: false,
        vendors: false,

        // vendor chunk
        vendor: {
          // name of the chunk
          name: 'vendor',

          // async + async chunks
          chunks: 'all',

          // import file path containing node_modules
          test: /node_modules/,

          // priority
          priority: 20
        },

        // common chunk
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 10,
          reuseExistingChunk: true,
          enforce: true
        }
      }
    }
  }
};
