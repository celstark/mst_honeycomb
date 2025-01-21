import jsPsychImageKeyboardResponse from "@jspsych/plugin-image-keyboard-response";
import jsPsychImageButtonResponse from "@jspsych/plugin-image-button-response";

import $ from "jquery";

//import { resp_mode } from '../trials/selectRespType';
import { selfpaced, lang, resp_mode } from "../App/components/Login";

//----------------------- 2 ----------------------
//----------------- HELPER METHODS ---------------
// Helper methods that allow flexibilty for selection of language, resp_mode
// and twochoice

var msts_trial_prompt = function () {
  if (resp_mode == "button") {
    return "<p>" + lang.st.button.study_prompt + "</p>";
  } else {
    return "<p>" + lang.st.key.study_prompt + "</p>";
  }
};

var msts_trial_choices = function () {
  if (resp_mode == "button") {
    return [`${lang.st.button.study_choices.indoor}`, `${lang.st.button.study_choices.outdoor}`];
  } else {
    return [`${lang.st.key.study_choices.indoor}`, `${lang.st.key.study_choices.outdoor}`];
  }
};

//----------------------- 3 ----------------------
//-------------------- TRIALS --------------------
// Keyboard version and button version

// Keyboard version
export function msts_keyTrial(config, options) {
  // set default trial parameters for keyboard response
  const defaults = {
    responseType: jsPsychImageKeyboardResponse,
    stimulusDuration: 2000,
    trialDuration: selfpaced == 1 ? null : 2500,
    postTrialGap: 500,
    stimulusHeight: 400,
    stimulusWidth: 400,
    trialChoices: msts_trial_choices,
    prompt: msts_trial_prompt,
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
      let resp = null;

      if (data.response == "i") {
        resp = "i";
      } else if (data.response == "o") {
        resp = "o";
      }
      if (data.response == "v") {
        resp = "i";
      } else if (data.response == "n") {
        resp = "o";
      }
      //data.correct =  resp == data.correct_response
      data.correct = true;
      data.resp = resp;
      console.log("RESP", data.resp, data.response);
    },
    data: data,
  };
}

// Button version
export function msts_buttonTrial(config, options) {
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
    trialChoices: msts_trial_choices,
    prompt: msts_trial_prompt,
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
      let resp = null;
      if (data.response == 0) {
        resp = "i";
      } else if (data.response == 2) {
        resp = "o";
      }
      data.correct = true;
      data.resp = resp;
    },
    data: data,
  };
}
