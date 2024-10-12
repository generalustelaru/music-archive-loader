const unzipper = require("unzipper")
const fs = require("fs")

let archives
try {
    archives = fs.readdirSync("music-archive")
} catch (error) {
    console.error("Error reading music-archive folder")
    console.error(error)
}

console.info('Unzipping files...')
interval = setInterval(() => { // TODO: try replacing the interval with a loop calling an async function (it speeds up the process without risking to break).
    const file = archives.pop()
    if (!file) {
        console.info("Done!")
        clearInterval(interval)
        return
    }
    try {
        const folderName = file.split(".")[0]
        let infoMessage = "Unzipping file: " + file
        if (!fs.existsSync(`C:/Users/Adrian/Music/${folderName}`)) {
            fs.createReadStream(`music-archive/${file}`)
            .pipe(unzipper.Extract({ path: `C:/Users/Adrian/Music/${folderName}` }))
            .on("close", () => {
                console.info(infoMessage + " - Done!")
            })
        } else {
            console.info("...")
        }
    } catch (error) {
        console.error("Error unzipping file: " + file)
        console.error(error)
    }
}, 50);
