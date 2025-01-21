//*******************************************************************
//
//   File: trialMstt.js               Folder: trials
//
//   Author: Craig Stark, Audrey Hempel
//   --------------------
//
//   Changes:
//        6/28/23 (AGH): moved repeated test_trials from ./contOmst
//                       (defaults)
//        7/11/23 (AGH): added data parameter
//        7/14/23 (AGH): split conTrial into keyboard and button version
//                       to allow response selection (trial types cannot
//                       be dynamic)
//        7/14/23 (AGH): deleted margin parameters for keyboard trial, adjusted
//                       horizontal margin to 8px (same as instructions) and
//                       deleted cursor block for button trial
//        7/27/23 (AGH): added paragraph markers to param functions (previously
//                       within text file)
//        1/20/25 (CELS): Forked from the oMST variant
//
//   --------------------
//
//   This sets the basic defaults for MST test trial (every
//   parameter except stimulus and data specifications that vary
//   trial to trial) keyContTrial and buttonContTrial are exported as
//   functions and looped in ../timelines/msttTimeline.js
//
//*******************************************************************

//----------------------- 1 ----------------------
//-------------------- IMPORTS -------------------

import jsPsychImageKeyboardResponse from "@jspsych/plugin-image-keyboard-response";
import jsPsychImageButtonResponse from "@jspsych/plugin-image-button-response";

import $ from "jquery";

//import { resp_mode } from '../trials/selectRespType';
import { twochoice, selfpaced, lang, resp_mode } from "../App/components/Login";

//----------------------- 2 ----------------------
//----------------- HELPER METHODS ---------------
// Helper methods that allow flexibilty for selection of language, resp_mode
// and twochoice

var mstt_trial_prompt = function () {
  if (resp_mode == "button") {
    if (twochoice == 0) {
      return "<p>" + lang.cont.button.threechoice.trial_prompt + "</p>";
    } else {
      return "<p>" + lang.cont.button.twochoice.trial_prompt + "</p>";
    }
  } else {
    if (twochoice == 0) {
      return "<p>" + lang.cont.key.threechoice.trial_prompt + "</p>";
    } else {
      return "<p>" + lang.cont.key.twochoice.trial_prompt + "</p>";
    }
  }
};

var mstt_trial_choices = function () {
  if (resp_mode == "button") {
    if (twochoice == 0) {
      return [
        `${lang.cont.button.threechoice.trial_choices.old}`,
        `${lang.cont.button.threechoice.trial_choices.sim}`,
        `${lang.cont.button.threechoice.trial_choices.new}`,
      ];
    } else {
      return [
        `${lang.cont.button.twochoice.trial_choices.old}`,
        `${lang.cont.button.twochoice.trial_choices.new}`,
      ];
    }
  } else {
    if (twochoice == 0) {
      return [
        `${lang.cont.key.threechoice.trial_choices.old}`,
        `${lang.cont.key.threechoice.trial_choices.sim}`,
        `${lang.cont.key.threechoice.trial_choices.new}`,
      ];
    } else {
      return [
        `${lang.cont.key.twochoice.trial_choices.old}`,
        `${lang.cont.key.twochoice.trial_choices.new}`,
      ];
    }
  }
};

//----------------------- 3 ----------------------
//-------------------- TRIALS --------------------
// Keyboard version and button version

