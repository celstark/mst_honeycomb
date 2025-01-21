//****************************************************************************
//
//   File: instructions.js               Folder: trials
//
//   Author: Gavin Stark, Craig Stark, Audrey Hempel
//   --------------------
//
//   Changes:
//        6/12/23 (AGH): forked honeycomb, began to transfer trials from
//                       cmst_instr_contOSN.html into template (adding imports,
//                       exports, removing JATOS code)
//        6/14/23 (AGH): loaded images into ../assets and imported { images }
//                       from ../lib/utils
//        6/16/23 (AGH): created and imported custom plugins in ./uniqueplugins
//                       adpated from Craig's create-image-buttons plugin
//        6/20/23 (AGH): created ./selectLanguage and imported { lang }
//                       created ./selectRespType and imported { resp_mode }
//        6/22/23 (AGH): converted all the trial parameters dependent on lang
//                       and resp-mode into dynamic parameters
//        7/13/23 (AGH): added task as data property to each trial
//        7/14/23 (AGH): created button and key trials for each trial to allow
//                       response selection (trial types cannot be dynamic)
//        7/26/23 (AGH): consoladated button and key versions of trials with the
//                       refresh_instr_trials function that gets called at Login
//        7/27/23 (AGH): added paragraph markers to param functions (previously
//                       within text file)
//        8/1/23  (AGH): modified side-by-side stimuli and prompts for better
//                       formatting; CategorizeMultipleImage(Keyboard/Buttons)
//                       no longer necessary
//       1/20/25 (CELS): Restructured here so that we only export a timeline
//                       rather than individual trials (from add-classic)
//
//   --------------------
//   These trials are the instruction trials that explain to the
//   participant how to partake in the experiment and provide user
//   feedback.
//
//*******************************************************************************

//----------------------- 1 ----------------------
//-------------------- IMPORTS -------------------

// importing jspysch plugins
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychCategorizeImage from "@jspsych/plugin-categorize-image";

// importing unique plugins
import { jsPsychCategorizeImageButtons } from "./uniquePlugins/plugin-categorize-image-buttons.js";

// importing languages, images object, and response-mode
import { images } from "../lib/utils.js";
import { lang, resp_mode } from "../App/components/Login";

//----------------------- 2 ----------------------
//----------------- HELPER METHODS ---------------
// These methods house the dynamic parameters of the trials below. Each is a function that
// when called will determine the values of lang and resp_type to incorporate different
// languages and response types. EVERYTIME lang OR resp_type ARE USED, THEY MUST BE INSIDE
// A FUNCTION.

// var to store the task name (data property)
const phasename = "cmst_instr_contOSN";

var instr_choice = function () {
  if (resp_mode == "button") {
    return [lang.instructions.button.instr_choice];
  } else {
    return lang.instructions.key.instr_choice;
  }
};

var prompt0 = function () {
  if (resp_mode == "button") {
    return "<p>" + lang.instructions.button.prompt0 + "</p>";
  } else {
    return "<p>" + lang.instructions.key.prompt0 + "</p>";
  }
};

var prompt_new = function () {
  if (resp_mode == "button") {
    return "<p>" + lang.instructions.button.prompt_new + "</p>";
  } else {
    return "<p>" + lang.instructions.key.prompt_new + "</p>";
  }
};

var inc_new = function () {
  if (resp_mode == "button") {
    return "<p>" + lang.instructions.button.inc_new + "</p>";
  } else {
    return "<p>" + lang.instructions.key.inc_new + "</p>";
  }
};

var cor_new = function () {
  return "<p>" + lang.instructions.cor_new + "</p>";
};

var prompt_rep = function () {
  if (resp_mode == "button") {
    return "<p>" + lang.instructions.button.prompt_rep + "</p>";
  } else {
    return "<p>" + lang.instructions.key.prompt_rep + "</p>";
  }
};

var inc_rep = function () {
  if (resp_mode == "button") {
    return "<p>" + lang.instructions.button.inc_rep + "</p>";
  } else {
    return "<p>" + lang.instructions.key.inc_rep + "</p>";
  }
};

var cor_rep = function () {
  return "<p>" + lang.instructions.cor_rep + "</p>";
};

var prompt_lure = function () {
  if (resp_mode == "button") {
    return "<p>" + lang.instructions.button.prompt_lure + "</p>";
  } else {
    return "<p>" + lang.instructions.key.prompt_lure + "</p>";
  }
};

