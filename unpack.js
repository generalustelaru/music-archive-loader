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

const logFile = fs.createWriteStream(envLogfile, { flags: "w" });

processAlbums(envArchivePath, envMusicPath)
    .catch((error) => {
        console.error("Error unzipping albums");
        console.error(error);
        process.exit(1);
    });

function processAlbums(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        const archives = fs.readdirSync(inputPath);
        const length = archives.length;

        for (let index = 0; index < length; index++) {
            const file = archives[index];
            unpackAlbum(inputPath, outputPath, file)
                .catch((error) => { return reject(error.message) });
        }

        return resolve();
    })
}

function unpackAlbum(inputPath, outputPath, file) {
    return new Promise((resolve, reject) => {
        const match = file.match(/^(.*)(\.[a-z]+)$/);
        const [name, extension] = [match[1], match[2].toLowerCase()];

        if (extension !== ".zip" || fs.existsSync(`${outputPath}/${name}`)) {
            return resolve();
        }

        try {
            fs.createReadStream(`${inputPath}/${file}`)
                .pipe(unzipper.Extract({ path: `${outputPath}/${name}` }))
                .on("close", () => {
                    logFile.write(`${name}✀`);

                    return resolve();
                });
        } catch (error) {

            return reject(error.message);
        }
    });
}
