/** ELECTRON MAIN PROCESS */

const url = require("url");
const path = require("node:path");
const fs = require("node:fs");

const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const log = require("electron-log");
const _ = require("lodash");

// TODO @brown-ccv #340: Use Electron's web serial API (remove event-marker dependency)
//const { getPort, sendToPort } = require("event-marker");

// Early exit when installing on Windows: https://www.electronforge.io/config/makers/squirrel.windows#handling-startup-events
if (require("electron-squirrel-startup")) app.quit();

// Initialize the logger for any renderer process
log.initialize({ preload: true });

// TODO @brown-ccv #192: Handle data writing to desktop in a utility process
// TODO @brown-ccv #192: Handle video data writing to desktop in a utility process
// TODO @brown-ccv #398: Separate log files for each run through
// TODO @brown-ccv #429: Use app.getPath('temp') for temporary JSON file

/************ GLOBALS ***********/

const GIT_VERSION = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../version.json")));
// TODO @brown-ccv #436 : Use app.isPackaged() to determine if running in dev or prod
const ELECTRON_START_URL = process.env.ELECTRON_START_URL;

let CONFIG; // Honeycomb configuration object

let TEMP_FILE; // Path to the temporary output file
let OUT_PATH; // Path to the final output folder (on the Desktop)
let OUT_FILE; // Name of the final output file
let CSV_FILE; // Name of CSV version of output -- CELS
let trial_offset = 0; // CELS -- given our multiple phases, we need to know what jsPsych trial num really was the start of the data.

/************ APP LIFECYCLE ***********/

/**
 * Executed when the app is initialized
 * @windows Builds the Electron window
 * @mac Builds the Electron window
 */
