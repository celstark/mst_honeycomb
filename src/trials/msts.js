//*******************************************************************
//
//   File: msts.js               Folder: trials
//
//   Author: Craig Stark
//   --------------------
//
//   This file includes the misc helper trials, instructions and debrief trials
//   as well as the data anlaysis function for the MST study phase
//
//*******************************************************************

import jsPsychPreload from "@jspsych/plugin-preload";
//import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
//import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
//import { lang, resp_mode } from "../App/components/Login";

var msts_preload = {
  type: jsPsychPreload,
  auto_preload: true,
};

/* var msts_refresh_choice = function () {
  if (resp_mode == "button") {
    return [lang.st.button.study_choices];
  } else {
    return lang.st.key.study_choices;
  }
};

var msts_refresh_prompt = function () {
  if (resp_mode == "button") {
    return "<p>" + lang.st.button.study_prompt + "</p>";
  } else {
    return "<p>" + lang.st.key.study_prompt + "</p>";
  }
};


var msts_instr_trial = {}; */

function refresh_msts_trials() {
  /*   msts_instr_trial = {
    type: resp_mode == "button" ? jsPsychHtmlButtonResponse : jsPsychHtmlKeyboardResponse,
    choices: msts_refresh_choice,
    prompt: msts_refresh_prompt,
    margin_horizontal: "40px",
    margin_vertical: "20px",
    //        button_html: '<button style="font-size: 150%" class="jspsych-btn">%choice%</button>',
    //stimulus: instr_stim,
    // add task name to data collection
    data: { task: "MSTS" },
  }; */
  console.log("Refreshing .. don't think there's anything to do...");
}

export { refresh_msts_trials, msts_preload };
