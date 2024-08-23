/** @type {import('webpack').Configuration} */

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = (env, argv) => {
  const { mode } = argv;
  const isProduction = mode === "production";

  const ruleForJavaScript = {
    test: /\.m?js$/,
    exclude: /node_modules/,
    use: {
      loader: "babel-loader",
    },
  };

  const ruleForStyles = {
    test: /\.(c|sc|sa)ss$/i,
    use: [
      isProduction ? MiniCssExtractPlugin.loader : "style-loader",
      "css-loader",
      "sass-loader",
    ],
  };

  const ruleForImages = {
    test: /\.(png|svg|jpg|jpeg|gif)$/i,
    type: "asset/resource",
    generator: {
      filename: "static/images/[fullhash][ext][query]",
    },
  };

  const rules = [ruleForJavaScript, ruleForStyles, ruleForImages];

  const plugins = [
    new HtmlWebpackPlugin({
      inject: true,
      template: "./public/index.html",
      filename: "./index.html",
    }),
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src", "assets/images"),
          to: "assets/images",
        },
      ],
    }),
    ...(isProduction ? [] : [new BundleAnalyzerPlugin({
      analyzerMode: "server",
    })]),
  ];

  return {
    entry: "./src/index.js",
    output: {
      filename: `[name].[${isProduction ? "contenthash" : "hash"}].js`,
      path: path.resolve(__dirname, "dist"),
      assetModuleFilename: "assets/images/[fullhash][ext][query]",
      clean: true,
    },
    devtool: isProduction ? false : "source-map",
    resolve: {
      extensions: [".js"],
      alias: {
        "@styles": path.resolve(__dirname, "src/styles/"),
      },
    },
    module: { rules },
    plugins,

    optimization: {
      cache: {
        type: 'filesystem',
      },
      minimize: true,
      minimizer: [new CssMinimizerPlugin(), new TerserPlugin()],
    },
    devServer: {
      client: {
        overlay: true,
      },
      compress: true,
      historyApiFallback: true,
      port: 3001,
      open: true,
    },
    performance: {
      maxAssetSize: 250000, // Tamaño máximo del archivo en bytes
      maxEntrypointSize: 250000, // Tamaño máximo del punto de entrada en bytes
      hints: isProduction ? 'warning' : false,
    },
  };
};
