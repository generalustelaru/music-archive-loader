const fs = require("fs");

const newAlbums = fs
    .readFileSync(process.env.LOGFILE, "utf8")
    .split("✀");

newAlbums.pop();

if (newAlbums.length > 0) {
    console.log('\nNew albums:');
    newAlbums.forEach(title => {
        console.log('\x1b[33m    %s\x1b[0m', title);
    });

    process.exit(0);
}

console.error('\nCould not find new albums!');
process.exit(1);