var inc_lure = function () {
  if (resp_mode == "button") {
    return "<p>" + lang.instructions.button.inc_lure + "</p>";
  } else {
    return "<p>" + lang.instructions.key.inc_lure + "</p>";
  }
};

var cor_lure = function () {
  return "<p>" + lang.instructions.cor_lure + "</p>";
};

var side_by_side1_stim = function () {
  return (
    "<p>" +
    lang.instructions.side_by_side +
    '</p><table style="width:100%"><tr><td><img src="' +
    images["pcon026a.jpg"] +
    '"><td><img src="' +
    images["pcon026b.jpg"] +
    '"></table>'
  );
};

var side_by_side2_stim = function () {
  return (
    "<p>" +
    lang.instructions.side_by_side +
    '</p><table style="width:100%"><tr><td><img src="' +
    images["pcon028a.jpg"] +
    '"><td><img src="' +
    images["pcon028b.jpg"] +
    '"></table>'
  );
};

var side_by_side_prompt = function () {
  if (resp_mode == "button") {
    return "<p>" + lang.instructions.button.continue + "</p>";
  } else {
    return "<p>" + lang.instructions.key.continue + "</p>";
  }
};

var prompt_test = function () {
  if (resp_mode == "button") {
    return (
      "<p>" +
      lang.instructions.prompt_test +
      "</p><p>" +
      lang.instructions.button.trial_txt +
      "</p>"
    );
  } else {
    return (
      "<p>" + lang.instructions.prompt_test + "</p><p>" + lang.instructions.key.trial_txt + "</p>"
    );
  }
};

var trial_choices = function () {
  if (resp_mode == "button") {
    return [
      `${lang.instructions.button.trial_choices.old}`,
      `${lang.instructions.button.trial_choices.sim}`,
      `${lang.instructions.button.trial_choices.new}`,
    ];
  } else {
    return [
      `${lang.instructions.key.trial_choices.old}`,
      `${lang.instructions.key.trial_choices.sim}`,
      `${lang.instructions.key.trial_choices.new}`,
    ];
  }
};

//----------------------- 3 ----------------------
//-------------------- TRIALS --------------------
// All the instructions trials.
// These trials call the functions housing the parameter information.

// trials declaration
var intro = {};
var new1 = {};
var new2 = {};
var new3 = {};
var repeat1 = {};
var lure1 = {};
var side_by_side1 = {};
var new4 = {};
var new5 = {};
var repeat2 = {};
var lure2 = {};
var side_by_side2 = {};
var outtro = {};
var omstinst_TL = [];

// function to refresh trials, called when Login options are set

