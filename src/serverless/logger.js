import {configureLogger as genericConfigureLogger, createLogger} from "@randy.tarampi/lambda-logger";
import packageJson from "../../package.json";

export const configureLogger = () => genericConfigureLogger(packageJson);

export default createLogger(packageJson);
