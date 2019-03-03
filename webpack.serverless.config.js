const path = require("path");
const slsw = require("serverless-webpack");
const nodeExternals = require("webpack-node-externals");
const webpack = require("webpack");
const {BundleAnalyzerPlugin} = require("webpack-bundle-analyzer");
const util = require("./util");

const {
    isDevelopment,
    resolveWebpackMode: resolveMode
} = util;

const plugins = [
    new webpack.DefinePlugin({
        "global.GENTLY": false
    })
];

if (!isDevelopment || process.env.BUNDLE_ANALYZER) {
    plugins.push(
        new BundleAnalyzerPlugin({
            analyzerMode: "static",
            openAnalyzer: false
        })
    );
}

module.exports = {
    entry: slsw.lib.entries,
    mode: resolveMode(),
    devtool: isDevelopment ? "eval-source-map" : "nosources-source-map",
    target: "node",
    optimization: {
        minimize: false
    },
    performance: {
        hints: false
    },
    externals: [nodeExternals({
        whitelist: [
            /@randy\.tarampi\/\w+/
        ]
    }), "aws-sdk"],
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: "babel-loader",
                options: {
                    configFile: path.join(__dirname, "./babel.config.js"),
                    envName: "server"
                }
            }
        ]
    },
    plugins,
    resolve: {
        extensions: [".js", ".jsx", ".json"]
    }
};
