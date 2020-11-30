const productionEnvs = ["production", "deploy"];
const isNodeEnvDevelopment = !productionEnvs.includes(process.env.NODE_ENV);
const isBabelEnvDevelopment = process.env.BABEL_ENV !== undefined
    ? !productionEnvs.includes(process.env.BABEL_ENV)
    : isNodeEnvDevelopment;
const isDevelopment = isNodeEnvDevelopment && isBabelEnvDevelopment;

const WEBPACK_MODE_PRODUCTION = "production";
const WEBPACK_MODE_DEVELOPMENT = "development";

const resolveWebpackMode = () => {
    if (isDevelopment) {
        return WEBPACK_MODE_DEVELOPMENT;
    }

    return WEBPACK_MODE_PRODUCTION;
};
const webpackMode = resolveWebpackMode();

module.exports = {
    WEBPACK_MODE_PRODUCTION,
    WEBPACK_MODE_DEVELOPMENT,
    productionEnvs,
    isDevelopment,
    isNodeEnvDevelopment,
    isBabelEnvDevelopment,
    resolveWebpackMode,
    webpackMode
};
