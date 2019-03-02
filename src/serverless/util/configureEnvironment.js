import temp from "temp";
import logger, {configureLogger} from "../logger";

temp.track();

export const configureEnvironment = async () => {
    return configureLogger()
        .catch(error => {
            logger.fatal(error, "Unexpected error configuring the lambda environment");
            throw error;
        });
};

export default configureEnvironment;