function refresh_instr_trials() {
  console.log("...refreshing instr trials");

  intro = {
    type: resp_mode == "button" ? jsPsychHtmlButtonResponse : jsPsychHtmlKeyboardResponse,
    choices: instr_choice,
    prompt: prompt0,
    stimulus: function () {
      return lang.instructions.txt0;
    },
    data: { task: phasename },
  };

  new1 = {
    type: resp_mode == "button" ? jsPsychCategorizeImageButtons : jsPsychCategorizeImage,
    stimulus: images["foil_1032.jpg"],
    key_answer: function () {
      return lang.instructions.key.trial_choices.new;
    },
    button_answer: 2,
    choices: trial_choices,
    prompt: prompt_new,
    force_correct_button_press: true,
    incorrect_text: inc_new,
    correct_text: cor_new,
    data: { task: phasename },
  };

  new2 = {
    type: resp_mode == "button" ? jsPsychCategorizeImageButtons : jsPsychCategorizeImage,
    stimulus: images["foil_1033.jpg"],
    key_answer: function () {
      return lang.instructions.key.trial_choices.new;
    },
    button_answer: 2,
    choices: trial_choices,
    prompt: prompt_new,
    force_correct_button_press: true,
    incorrect_text: inc_new,
    correct_text: cor_new,
    data: { task: phasename },
  };

  new3 = {
    type: resp_mode == "button" ? jsPsychCategorizeImageButtons : jsPsychCategorizeImage,
    stimulus: images["pcon026a.jpg"],
    key_answer: function () {
      return lang.instructions.key.trial_choices.new;
    },
    button_answer: 2,
    choices: trial_choices,
    prompt: prompt_new,
    force_correct_button_press: true,
    incorrect_text: inc_new,
    correct_text: cor_new,
    data: { task: phasename },
  };

  repeat1 = {
    type: resp_mode == "button" ? jsPsychCategorizeImageButtons : jsPsychCategorizeImage,
    stimulus: images["foil_1033.jpg"],
    key_answer: function () {
      return lang.instructions.key.trial_choices.old;
    },
    button_answer: 0,
    choices: trial_choices,
    prompt: prompt_rep,
    force_correct_button_press: true,
    incorrect_text: inc_rep,
    correct_text: cor_rep,
    data: { task: phasename },
  };

  lure1 = {
    type: resp_mode == "button" ? jsPsychCategorizeImageButtons : jsPsychCategorizeImage,
    stimulus: images["pcon026b.jpg"],
    key_answer: function () {
      return lang.instructions.key.trial_choices.sim;
    },
    button_answer: 1,
    choices: trial_choices,
    prompt: prompt_lure,
    force_correct_button_press: true,
    incorrect_text: inc_lure,
    correct_text: cor_lure,
    data: { task: phasename },
  };

  side_by_side1 = {
    type: resp_mode == "button" ? jsPsychHtmlButtonResponse : jsPsychHtmlKeyboardResponse,
    stimulus: side_by_side1_stim,
    choices: instr_choice,
    prompt: side_by_side_prompt,
    data: { task: phasename },
  };

  new4 = {
    type: resp_mode == "button" ? jsPsychCategorizeImageButtons : jsPsychCategorizeImage,
    stimulus: images["foil_1035.jpg"],
    key_answer: function () {
      return lang.instructions.key.trial_choices.new;
    },
    button_answer: 2,
    choices: trial_choices,
    prompt: prompt_test,
    force_correct_button_press: true,
    incorrect_text: inc_new,
    correct_text: cor_new,
    data: { task: phasename },
  };

  new5 = {
    type: resp_mode == "button" ? jsPsychCategorizeImageButtons : jsPsychCategorizeImage,
    stimulus: images["pcon028a.jpg"],
    key_answer: function () {
      return lang.instructions.key.trial_choices.new;
    },
    button_answer: 2,
    choices: trial_choices,
    prompt: prompt_test,
    force_correct_button_press: true,
    incorrect_text: inc_new,
    correct_text: cor_new,
    data: { task: phasename },
  };

  repeat2 = {
    type: resp_mode == "button" ? jsPsychCategorizeImageButtons : jsPsychCategorizeImage,
    stimulus: images["foil_1035.jpg"],
    key_answer: function () {
      return lang.instructions.key.trial_choices.old;
    },
    button_answer: 0,
    choices: trial_choices,
    prompt: prompt_test,
    force_correct_button_press: true,
    incorrect_text: inc_rep,
    correct_text: cor_rep,
    data: { task: phasename },
  };

  lure2 = {
    type: resp_mode == "button" ? jsPsychCategorizeImageButtons : jsPsychCategorizeImage,
    stimulus: images["pcon028b.jpg"],
    key_answer: function () {
      return lang.instructions.key.trial_choices.sim;
    },
    button_answer: 1,
    choices: trial_choices,
    prompt: prompt_test,
    force_correct_button_press: true,
    incorrect_text: inc_lure,
    correct_text: cor_lure,
    data: { task: phasename },
  };

  side_by_side2 = {
    type: resp_mode == "button" ? jsPsychHtmlButtonResponse : jsPsychHtmlKeyboardResponse,
    stimulus: side_by_side2_stim,
    choices: instr_choice,
    prompt: side_by_side_prompt,
    data: { task: phasename },
  };

  outtro = {
    type: resp_mode == "button" ? jsPsychHtmlButtonResponse : jsPsychHtmlKeyboardResponse,
    choices: instr_choice,
    prompt: prompt0,
    stimulus: function () {
      return lang.instructions.end;
    },
    data: { task: phasename },
  };
  omstinst_TL = [
    intro,
    new1,
    new2,
    new3,
    repeat1,
    lure1,
    side_by_side1,
    new4,
    new5,
    repeat2,
    lure2,
    side_by_side2,
    outtro,
  ];

  console.log("refreshed instr trials");
}

//----------------------- 4 ----------------------
//-------------------- EXPORTS -------------------
// export the trials to be imported to the main timeline

export { refresh_instr_trials, omstinst_TL };
