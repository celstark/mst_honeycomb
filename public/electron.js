//*******************************************************************
//
//   File: electron.js               Folder: public
//
//   Author: Honeycomb, Audrey Hempel
//   --------------------
//
//   Changes:
//        7/10/23 (AGH): made changes to getSavePath to make sure
//                       the data saves on the first iteration of
//                       a participantID and studyID
//                       added saveDataandQuit to save data if window
//                       is closed before experiment end
//        7/24/23 (AGH): added fsExtra and made changes
//                       saveDataandQuit to correct for stream errors
//
//        10/28/23 (CELS): Used streams to create a parallel CSV output to the JSON output
//        11/14/23 (CELS): Finished cleanout of trigger / serial port code
//
//   --------------------
//   This file handles the Electron framework integration for the
//   application, managing data storage, event handling, etc.
//
//*******************************************************************

// Modules to control application life and create native browser window
const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const ipc = require("electron").ipcMain;
//const _ = require("lodash");
const fs = require("fs-extra");
const log = require("electron-log");
const fsExtra = require("fs-extra"); // 7/24/23 (AGH) ADDED

// handle windows installer set up
if (require("electron-squirrel-startup")) app.quit();

// Define default environment variables
let VIDEO = false;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// 7/10/23 (AGH) ADDED: this function was added to allow the application to save data if the window is
// closed before the completion of the experiment
const saveDataAndQuit = () => {
  const dcode = today.getTime();
  if (stream) {
    if (stream.writable) {
      stream.end("]");
    }
    stream.on("finish", () => {
      if (preSavePath && savePath) {
        const filename = `pid_${participantID}_${dcode}.json`; // Generate a unique filename using the current timestamp
        const fullPath = getFullPath(filename); // Set the full path for the data file
        // Ensure that the savePath directory exists before moving the file
        fsExtra.ensureDirSync(savePath); //7/24/23 (AGH) ADDED
        //console.log('JSON move',preSavePath,savePath)
        try {
          fsExtra.copySync(preSavePath, fullPath);
          //console.log('JSON copied');
        } catch (err) {
          console.log(err);
        }
      }
    });
  }
  if (stream_csv) {
    // CELS - added
    if (stream_csv.writable) {
      stream_csv.end("\n");
    }
    stream_csv.on("finish", () => {
      if (preSavePath_csv && savePath) {
        const filename = `pid_${participantID}_${dcode}.csv`; // Generate a unique filename using the current timestamp
        const fullPath = getFullPath(filename); // Set the full path for the data file
        // Ensure that the savePath directory exists before moving the file
        fsExtra.ensureDirSync(savePath); //7/24/23 (AGH) ADDED
        //console.log('CSV move',preSavePath_csv,savePath)
        try {
          fsExtra.copySync(preSavePath_csv, fullPath);
          //console.log('CSV copied');
        } catch (err) {
          console.log(err);
        }
      }
    });
  }
  app.quit(); // Quit the app - either we flushed it all or no stream available
};
// END OF ADDED SECTION

