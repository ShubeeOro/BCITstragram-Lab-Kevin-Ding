/*
 * Project: Milestone 1
 * File Name: IOhandler.js
 * Description: Collection of functions for files input/output related operations
 *
 * Created Date:
 * Author:
 *
 */

import fs from "fs";
import { PNG } from "pngjs";
import path from "path";
import yauzl from "yauzl-promise";
import { pipeline } from "stream/promises";
/**
 * Description: decompress file from given pathIn, write to given pathOut
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {promise}
 */
export async function unzip(pathIn, pathOut) {
  const zip = await yauzl.open(pathIn);
  try {
    for await (const entry of zip) {
      if (entry.fileName.endsWith('/')) {
        await fs.promises.mkdir(`${path.join(pathOut, entry.fileName)}`, {recursive:true});
      } else {
        const readStream = await entry.openReadStream();
        const writeStream = fs.createWriteStream(
          `${path.join(pathOut, entry.fileName)}`
        );
        await pipeline(readStream, writeStream);
      }
    }
  } finally {
    await zip.close();
    console.log("Extraction operation complete")
  }
};

/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path
 *
 * @param {string} path
 * @return {promise}
 */
export async function readDir(dir) {
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
export async function grayScale(pathIn, pathOut) {

  fs.createReadStream(pathIn)
  .pipe(
    new PNG({
      filterType: 4,
    })
  )
  .on("parsed", function () {
    for (var y = 0; y < this.height; y++) {
      for (var x = 0; x < this.width; x++) {
        var idx = (this.width * y + x) << 2;

        var avg = (this.data[idx] + this.data[idx + 1] + this.data[idx + 2]) / 3;

        this.data[idx] = avg;
        this.data[idx + 1] =  avg;
        this.data[idx + 2] = avg;
      }
    }
    this.pack().pipe(fs.createWriteStream(`${path.join(pathOut, path.basename(pathIn))}`));
  });
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
export async function otherfilter(pathIn, pathOut) {
  fs.createReadStream(pathIn)
  .pipe(
    new PNG({
      filterType: 4,
    })
  )
  .on("parsed", function () {
    for (var y = 0; y < this.height; y++) {
      for (var x = 0; x < this.width; x++) {
        var idx = (this.width * y + x) << 2;

        var avg = (this.data[idx] + this.data[idx + 1] + this.data[idx + 2]) / 3;

        this.data[idx] = avg;
        this.data[idx + 1] =  avg;
        this.data[idx + 2] = avg;
      }
    }
    this.pack().pipe(fs.createWriteStream(`${path.join(pathOut, path.basename(pathIn))}`));
  });
};

