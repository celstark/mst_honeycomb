//*******************************************************************
//
//   File: main.js               Folder: config
//
//   Author: Honeycomb, Audrey Hempel
//   --------------------
//
//   Changes:
//        6/20/23 (AGH): removed language selection to /trials/selectLanguage.js
//        5/9/24 (CELS): Added bit to fix the order of the oMST
//
//   --------------------
//   This is the main configuration file where universal and default settings
//   should be placed. These settins can then be imported anywhere in the app
//   as they are exported at the botom of the file.
//
//*******************************************************************

//----------------------- 1 ----------------------
//-------------------- IMPORTS -------------------

import { initJsPsych } from "jspsych";
import { init } from "@brown-ccv/behavioral-task-trials";
import { getProlificId } from "../lib/utils";
import packageInfo from "../../package.json";
import _ from "lodash";

//----------------------- 2 ----------------------
//--------------- HONEYCOMB CONFIGS --------------

// Access package name and version so we can store these as facts with task data.
const taskName = packageInfo.name;
const taskVersion = packageInfo.version;
console.log("Task version", taskVersion);

// As of jspsych 7, we instantiate jsPsych where needed instead of importing it globally.
// The instance here gives access to utils in jsPsych.turk, for awareness of the mturk environment, if any.
// The actual task and related utils will use a different instance of jsPsych created after login.
const jsPsych = initJsPsych();

// mapping of letters to key codes
const keys = {
  A: 65,
  B: 66,
  C: 67,
  F: 70,
  J: 74,
  space: 32,
};

// is this mechanical turk?
const turkInfo = jsPsych.turk.turkInfo();
const USE_MTURK = !turkInfo.outsideTurk;
const turkUniqueId = `${turkInfo.workerId}:${turkInfo.assignmentId}`; // ID of the user in mechanical turk

// Whether or not the experiment is running in Electron (local app)
let USE_ELECTRON = true;
try {
  window.require("electron");
} catch (error) {
  USE_ELECTRON = false;
}

const USE_PROLIFIC = (getProlificId() && !USE_MTURK) || false; // Whether or not the experiment is running with Prolific
const USE_FIREBASE = process.env.REACT_APP_FIREBASE === "true"; // Whether or not the experiment is running in Firebase (web app)

const USE_VOLUME = process.env.REACT_APP_VOLUME === "true"; // whether or not to ask the participant to adjust the volume
const USE_CAMERA = process.env.REACT_APP_VIDEO === "true" && USE_ELECTRON; // whether or not to enable video
const USE_EEG = process.env.REACT_APP_USE_EEG === "true" && USE_ELECTRON; // whether or not the EEG/event marker is available
const USE_PHOTODIODE = process.env.REACT_APP_USE_PHOTODIODE === "true" && USE_ELECTRON; // whether or not the photodiode is in use

const defaultBlockSettings = {
  randomize_order: false,
  // FIX -- this really is vestigial
  conditions: ["a", "b", "c"],
  repeats_per_condition: 1, // number of times every condition is repeated
  is_practice: false,
  is_tutorial: false,
  photodiode_active: false,
};

/**
 * Configuration object for Honeycomb
 */
const config = init({
  USE_PHOTODIODE,
  USE_EEG,
  USE_ELECTRON,
  USE_MTURK,
  USE_VOLUME,
  USE_CAMERA,
  USE_PROLIFIC,
  USE_FIREBASE,
});

//----------------------- 3 ----------------------
//-------------------- EXPORTS -------------------

/** Determine the task settings to be used   */

// Honeycomb's default task settings
let taskSettings = {
  fixation: {
    durations: [250, 500, 750, 1000, 1250, 1500, 1750, 2000],
    default_duration: 1000,
    randomize_duration: false,
  },
};
try {
  taskSettings = _.merge(
    // Honeycomb's default task settings
    taskSettings,
    // Override default task settings with settings from the config file
    require("./config.json")
  );
} catch (error) {
  // Try will fail if require doesn't find the json file
  console.warn("Unable to load task settings from config.json");
}

/** Export the settings so they can be used anywhere in the app */
export {
  //audioCodes,
  config,
  // eventCodes,
  //language,
  defaultBlockSettings,
  taskName,
  taskSettings,
  taskVersion,
  turkUniqueId,
  keys,
};