app.whenReady().then(() => {
  log.info("App Ready: ", app.name);

  // Handle ipcRenderer events (on is renderer -> main, handle is renderer <--> main)
  ipcMain.on("setConfig", handleSetConfig);
  ipcMain.handle("getCredentials", handleGetCredentials);
  ipcMain.on("onDataUpdate", handleOnDataUpdate);
  ipcMain.handle("onFinish", handleOnFinish);
  ipcMain.on("saveVideo", handleSaveVideo);

  // Create the Electron window
  createWindow();

  /**
   * Executed when the app is launched (e.g. clicked on from the taskbar)
   * @windows Creates a new window if there are none (note this shouldn't happen because the app is quit when there are no Windows)
   * @mac Creates a new window if there are none
   */
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

/**
 * Executed when all app windows are closed
 * @windows Quits the application
 * @mac Closes the window, app remains running in the Dock
 */
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

/** Executed before the application begins closing its windows */
app.on("before-quit", () => {
  log.info("Attempting to quit application");
  try {
    JSON.parse(fs.readFileSync(TEMP_FILE));
  } catch (error) {
    if (error instanceof TypeError) {
      // TEMP_FILE is undefined at this point
      log.warn("Application quit before the participant started the experiment");
    } else if (error instanceof SyntaxError) {
      // Trials are still being written (i.e. hasn't hit handleOnFinish function)
      log.warn("Application quit while the participant was completing the experiment");
    } else {
      log.error("Electron encountered an error while quitting:");
      log.error(error);
    }
  }
});

/** Log any uncaught exceptions before quitting */
process.on("uncaughtException", (error) => {
  log.error(error);
  app.quit();
});

/************ LOCAL BITS ************* */
/*
// INCREMENTAL FILE SAVING // 3.2.x code, modified
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

const getSavePath = (studyID, participantID) => {  // 3.2.x code, modified
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

const getFullPath = (fileName) => { // 3.2.x code
  return path.join(savePath, fileName);
};


// 7/10/23 (AGH) ADDED: this function was added to allow the application to save data if the window is
// closed before the completion of the experiment
const saveDataAndQuit = () => { // 3.2.x code, modified
  const dcode = today.getTime();
  if (stream) {
    stream.end("]");
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
    stream_csv.end("\n");
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
*/

/*********** RENDERER EVENT HANDLERS ***********/

/**
 * Receives the Honeycomb config settings and passes them to the CONFIG global in this file
 * @param {Event} event The Electron renderer event
 * @param {Object} config The current Honeycomb configuration
 */
function handleSetConfig(event, config) {
  CONFIG = config;
  log.info("Honeycomb Configuration: ", CONFIG);
}

/**
 * Checks for REACT_APP_STUDY_ID and REACT_APP_PARTICIPANT_ID environment variables
 * Note that studyID and participantID are undefined when the environment variables are not given
 * @returns An object containing a studyID and participantID
 */
function handleGetCredentials() {
  const studyID = process.env.REACT_APP_STUDY_ID;
  const participantID = process.env.REACT_APP_PARTICIPANT_ID;
  if (studyID) log.info("Received study from ENV: ", studyID);
  if (participantID) log.info("Received participant from ENV: ", participantID);
  return { studyID, participantID };
}

/**
 * Receives the trial data and writes it to a temp file in AppData
 * The out path/file and writable stream are initialized if isn't yet
 * The temp file is written at ~/userData/[appName]/TempData/[studyID]/[participantID]/
 * @param {Event} event The Electron renderer event
 * @param {Object} data The trial data
 */
function handleOnDataUpdate(event, data) {
  const { participant_id, study_id, start_date, trial_index } = data;

  // Set the output path and file name if they are not set yet
  if (!OUT_PATH) {
    // The final OUT_FILE will be nested inside subfolders on the Desktop
    OUT_PATH = path.resolve(app.getPath("desktop"), app.getName(), study_id, participant_id);
    // TODO @brown-ccv #307: ISO 8061 data string? Doesn't include the punctuation
    OUT_FILE = `${start_date}.json`.replaceAll(":", "_"); // (":" are replaced to prevent issues with invalid file names);
  }
  if (!CSV_FILE) {
    // CELS
    // This file holds a simpler representation of the data.  We also stream this much like the TEMP_FILE as I'm paranoid
    // If we don't have it already, make the folder / file and add the header info
    const csvPath = path.resolve(app.getPath("desktop"), app.getName(), study_id, participant_id);
    fs.mkdirSync(csvPath, { recursive: true });
    CSV_FILE = path.resolve(csvPath, OUT_FILE.replaceAll(".json", ".csv"));

    // Write useful header info
    fs.appendFileSync(CSV_FILE, "Start: " + data.login_data.start_date + "\n");
    fs.appendFileSync(CSV_FILE, "Resp mode: " + data.login_data.respmode + "\n");
    fs.appendFileSync(CSV_FILE, "Two-choice mode: " + data.login_data.twochoice + "\n");
    fs.appendFileSync(CSV_FILE, "Self-paced mode: " + data.login_data.selfpaced + "\n");
    fs.appendFileSync(
      CSV_FILE,
      "Set.Subset: " + `${data.login_data.stimset}.${data.login_data.sublist}` + "\n"
    );
    fs.appendFileSync(CSV_FILE, "Language: " + data.login_data.language + "\n");
    fs.appendFileSync(CSV_FILE, "Consent included: " + data.login_data.include_consent + "\n");
    fs.appendFileSync(CSV_FILE, "Demographics included: " + data.login_data.include_demog + "\n");
    fs.appendFileSync(
      CSV_FILE,
      "Perceptual control included: " + data.login_data.include_pcon + "\n"
    );
    fs.appendFileSync(CSV_FILE, "Instructions included: " + data.login_data.include_instr + "\n");
    fs.appendFileSync(CSV_FILE, "\n");
  }
  if (CSV_FILE) {
    // CELS - should be open/exist by now
    // format the output here based on the task
    if (data.task == "consent") {
      fs.appendFileSync(CSV_FILE, "Consent\n");
      if (data.response == 0) {
        fs.appendFileSync(CSV_FILE, "Yes\n");
      } else {
        fs.appendFileSync(CSV_FILE, "No");
      }
      fs.appendFileSync(CSV_FILE, "\n");
    } else if (data.task == "demographics") {
      fs.appendFileSync(CSV_FILE, "Name, DOB, Gender, Ethnicity, Race\n");
      fs.appendFileSync(
        CSV_FILE,
        data.response.fullname +
          ", " +
          data.response.dob +
          ", " +
          data.response.gender +
          ", " +
          data.response.ethnicity +
          ", " +
          data.response.race +
          "\n"
      );
    } else if (data.trial_type == "preload") {
      // Use this to figure out when this sub-task starts
      trial_offset = data.trial_index;
      //console.log('OFFSET IS', trial_offset);
    } else if (data.task == "pcon") {
      //const d=data;
      const trial_num = (data.trial_index - trial_offset) / 4 - 3; // Factor out when the task started, and the multi-steps per actual trial
      //console.log('TRIAL ', data.trial_index, trial_num);
      if (trial_num == 1) {
        // Should get triggered on the first actual data trial
        //console.log('FIRST TRIAL');
        fs.appendFileSync(CSV_FILE, "Trial, CResp, Resp, Correct, RT\n");
      }
      if (typeof data.cresp !== "undefined") {
        // actual data trial
        //console.log ('DATA TRIAL', d.trial_index, (d.trial_index - trial_offset)/4-3, d.resp, d.response, trial_offset )
        fs.appendFileSync(
          CSV_FILE,
          trial_num +
            ", " +
            data.cresp +
            ", " +
            data.resp +
            ", " +
            data.correct +
            ", " +
            data.rt +
            "\n"
        );
      }
    } else if (data.task == "oMSTCont") {
      const trial_num = data.trial_index - trial_offset - 2; // pull off the offset, preload, and instruction screen
      //console.log('OMST ', trial_offset, data.trial_index, data.correct_response, trial_num);
      if (trial_num == 1) {
        // Should get triggered on the first actual data trial
        //console.log('FIRST TRIAL');
        fs.appendFileSync(
          CSV_FILE,
          "Trial, CResp, Resp, Resp-raw, Correct, RT, cond, lbin, stim\n"
        );
      }
      if (typeof data.correct_response !== "undefined") {
        // actual data trial -- they may all be??
        //console.log ('DATA TRIAL', d.trial_index, (d.trial_index - trial_offset)/4-3, d.resp, d.response, trial_offset )
        fs.appendFileSync(
          CSV_FILE,
          trial_num +
            ", " +
            data.correct_response +
            ", " +
            data.resp +
            ", " +
            data.response +
            ", " +
            data.correct +
            ", " +
            data.rt +
            ", " +
            data.condition +
            ", " +
            data.lbin +
            ", " +
            data.stimulus +
            "\n"
        );
      }
      // else {
      //   console.log('WTF',data);
      // }
    } else if (data.task == "end") {
      //fs.appendFileSync(CSV_FILE,'End\n' + data.login_data + '\n');
      console.log(data.login_data);
    } else if (typeof data.summary !== "undefined") {
      // final summary
      fs.appendFileSync(CSV_FILE, "\nSummary\n");
      fs.appendFileSync(CSV_FILE, "Perceptual control\n" + data.summary.pconsummary + "\n");
      fs.appendFileSync(CSV_FILE, "oMST\n" + data.summary.contsummary + "\n");
    }
  }

  // Create the temporary folder & file if it hasn't been created
  // TODO @brown-ccv #397: Initialize file stream on login, not here
  if (!TEMP_FILE) {
    // The tempFile is nested inside "TempData" in the user's local app data folder
    const tempPath = path.resolve(app.getPath("userData"), "TempData", study_id, participant_id);
    fs.mkdirSync(tempPath, { recursive: true });
    TEMP_FILE = path.resolve(tempPath, OUT_FILE);

    // Write initial bracket
    fs.appendFileSync(TEMP_FILE, "{");
    log.info("Temporary file created at ", TEMP_FILE);

    // Write useful information and the beginning of the trials array
    fs.appendFileSync(TEMP_FILE, `"start_time": "${start_date}",`);
    fs.appendFileSync(TEMP_FILE, `"git_version": ${JSON.stringify(GIT_VERSION)},`);
    fs.appendFileSync(TEMP_FILE, `"trials": [`);
  }

  // Prepend comma for all trials except first
  if (trial_index > 0) fs.appendFileSync(TEMP_FILE, ",");

  // Write trial data
  fs.appendFileSync(TEMP_FILE, JSON.stringify(data));

  log.info(`Trial ${trial_index} successfully written to TempData`);
}

/**
 * Finishes writing to the writable stream and copies the file to the Desktop
 * File is saved inside ~/Desktop/[appName]/[studyID]/[participantID]/
 */
function handleOnFinish() {
  log.info("Experiment Finished");

  // Finish writing JSON
  fs.appendFileSync(TEMP_FILE, "]}");
  log.info("Finished writing experiment data to TempData");

  // Move temp file to the output location
  const filePath = path.resolve(OUT_PATH, OUT_FILE);
  try {
    fs.mkdirSync(OUT_PATH, { recursive: true });
    fs.copyFileSync(TEMP_FILE, filePath);
    log.info("Successfully saved experiment data to ", filePath);
  } catch (e) {
    log.error.error("Unable to save file: ", filePath);
    log.error.error(e);
  }
  app.quit();
}

// Save webm video file
// TODO @brown-ccv #342: Rolling save of webm video, remux to mp4 at the end?
function handleSaveVideo(event, data) {
  // Video file is the same as OUT_FILE except it's mp4, not json
  const filePath = path.join(
    path.dirname(OUT_FILE),
    path.basename(OUT_FILE, path.extname(OUT_FILE)) + ".webm"
  );

  log.info(filePath);

  // Save video file to the desktop
  try {
    // Note the video data is sent to the main process as a base64 string
    const videoData = Buffer.from(data.split(",")[1], "base64");

    fs.mkdirSync(OUT_PATH, { recursive: true });
    // TODO @brown-ccv #342: Convert to mp4 before final save? https://gist.github.com/AVGP/4c2ce4ab3c67760a0f30a9d54544a060
    fs.writeFileSync(path.join(OUT_PATH, filePath), videoData);
  } catch (e) {
    log.error.error("Unable to save file: ", filePath);
    log.error.error(e);
  }
  log.info("Successfully saved video file to ", filePath);
}

/********** HELPERS **********/

/**
 * Load the app into the Electron window
 * In production it loads the local bundle created by the build process
 */
function createWindow() {
  let mainWindow;
  let appURL;
  const os = require("os");
  if (os.platform() === "darwin") {
    const nativeImage = require("electron").nativeImage;
    const image = nativeImage.createFromPath("public/MSTLogo512.png");
    console.log(image);
    app.dock.setIcon(image);
  }
  if (ELECTRON_START_URL) {
    // Running in development

    // Load app from localhost (This allows hot-reloading)
    appURL = ELECTRON_START_URL;

    // Create a 1500x900 window with the dev tools open
    mainWindow = new BrowserWindow({
      icon: "./public/MST.ico",
      webPreferences: { preload: path.join(__dirname, "preload.js") },
      width: 1500,
      height: 900,
    });

    // Open the dev tools
    mainWindow.webContents.openDevTools();
  } else {
    // Running in production

    // Load app from the local bundle created by the build process
    appURL = url.format({
      // Moves from path of the electron file (/public/electron/main.js) to build folder (build/index.html)
      // TODO @brown-ccv #424: electron-forge should only be packaging the build folder (package.json needs to point to that file?)
      pathname: path.join(__dirname, "../../build/index.html"),
      protocol: "file:",
      slashes: true,
    });

    // Create a fullscreen window with the menu bar hidden
    mainWindow = new BrowserWindow({
      icon: "./public/MST.ico",
      webPreferences: { preload: path.join(__dirname, "preload.js") },
      fullscreen: true,
      menuBarVisible: false,
    });

    // Hide the menu bar
    mainWindow.setMenuBarVisibility(false);
  }

  // Load web contents at the given URL
  log.info("Loading URL: ", appURL);
  mainWindow.loadURL(appURL);
}
