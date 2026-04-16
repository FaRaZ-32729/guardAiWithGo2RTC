const sharp = require('sharp');
const fs = require('fs');

const compressImageToBase64 = async (imagePath) => {
    const fileBuffer = fs.readFileSync(imagePath);

    const compressed = await sharp(fileBuffer)
        .rotate()
        .resize(640, 640, { fit: 'inside' })
        .jpeg({ quality: 50 })
        .toBuffer();

    return compressed.toString('base64');
};

module.exports = compressImageToBase64;