const path = require("path");
const slsw = require("serverless-webpack");
const nodeExternals = require("webpack-node-externals");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const {BundleAnalyzerPlugin} = require("webpack-bundle-analyzer");
const PermissionsWebpackPlugin = require("webpack-permissions-plugin");
const util = require("./util");

const {
    isDevelopment,
    resolveWebpackMode: resolveMode
} = util;

let buildFiles = [];

Object.keys(require("./config/functions").default()).forEach(functionName => buildFiles = buildFiles.concat([
    {
        path: path.join(__dirname, `.webpack/${functionName}/bin/clamscan`),
        fileMode: "755"
    },
    {
        path: path.join(__dirname, `.webpack/${functionName}/bin/freshclam`),
        fileMode: "755"
    }
]));

const plugins = [
    new webpack.DefinePlugin({
        "global.GENTLY": false
    }),
    new CopyWebpackPlugin([
        {from: "build/bin", to: "bin"},
        {from: "build/etc", to: "etc"},
        {from: "build/lib", to: "lib"}
    ]),
    new PermissionsWebpackPlugin({
        buildFiles
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
                exclude: util.babelLoaderExclusions,
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
