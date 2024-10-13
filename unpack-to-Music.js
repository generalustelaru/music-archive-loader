const unzipper = require("unzipper")
const fs = require("fs")

const logFile = fs.createWriteStream(process.env.LOGFILE, { flags: "w" });

processNewAlbums(
    process.env.ARCHIVE_PATH,
    process.env.MUSIC_PATH
).catch((error) => {
    console.error("Error unzipping albums");
    console.error(error);

    process.exit(1);
});

function processNewAlbums(archivePath, musicPath) {
    return new Promise((resolve, reject) => {
        const archives = fs.readdirSync(archivePath);
        const length = archives.length;
        let newAlbums = [];

        for (let index = 0; index < length; index++) {
            const file = archives[index];
            unpackAlbumToMusic(archivePath, musicPath, file)
                .catch((error) => { return reject(error.message) });
        }

        return resolve();
    })
}

function unpackAlbumToMusic(archivePath, musicPath, file) {
    return new Promise((resolve, reject) => {
        const match = file.match(/^(.*)(\.[a-z]+)$/);
        const [name, extension] = [match[1], match[2].toLowerCase()];

        if (extension !== ".zip" || fs.existsSync(`${musicPath}/${name}`)) {

            return resolve();
        }

        try {
            logFile.write(`${name}✀`);
            fs.createReadStream(`${archivePath}/${file}`)
                .pipe(unzipper.Extract({ path: `${musicPath}/${name}` }))
                .on("close", () => {

                    return resolve();
                });
        } catch (error) {

            return reject(error.message);
        }
    });
}
