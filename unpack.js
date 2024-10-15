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
    .then(newAlbums => {
        logger.write(JSON.stringify(newAlbums));
    })
    .catch(error => {
        console.error("Error unzipping albums");
        console.error(error);
        process.exit(1);
    })

async function processArchives(inputPath, outputPath) {
    const archiveList = fs.readdirSync(inputPath);
    const length = archiveList.length;
    const albums = [];

    for (let index = 0; index < length; index++) {
        const filename = archiveList[index];

        try {
            const name = await extract(inputPath, outputPath, filename)
            if (name) {
                albums.push(name);
            }
        } catch (error) {
            reject(error.message)
        }
    }

    return albums;
}

function extract(inputPath, outputPath, filename) {
    return new Promise((resolve, reject) => {
        const match = filename.match(/^(.*)(\.[a-z]+)$/);
        const [name, extension] = [match[1], match[2].toLowerCase()];

        if (extension !== ".zip" || fs.existsSync(`${outputPath}/${name}`)) {
            resolve(null);
        }

        try {
            fs.createReadStream(`${inputPath}/${filename}`)
                .pipe(unzipper.Extract({ path: `${outputPath}/${name}` }))
                .on("close", () => {
                    resolve(name);
                });
        } catch (error) {

            reject(error.message);
        }
    });
}
