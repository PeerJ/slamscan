import {configureAwsSdk} from "@randy.tarampi/serverless";
import logger from "./logger";

export const Aws = configureAwsSdk(logger);

export default Aws;
