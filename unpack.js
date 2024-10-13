const unzipper = require("unzipper")
const fs = require("fs")

const logFile = fs.createWriteStream(process.env.LOGFILE, { flags: "w" });

processAlbums(
    process.env.ARCHIVE_PATH,
    process.env.MUSIC_PATH
).catch((error) => {
    console.error("Error unzipping albums");
    console.error(error);

    process.exit(1);
});

function processAlbums(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        const archives = fs.readdirSync(inputPath);
        const length = archives.length;
        let newAlbums = [];

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
            logFile.write(`${name}✀`);
            fs.createReadStream(`${inputPath}/${file}`)
                .pipe(unzipper.Extract({ path: `${outputPath}/${name}` }))
                .on("close", () => {

                    return resolve();
                });
        } catch (error) {

            return reject(error.message);
        }
    });
}
