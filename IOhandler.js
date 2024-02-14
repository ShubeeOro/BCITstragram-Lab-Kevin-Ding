/*
 * Project: Milestone 1
 * File Name: IOhandler.js
 * Description: Collection of functions for files input/output related operations
 *
 * Created Date:
 * Author:
 *
 */


const fs = require("fs"),
  PNG = require("pngjs").PNG,
  path = require("path"),
  yauzl = require("yauzl-promise"),
  { pipeline } = require("stream/promises");

/**
 * Description: decompress file from given pathIn, write to given pathOut
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {promise}
 */
const unzip = async (pathIn, pathOut) => {
  // No existsDir async, if the folder was already done, just skip
  const zip = await yauzl.open(pathIn);
  try {
    for await (const entry of zip) {
      if (entry.filename.endsWith('/')) {
        await fs.promises.mkdir(`${path.join(pathOut, entry.filename)}`, {recursive:true});
      } else {
        const readStream = await entry.openReadStream();
        const writeStream = fs.createWriteStream(
          `${path.join(pathOut, entry.filename)}`
        );
        await pipeline(readStream, writeStream);
      }
    }
  } finally {
    await zip.close();
    // console.log("Extraction operation complete")
  }
};

/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path
 *
 * @param {string} path
 * @return {promise}
 */
const readDir = async (dir) => {
  const files = await fs.promises.readdir(dir)
  let images = new Array
  for (let i = 0; files.length > i ; ++i) {
    if ((path.extname(files[i])) === '.png') {
      images.push(path.join(dir, files[i]))
    }
  }
  return images
};

/**
 * Gray Scale
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */
const grayScale = async (pathIn, pathOut) => {

  const readableStream = fs.createReadStream(pathIn)

  const writeableStream = fs.createWriteStream(`${path.join(pathOut, path.basename(pathIn))}`)

  const streamPNG = new PNG({
    filterType: 4,
  })

 readableStream
    .on("error", (err) => console.log(`${err} 1`))
    .pipe(streamPNG)
    .on("error", (err) => console.log(`${err} 2`))
    .on("parsed", function () {
      for (var y = 0; y < this.height; y++) {
        for (var x = 0; x < this.width; x++) {
          var idx = (this.width * y + x) << 2;
          var avg = (this.data[idx] + this.data[idx + 1] + this.data[idx + 2]) / 3;
          this.data[idx] = avg;
          this.data[idx + 1] = avg;
          this.data[idx + 2] = avg;
        }
      }
      this.pack()
    })
    .on("error", (err) => console.log(`${err} 3`))
    .pipe(writeableStream)
    .on("error", (err) => console.log(`${err} 4`));
};

/**
 * 
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */
const AmaroFilter = async (pathIn, pathOut) => {

  const readableStream = fs.createReadStream(pathIn)

  const writeableStream = fs.createWriteStream(`${path.join(pathOut, path.basename(pathIn))}`)

  const streamPNG = new PNG({
      filterType: 4,
    })

  readableStream
    .on("error", (err) => console.log(`${err} 1`))
    .pipe(streamPNG)
    .on("error", (err) => console.log(`${err} 2`))
    .on("parsed", function () {
      for (var y = 0; y < this.height; y++) {
        for (var x = 0; x < this.width; x++) {
          var idx = (this.width * y + x) << 2;

          this.data[idx] = (Math.min(255, Math.floor(this.data[idx] * 1.2)));
          this.data[idx + 1] =  (Math.min(255, Math.floor(this.data[idx + 1] * 1.1)));
          this.data[idx + 2] = (Math.min(255, Math.floor(this.data[idx + 2] * 0.9)));
        }
      }
      this.pack()
    })
    .on("error", (err) => console.log(`${err} 3`))
    .pipe(writeableStream)
    .on("error", (err) => console.log(`${err} 4`))
  }

module.exports = {
  unzip,
  readDir,
  grayScale,
  AmaroFilter,
};
