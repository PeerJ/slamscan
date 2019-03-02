import {returnErrorResponseForLogger} from "@randy.tarampi/serverless";
import logger from "../logger";

export const returnErrorResponse = returnErrorResponseForLogger(logger);

export default returnErrorResponse;
