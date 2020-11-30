import Clamscan from "clamscan";

export const CLAMSCAN_DB_FILES = ["main.cvd", "daily.cvd", "bytecode.cvd"];

export const getClamscan = () => new Clamscan().init({
    clamscan: {
        path: process.env.SLAMSCAN_CLAMSCAN_BINARY_PATH,
        db: process.env.SLAMSCAN_CLAMSCAN_DB_PATH,
        scan_archives: true,
        active: true
    },
    debug_mode: process.env.SLAMSCAN_CLAMSCAN_DEBUG_MODE,
    testing_mode: process.env.SLAMSCAN_CLAMSCAN_TESTING_MODE,
    remove_infected: process.env.NODE_ENV !== "test",
    scan_recursively: true,
    preference: "clamscan"
});

export const scanFile = file => getClamscan()
    .then(scanner => new Promise((resolve, reject) => {
        scanner.is_infected(file, (error, file, isInfected) => {
            if (error) {
                return reject(error);
            }

            resolve(isInfected);
        });
    }));