function createWindow() {
  // Create the browser window.
  const os = require("os");
  if (os.platform() === "darwin") {
    const nativeImage = require("electron").nativeImage;
    const image = nativeImage.createFromPath("public/MSTLogo512.png");
    console.log(image);
    app.dock.setIcon(image);
  }
  if (process.env.ELECTRON_START_URL) {
    // in dev mode, disable web security to allow local file loading
    console.log(process.env.ELECTRON_START_URL);
    mainWindow = new BrowserWindow({
      width: 1500,
      height: 900,
      icon: "./public/MST.ico",
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
  } else {
    mainWindow = new BrowserWindow({
      fullscreen: true,
      icon: "./public/MST.ico",
      frame: false,
      webPreferences: {
        nodeIntegration: true,
        webSecurity: true,
        contextIsolation: false,
      },
    });

    mainWindow.on("closed", function () {
      //7/24/23 (AGH) ADDED
      saveDataAndQuit();
      mainWindow = null;
    });
  }

  // and load the index.html of the app.
  const startUrl =
    process.env.ELECTRON_START_URL || `file://${path.join(__dirname, "../build/index.html")}`;
  log.info(startUrl);
  mainWindow.loadURL(startUrl);

  // Open the DevTools.
  process.env.ELECTRON_START_URL && mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on("closed", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    //console.log('on closed');
    saveDataAndQuit(); // 7/10/23 (AGH) ADDED
    mainWindow = null;
  });
}

// Update env variables with buildtime values from frontend
ipc.on("updateEnvironmentVariables", (event, args) => {
  VIDEO = args.USE_CAMERA;
});

// <studyID> will be created on Desktop and used as root folder for saving data.
// data save format is ~/Desktop/<studyID>/<participantID>/<date>/<filename>.json
// it is also incrementally saved to the user's app data folder (logged to console)

// INCREMENTAL FILE SAVING
let stream = false;
let fileCreated = false;
let preSavePath = "";
let stream_csv = false;
let preSavePath_csv = "";
let savePath = "";
let participantID = "";
let studyID = "";
//const images = [];
let startTrial = -1;
const today = new Date();
let trial_offset = 0;

/**
 * Abstracts constructing the filepath for saving data for this participant and study.
 * @returns {string} The filepath.
 */
const getSavePath = (studyID, participantID) => {
  if (studyID !== "" && participantID !== "") {
    const desktop = app.getPath("desktop");
    const name = app.getName();
    const date = today.toISOString().slice(0, 10);
    // 7/10/23 (AGH) ADDED: This section was added for the omst to ensure that data was saved on the first iteration of a studyID and participant ID
    const folderPath = path.join(desktop, studyID, participantID, date, name);

    // Create the folders if they don't exist
    fs.mkdirSync(path.join(desktop, studyID), { recursive: true });
    fs.mkdirSync(path.join(desktop, studyID, participantID), { recursive: true });
    fs.mkdirSync(path.join(desktop, studyID, participantID, date), { recursive: true });

    return folderPath;
    // END OF ADDED SECTION
  }
};

const getFullPath = (fileName) => {
  return path.join(savePath, fileName);
};

// Read version file (git sha and branch)
const git = JSON.parse(fs.readFileSync(path.resolve(__dirname, "config/version.json")));

// Get Participant Id and Study Id from environment
ipc.on("syncCredentials", (event) => {
  event.returnValue = {
    envParticipantId: process.env.REACT_APP_PARTICIPANT_ID,
    envStudyId: process.env.REACT_APP_STUDY_ID,
  };
});

// listener for new data
ipc.on("data", (event, args) => {
  if (args.participant_id && args.study_id && !fileCreated) {
    // initialize file - we got a participant_id to save the data to -- should have args.login_data by now too
    const dir = app.getPath("userData");
    const dcode = today.getTime();
    participantID = args.participant_id;
    studyID = args.study_id;
    preSavePath = path.resolve(dir, `pid_${participantID}_${dcode}.json`);
    startTrial = args.trial_index;
    log.warn(preSavePath);
    stream = fs.createWriteStream(preSavePath, { flags: "ax+" });
    stream.write("[");

    preSavePath_csv = path.resolve(dir, `pid_${participantID}_${dcode}.csv`);
    log.warn(preSavePath_csv);
    //console.log('first test of CSV file: ',preSavePath_csv)
    stream_csv = fs.createWriteStream(preSavePath_csv, { flags: "ax+" });
    stream_csv.write("Start: " + args.login_data.start_date + "\n");
    stream_csv.write("Resp mode: " + args.login_data.respmode + "\n");
    stream_csv.write("Two-choice mode: " + args.login_data.twochoice + "\n");
    stream_csv.write("Self-paced mode: " + args.login_data.selfpaced + "\n");
    stream_csv.write(
      "Set.Subset: " + `${args.login_data.stimset}.${args.login_data.sublist}` + "\n"
    );
    stream_csv.write("Language: " + args.login_data.language + "\n");
    stream_csv.write("Consent included: " + args.login_data.include_consent + "\n");
    stream_csv.write("Demographics included: " + args.login_data.include_demog + "\n");
    stream_csv.write("Perceptual control included: " + args.login_data.include_pcon + "\n");
    stream_csv.write("Instructions included: " + args.login_data.include_instr + "\n");
    stream_csv.write("\n");
    fileCreated = true;
  }

  if (savePath === "") {
    savePath = getSavePath(studyID, participantID);
  }
  //console.log(' RAW ', args.trial_type, args.trial_index, args.task )
  // we have a set up stream to write to, write to it!
  if (stream) {
    // write intermediate commas
    if (args.trial_index > startTrial) {
      stream.write(",");
    }

    // write the data
    let data = JSON.stringify({ ...args, git });
    data = data.replace('{"summary"', ',{"summary"');
    stream.write(data);

    // Copy provocation images to participant's data folder
    // CELS: NO CLUE WHAT / WHY FOR THIS LINE
    // if (args.trial_type === 'image-keyboard-response') images.push(args.stimulus.slice(7));
  }
  if (stream_csv) {
    // format the output here based on the task
    if (args.task == "consent") {
      stream_csv.write("Consent\n");
      if (args.response == 0) {
        stream_csv.write("Yes\n");
      } else {
        stream_csv.write("No");
      }
      stream_csv.write("\n");
    } else if (args.task == "demographics") {
      stream_csv.write("Name, DOB, Gender, Ethnicity, Race\n");
      stream_csv.write(
        args.response.fullname +
          ", " +
          args.response.dob +
          ", " +
          args.response.gender +
          ", " +
          args.response.ethnicity +
          ", " +
          args.response.race +
          "\n"
      );
    } else if (args.trial_type == "preload") {
      // Use this to figure out when this sub-task starts
      trial_offset = args.trial_index;
      //console.log('OFFSET IS', trial_offset);
    } else if (args.task == "pcon") {
      //const d=args;
      const trial_num = (args.trial_index - trial_offset) / 4 - 3; // Factor out when the task started, and the multi-steps per actual trial
      //console.log('TRIAL ', args.trial_index, trial_num);
      if (trial_num == 1) {
        // Should get triggered on the first actual data trial
        //console.log('FIRST TRIAL');
        stream_csv.write("Trial, CResp, Resp, Correct, RT\n");
      }
      if (typeof args.cresp !== "undefined") {
        // actual data trial
        //console.log ('DATA TRIAL', d.trial_index, (d.trial_index - trial_offset)/4-3, d.resp, d.response, trial_offset )
        stream_csv.write(
          trial_num +
            ", " +
            args.cresp +
            ", " +
            args.resp +
            ", " +
            args.correct +
            ", " +
            args.rt +
            "\n"
        );
      }
    } else if (args.task == "MSTT") {
      const trial_num = args.trial_index - trial_offset - 2; // pull off the offset, preload, and instruction screen
      //console.log('OMST ', trial_offset, args.trial_index, args.correct_response, trial_num);
      if (trial_num == 1) {
        // Should get triggered on the first actual data trial
        //console.log('FIRST TRIAL');
        stream_csv.write("Trial, CResp, Resp, Resp-raw, Correct, RT, cond, lbin, stim\n");
      }
      if (typeof args.correct_response !== "undefined") {
        // actual data trial -- they may all be??
        //console.log ('DATA TRIAL', d.trial_index, (d.trial_index - trial_offset)/4-3, d.resp, d.response, trial_offset )
        stream_csv.write(
          trial_num +
            ", " +
            args.correct_response +
            ", " +
            args.resp +
            ", " +
            args.response +
            ", " +
            args.correct +
            ", " +
            args.rt +
            ", " +
            args.condition +
            ", " +
            args.lbin +
            ", " +
            args.stimulus +
            "\n"
        );
      }
      // else {
      //   console.log('WTF',args);
      // }
    } else if (args.task == "MSTS") {
      const trial_num = args.trial_index - trial_offset - 1; // pull off the offset & preload
      if (trial_num == 1) {
        // Should get triggered on the first actual data trial
        //console.log('FIRST TRIAL');
        stream_csv.write("Trial, Resp, Resp-raw, stim\n");
      }
      if (typeof args.response !== "undefined") {
        // actual data trial -- they may all be??
        //console.log ('DATA TRIAL', d.trial_index, (d.trial_index - trial_offset)/4-3, d.resp, d.response, trial_offset )
        stream_csv.write(
          trial_num +
            ", " +
            args.resp +
            ", " +
            args.response +
            ", " +
            args.rt +
            ", " +
            args.stimulus +
            "\n"
        );
      }

    } else if (args.task == "end") {
      //stream_csv.write('End\n' + args.login_data + '\n');
      console.log(args.login_data);
    } else if (typeof args.summary !== "undefined") {
      // final summary
      stream_csv.write("\nSummary\n");
      stream_csv.write("Perceptual control\n" + args.summary.pconsummary + "\n");
      stream_csv.write("MSTT\n" + args.summary.msttsummary + "\n");
    }
    // else {
    //   console.log('UNKNOWN', args);
    // }
  }
});

// Save Video
ipc.on("save_video", (event, videoFileName, buffer) => {
  if (savePath === "") {
    savePath = getSavePath(studyID, participantID);
  }

  if (VIDEO) {
    const fullPath = getFullPath(videoFileName);
    fs.outputFile(fullPath, buffer, (err) => {
      if (err) {
        event.sender.send("ERROR", err.message);
      } else {
        event.sender.send("SAVED_FILE", fullPath);
        console.log(fullPath);
      }
    });
  }
});

// EXPERIMENT END
ipc.on("end", () => {
  // quit app
  //console.log('on end')
  app.quit();
});

// Error state sent from front end to back end (e.g. wrong number of images)
ipc.on("error", (event, args) => {
  log.error(args);
  const buttons = ["OK"];
  if (process.env.ELECTRON_START_URL) {
    buttons.push("Continue Anyway");
  }
  const opt = dialog.showMessageBoxSync(mainWindow, {
    type: "error",
    message: args,
    title: "Task Error",
    buttons,
  });

  if (opt === 0) app.exit();
});

// log uncaught exceptions
process.on("uncaughtException", (error) => {
  // Handle the error
  log.error(error);

  // this isn't dev, throw up a dialog
  //if (!process.env.ELECTRON_START_URL) {
  //  dialog.showMessageBoxSync(mainWindow, { type: "error", message: error, title: "Task Error" });
  //}
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createWindow();
});
// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// EXPERIMENT END
app.on("will-quit", () => {
  //console.log('on will-quit')
  if (fileCreated) {
    // finish writing file
    //stream.write(']');
    //console.log('will-quit - stream status', stream.closed, stream.destroyed, !stream.closed, stream.writable)
    if (stream.writable) {
      stream.end("]");
    }
    stream = false;
    if (stream_csv.writable) {
      stream_csv.end("\n");
    }
    stream_csv = false;
    // copy file to config location
    //console.log('  will-quit, copyFileSync bit...')
    fs.mkdir(savePath, { recursive: true }, (err) => {
      log.error(err);
      fs.copyFileSync(preSavePath, getFullPath(`pid_${participantID}_${today.getTime()}.json`));
      fs.copyFileSync(preSavePath_csv, getFullPath(`pid_${participantID}_${today.getTime()}.csv`));
    });
  }
});
