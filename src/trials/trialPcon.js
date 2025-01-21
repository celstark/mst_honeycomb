//*******************************************************************
//
//   File: trialPcon.js               Folder: trials
//
//   Author: Craig Stark, Audrey Hempel
//   --------------------
//
//   Changes:
//        7/31/23 (AGH): initial convert from pcon.html into honeycomb
//                       template
//        8/11/23 (AGH): changed trial_txt to trial_text for consistency
//
//   --------------------
//   This file contains the default options for the two variable
//   portions of the pcon test trials (the INITIAL display of the image
//   and the SECOND image with user response). trialPcon, keyPconTrial
//   and buttonPconTrial are exported as functions and looped in
//   ../timelines/pconTrial
//
//*******************************************************************

//----------------------- 1 ----------------------
//-------------------- IMPORTS -------------------

import jsPsychImageKeyboardResponse from "@jspsych/plugin-image-keyboard-response";
import jsPsychImageButtonResponse from "@jspsych/plugin-image-button-response";

import $ from "jquery";

//import { resp_mode } from '../trials/selectRespType';
import { lang, resp_mode } from "../App/components/Login";

//----------------------- 2 ----------------------
//----------------- HELPER METHODS ---------------
// Helper methods that allow flexibilty for selection of language, resp_mode
// and twochoice

var trial_prompt = function () {
  if (resp_mode == "button") {
    return "<p>" + lang.pcon.button.trial_txt + "</p>";
  } else {
    return "<p>" + lang.pcon.key.trial_txt + "</p>";
  }
};

var trial_choices = function () {
  if (resp_mode == "button") {
    return [`${lang.pcon.button.trial_choices.same}`, `${lang.pcon.button.trial_choices.dif}`];
  } else {
    return [`${lang.pcon.key.trial_choices.same}`, `${lang.pcon.key.trial_choices.dif}`];
  }
};

//----------------------- 3 ----------------------
//-------------------- TRIALS --------------------

//-------------------- INITIAL -------------------
// Initial image display (does not illicit user response):
// image is the only param that changes

export function trialPcon(config, options) {
  // set default trial parameters for keyboard response
  const defaults = {
    responseType: jsPsychImageKeyboardResponse,
    stimulusHeight: 400,
    stimulusWidth: 400,
    choices: "NO_KEYS",
    trialDuration: 2000,
    responseEndsTrial: false,
    image: "", // image will be different for each
  };
  const {
    stimulusHeight,
    stimulusWidth,
    //choices,
    trialDuration,
    responseEndsTrial,
    image,
  } = { ...defaults, ...options };

  // return defaults
  return {
    type: jsPsychImageKeyboardResponse,
    stimulus: image,
    choices: trial_choices,
    trial_duration: trialDuration,
    response_ends_trial: responseEndsTrial,
    on_load: () => {
      $("#jspsych-image-keyboard-response-stimulus").addClass("image");
      $("#jspsych-image-keyboard-response-stimulus").height(stimulusHeight);
      $("#jspsych-image-keyboard-response-stimulus").width(stimulusWidth);
      $("html").css("cursor", "none");
    },
  };
}

//-------------------- SECOND --------------------
// Keyboard and button versions of second image display
// image and data change between iterations

// Keyboard version
export function keyPconTrial(config, options) {
  // set default trial parameters for keyboard response
  const defaults = {
    responseType: jsPsychImageKeyboardResponse,
    stimulusHeight: 400,
    stimulusWidth: 400,
    choices: trial_choices,
    prompt: trial_prompt,
    stimulusDuration: 2000,
    trialDuration: null,
    responseEndsTrial: true,
    name: "keyPcon",
    image: "", // image and data will be different for each
    data: "", // image and data will be different for each
  };
  const {
    stimulusHeight,
    stimulusWidth,
    //choices,
    prompt,
    stimulusDuration,
    trialDuration,
    responseEndsTrial,
    name,
    image,
    data,
  } = { ...defaults, ...options };

  // return defaults
  return {
    type: jsPsychImageKeyboardResponse,
    stimulus: image,
    choices: trial_choices,
    prompt: prompt,
    stimulus_duration: stimulusDuration,
    trial_duration: trialDuration,
    response_ends_trial: responseEndsTrial,
    name: name,
    on_load: () => {
      $("#jspsych-image-keyboard-response-stimulus").addClass("image");
      $("#jspsych-image-keyboard-response-stimulus").height(stimulusHeight);
      $("#jspsych-image-keyboard-response-stimulus").width(stimulusWidth);
      $("html").css("cursor", "none");
    },
    on_finish: function (data) {
      // same = button 0 = 's'
      // different = button 1 = 'd'
      let resp = null;
      if (data.response == "s") {
        resp = "s";
      } else if (data.response == "d") {
        resp = "d";
      }
      //console.log(data.cresp, jsPsych.timelineVariable('cresp'))
      data.correct = resp == data.cresp;
      data.resp = resp;
      console.log(data.resp, data.cresp, data.correct);
    },
    data: data,
  };
}

// Button version
export function buttonPconTrial(config, options) {
  // set default trial parameters for button response
  const defaults = {
    responseType: jsPsychImageButtonResponse,
    stimulusHeight: 400,
    stimulusWidth: 400,
    choices: trial_choices,
    prompt: trial_prompt,
    stimulusDuration: 2000,
    trialDuration: null,
    responseEndsTrial: true,
    name: "buttonPcon",
    image: "", // image and data will be different for each
    data: "", // image and data will be different for each
  };
  const {
    stimulusHeight,
    stimulusWidth,
    //choices,
    prompt,
    stimulusDuration,
    trialDuration,
    responseEndsTrial,
    name,
    image,
    data,
  } = { ...defaults, ...options };

  // return defaults
  return {
    type: jsPsychImageButtonResponse,
    stimulus: image,
    choices: trial_choices,
    prompt: prompt,
    stimulus_duration: stimulusDuration,
    trial_duration: trialDuration,
    response_ends_trial: responseEndsTrial,
    name: name,
    on_load: () => {
      $("#jspsych-image-button-response-stimulus").addClass("image");
      $("#jspsych-image-button-response-stimulus").height(stimulusHeight);
      $("#jspsych-image-button-response-stimulus").width(stimulusWidth);
      $("html").css("cursor", "auto");
    },
    on_finish: function (data) {
      // same = button 0 = 's'
      // different = button 1 = 'd'
      let resp = null;
      if (data.response == 0) {
        resp = "s";
      } else if (data.response == 1) {
        resp = "d";
      }
      //console.log(data.cresp, jsPsych.timelineVariable('cresp'))
      data.correct = resp == data.cresp;
      data.resp = resp;
      console.log(data.resp, data.cresp, data.correct);
    },
    data: data,
  };
}
