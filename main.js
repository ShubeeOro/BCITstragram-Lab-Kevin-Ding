
/*
 * Project: Milestone 1
 * File Name: main.js
 * Description:
 *
 * Created Date:
 * Author:
 *
 */
const path = require("node:path"),
{ Worker, isMainThread, workerData } = require('node:worker_threads');
const IOhandler = require("./IOhandler.js");
const zipFilePath = path.join(__dirname, "myfile.zip");
const pathUnzipped = path.join(__dirname, "unzipped");
const pathProcessed = path.join(__dirname, "grayscaled");

// How do you get this to work in the IO handler :( , I'm pretty sure it's multithreaded
async function ProcessPaths(array, pathOut, filter) {
    const Threads = array.length
    let workers = [];

    if (isMainThread) {
      for (let i = 0; i < Threads; ++i) {
        const worker = new Worker(__filename, {
          workerData: { threadId: i, chunk: array[i], output: pathOut }
        })
        workers.push(worker)
        worker.on('online', () => {
            console.log(`Thread ${i} Online`);
          });
        worker.on('exit', () => {
            console.log(`Thread ${i} Done `);
          });
      }
    } else {
      if (filter === "GS") {
        IOhandler.grayScale(workerData.chunk, workerData.output)
      }
      if (filter === "AF") {
        IOhandler.AmaroFilter(workerData.chunk, workerData.output)
      }
    }
  }

async function mainSingle() {
    try {
        await IOhandler.unzip(zipFilePath, pathUnzipped);
        let img = await IOhandler.readDir(pathUnzipped);
        let promisesArray = [];
        // Specify filter, options are
        // IOhandler.AmaroFilter , IOhandler.GrayScale
        img.forEach(path => {
            let promise = (IOhandler.AmaroFilter(path, pathProcessed));
            promisesArray.push(promise);
        });
        Promise.all(promisesArray).finally(() => { console.log("Completed") });
    } catch (error) {
        console.log(error);
    }
}
/**
 * in ProcessPaths last arg, use the following as a string
 * GS = GrayScale, AF = AmaroFilter
 */
async function mainMulti() {
    try {
        await IOhandler.unzip(zipFilePath, pathUnzipped);
        let img = await IOhandler.readDir(pathUnzipped);
        ProcessPaths(img, pathProcessed, "AF");
    } catch (error) {
        console.log(error);
    }
}

mainMulti()


/*
    let promisesArray = new Array
    // Using AmaroFilter
    img.forEach(path => {
        let promise = (IOhandler.AmaroFilter(path, pathProcessed))
        promisesArray.push(promise)
    });
        Promise.all(promisesArray).finally(() => { console.log("Completed") })
*/