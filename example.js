
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});


const countries = [
    { name: 'Canada', code: 'CA' },
    { name: 'United States', code: 'US' },
    { name: 'Mexico', code: 'MX' },
    { name: 'France', code: 'FR' },
    { name: 'United Kingdom', code: 'UK' },
]

function getCountryCode(countryName) {
    const country = countries.find(country => country.name === countryName);
    return country.code;
}

readline.question('Enter country name: ', name => {
    try {
        const code = getCountryCode(name);
        console.log(`Country code: ${code}`);
    } catch (error) {
        console.log('Country not found')
    }
    readline.close();
});