// Keyboard version
export function keyMsttTrial(config, options) {
  // set default trial parameters for keyboard response
  const defaults = {
    responseType: jsPsychImageKeyboardResponse,
    stimulusDuration: 2000,
    trialDuration: selfpaced == 1 ? null : 2500,
    postTrialGap: 500,
    stimulusHeight: 400,
    stimulusWidth: 400,
    trialChoices: mstt_trial_choices,
    prompt: mstt_trial_prompt,
    responseEndsTrial: true,

    image: "", // image and data will be different for each
    data: "", // iteration of the trial so their default is blank
  };
  const {
    stimulusDuration,
    trialDuration,
    postTrialGap,
    stimulusHeight,
    stimulusWidth,
    trialChoices,
    prompt,
    responseEndsTrial,
    image,
    data,
  } = { ...defaults, ...options };

  // return defaults
  return {
    type: jsPsychImageKeyboardResponse,
    prompt: prompt,
    stimulus: image,
    choices: trialChoices,
    stimulus_duration: stimulusDuration,
    trial_duration: trialDuration,
    post_trial_gap: postTrialGap,
    response_ends_trial: responseEndsTrial,
    on_load: () => {
      $("#jspsych-image-keyboard-response-stimulus").addClass("image");
      $("#jspsych-image-keyboard-response-stimulus").height(stimulusHeight);
      $("#jspsych-image-keyboard-response-stimulus").width(stimulusWidth);
      $("html").css("cursor", "none");
    },
    on_finish: function (data) {
      // set up data collection properties
      // yes = button 0 = 'y' = keycode 89
      // no = button 1 = 'n' = keycode 78
      // let resp = 'n';
      // if (resp_mode == 'button' && data.button_pressed == 0) { resp = 'y' }
      // if (resp_mode == 'keyboard' && data.key_press == 89 ) { resp = 'y' }
      let resp = null;
      if (data.response == "v") {
        resp = "o";
      } else if (data.response == "b") {
        resp = "s";
      } else if (data.response == "n") {
        resp = "n";
      }
      data.correct = resp == data.correct_response; // oMST variant had this simpler response
      data.resp = resp;
    },
    data: data,
  };
}

// Button version
export function buttonMsttTrial(config, options) {
  const defaults = {
    // set default trial parameters for button response
    responseType: jsPsychImageButtonResponse,
    stimulusDuration: 2000,
    trialDuration: selfpaced == 1 ? null : 2500,
    postTrialGap: 500,
    marginHorizontal: "8px",
    marginVertical: "20px",
    stimulusHeight: 400,
    stimulusWidth: 400,
    trialChoices: mstt_trial_choices,
    prompt: mstt_trial_prompt,
    responseEndsTrial: true,
    image: "", // image and data will be different for each
    data: "", // iteration of the trial so their default is blank
  };
  const {
    stimulusDuration,
    trialDuration,
    postTrialGap,
    marginHorizontal,
    marginVertical,
    stimulusHeight,
    stimulusWidth,
    trialChoices,
    prompt,
    responseEndsTrial,
    image,
    data,
  } = { ...defaults, ...options };

  // return defaults
  return {
    type: jsPsychImageButtonResponse,
    prompt: prompt,
    stimulus: image,
    choices: trialChoices,
    stimulus_duration: stimulusDuration,
    trial_duration: trialDuration,
    post_trial_gap: postTrialGap,
    response_ends_trial: responseEndsTrial,
    margin_horizontal: marginHorizontal,
    margin_vertical: marginVertical,
    on_load: () => {
      $("#jspsych-image-button-response-stimulus").addClass("image");
      $("#jspsych-image-button-response-stimulus").height(stimulusHeight);
      $("#jspsych-image-button-response-stimulus").width(stimulusWidth);
    },
    on_finish: function (data) {
      // set up data collection properties
      // yes = button 0 = 'y' = keycode 89
      // no = button 1 = 'n' = keycode 78
      // let resp = 'n';
      // if (resp_mode == 'button' && data.button_pressed == 0) { resp = 'y' }
      // if (resp_mode == 'keyboard' && data.key_press == 89 ) { resp = 'y' }
      let resp = null;
      if (data.response == 0) {
        resp = "o";
      } else if (data.response == 2) {
        resp = "n";
      } else if (data.response == 1) {
        resp = twochoice == 1 ? "n" : "s";
      }
      data.correct = resp == data.correct_response;
      //console.log('scoring',resp,data.response,data.correct_response,data.correct)
      data.resp = resp;
    },
    data: data,
  };
}
