const unzipper = require("unzipper")
const fs = require("fs")

const envLogfile = process.env.LOGFILE;
const envArchivePath = process.env.ARCHIVE_PATH;
const envMusicPath = process.env.MUSIC_PATH;

if (!envLogfile || !envArchivePath || !envMusicPath) {
    const props = { LOGFILE: envLogfile, ARCHIVE_PATH: envArchivePath, MUSIC_PATH: envMusicPath };
    console.error("Missing environment variables!");
    console.error(props);
    process.exit(1);
}

const logger = fs.createWriteStream(envLogfile, { flags: "w" });

processArchives(envArchivePath, envMusicPath)
    .catch((error) => {
        console.error("Error unzipping albums");
        console.error(error);
        process.exit(1);
    });

function processArchives(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        const archiveList = fs.readdirSync(inputPath);
        const length = archiveList.length;

        for (let index = 0; index < length; index++) {
            const filename = archiveList[index];

            extract(inputPath, outputPath, filename)
                .then((name) => {
                    if (name) logger.write(`${name}✀`);
                })
                .catch((error) => { return reject(error.message) });
        }

        return resolve();
    })
}

function extract(inputPath, outputPath, filename) {
    return new Promise((resolve, reject) => {
        const match = filename.match(/^(.*)(\.[a-z]+)$/);
        const [name, extension] = [match[1], match[2].toLowerCase()];

        if (extension !== ".zip" || fs.existsSync(`${outputPath}/${name}`)) {
            return resolve(null);
        }

        try {
            fs.createReadStream(`${inputPath}/${filename}`)
                .pipe(unzipper.Extract({ path: `${outputPath}/${name}` }))
                .on("close", () => {
                    return resolve(name);
                });
        } catch (error) {

            return reject(error.message);
        }
    });
}
