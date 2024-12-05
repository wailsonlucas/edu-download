const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

if(!process.argv[2]) throw Error('No traget directory was provided !!!')
const target = process.argv[2];

// Function to download a single file
const downloadFile = async (url, outputPath) => {
    const writer = fs.createWriteStream(outputPath);

    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
};

// Function to read links from the specified .txt file
const readLinksFromFile = async (filePath) => {
    const data = await fs.readFile(filePath, 'utf-8');
    return data.split('\n').filter(link => link.trim() !== '');
};

// Main function to process .txt files in the specified directory
const processDirectory = async (dirPath) => {
    const files = await fs.readdir(dirPath);

    for (const file of files) {
        const filePath = path.join(dirPath, file);

        if (path.extname(file) === '.txt') {
            const links = await readLinksFromFile(filePath);
            const folderPath = path.dirname(filePath); // Get the directory of the .txt file

            for (const link of links) {
                const fileName = path.basename(link); // Extract filename from URL
                const outputPath = path.join(folderPath, fileName);
                console.log(`⬇️ جاري تحميل ${link}`);
                await downloadFile(link, outputPath);
            }
        }
    }
};

// User-specified path to the directory containing .txt files
const userDirectoryPath = `./${target}`; // Change this to the path provided by the user

processDirectory(userDirectoryPath)
    .then(() => console.log('All downloads completed!'))
    .catch(err => console.error('An error occurred:', err));