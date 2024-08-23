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
    test: /\.(c|sc|sa)ss$/i, //css,scss,sass
    use: [
      isProduction ? MiniCssExtractPlugin.loader : "style-loader", // Creates `style` nodes from JS strings
      "css-loader", // Translates CSS into CommonJS
      "sass-loader", // Compiles Sass to CSS
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
      inject: true, // INYECTA EL BUNDLE AL TEMPLATE HTML EN ETIQUETA HEAD
      template: "./public/index.html", // LA RUTA AL TEMPLATE HTML
      filename: "./index.html", // NOMBRE FINAL DEL ARCHIVO
    }),
    new MiniCssExtractPlugin({
      filename: "[name].[chunkhash].css",
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src", "assets/images"),
          to: "assets/images",
        },
      ],
    }),
    ...(isProduction
      ? [
          new BundleAnalyzerPlugin({
            analyzerMode: "server",
          }),
        ]
      : []),
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
      minimize: true,
      minimizer: [new CssMinimizerPlugin(), new TerserPlugin()],
    },
    devServer: {
      client: {
        overlay: true,
      },
      compress: true,
      historyApiFallback: true,
      port: 3001, // Cambia el puerto si 3000 está ocupado
      open: true, // Abre automáticamente la URL principal en el navegador
    },
  };
};
