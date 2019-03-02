import {downloadAndScanFileForS3Record, downloadClamscanDbFilesFromS3} from "../../lib";
import logger from "../logger";
import {configureEnvironment} from "../util/configureEnvironment";
import {returnErrorResponse} from "../util/returnErrorResponse";

export const handler = (event, context, callback) => {
    logger.debug("%s@%s handling request %s", context.functionName, context.functionVersion, context.awsRequestId, event, context);

    configureEnvironment()
        .then(() => downloadClamscanDbFilesFromS3())
        .then(() => Promise.all(event.Records.map(downloadAndScanFileForS3Record)))
        .then(() => callback(null))
        .catch(returnErrorResponse(event, context, callback));
};

export default handler;
