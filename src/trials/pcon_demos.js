//*******************************************************************
//
//   File: pcon_demos.js               Folder: trials
//
//   Author: Craig Stark, Audrey Hempel
//   --------------------
//
//   Changes:
//        7/31/23 (AGH): initial convert from pcon.html into honeycomb
//                       template
//        8/1/23  (AGH): added wait method to allow formatting
//                       modified side by side display stimuli
//                       (instr2_stim and instr3_stim)
//        8/11/23 (AGH): changed trial_txt to trial_text for consistency
//
//   --------------------
//   This file includes the instruction and demo trials of the perceptual
//   control task as well as a pcon data analysis function.
//
//*******************************************************************

//----------------------- 1 ----------------------
//-------------------- IMPORTS -------------------
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychImageKeyboardResponse from "@jspsych/plugin-image-keyboard-response";
import jsPsychImageButtonResponse from "@jspsych/plugin-image-button-response";
import jsPsychAnimation from "@jspsych/plugin-animation";
import jsPsychPreload from "@jspsych/plugin-preload";

import { lang, resp_mode } from "../App/components/Login";
import { images, invNormcdf } from "../lib/utils";

//----------------------- 2 ----------------------
//----------------- HELPER METHODS ---------------
// These methods house the dynamic parameters of the trials below.

// var to store the task name (data property)
const phasename = "pcon";

var noise_sequence = [
  images["noise_1.png"],
  images["noise_2.png"],
  images["noise_3.png"],
  images["noise_4.png"],
  images["noise_5.png"],
];

var instr_choice = function () {
  if (resp_mode == "button") {
    return [lang.pcon.button.instr_choice];
  } else {
    return lang.pcon.key.instr_choice;
  }
};

var wait = function () {
  return "<p>" + lang.pcon.wait;
};

var instr1_prompt = function () {
  if (resp_mode == "button") {
    return lang.pcon.button.instr1_prompt;
  } else {
    return lang.pcon.key.instr1_prompt;
  }
};

var instr1_stim = function () {
  return "<p>" + lang.pcon.instr1_stim + "</p>";
};

var instr2_prompt = function () {
  if (resp_mode == "button") {
    return lang.pcon.button.instr2_prompt;
  } else {
    return lang.pcon.key.instr2_prompt;
  }
};

var instr2_stim = function () {
  return (
    "<p>" +
    lang.pcon.instr2_stim +
    '</p> <table style = "width:100%"> <tr> <td> <img src = "' +
    images["pprac1a.jpg"] +
    '" height=400 width=400> </td> <td> <img src = "' +
    images["pprac1a.jpg"] +
    '" height=400 width=400></td></tr></table>'
  );
};

var instr3_prompt = function () {
  if (resp_mode == "button") {
    return lang.pcon.button.instr3_prompt;
  } else {
    return lang.pcon.key.instr3_prompt;
  }
};

var instr3_stim = function () {
  return (
    "<p>" +
    lang.pcon.instr3_stim +
    '</p> <table style = "width:100%"> <tr> <td> <img src = "' +
    images["pprac2a.jpg"] +
    '" height=400 width=400> </td> <td> <img src = "' +
    images["pprac2b.jpg"] +
    '" height=400 width=400> </td> </tr> </table>'
  );
};

var trial_choices = function () {
  if (resp_mode == "button") {
    return [`${lang.pcon.button.trial_choices.same}`, `${lang.pcon.button.trial_choices.dif}`];
  } else {
    return [`${lang.pcon.key.trial_choices.same}`, `${lang.pcon.key.trial_choices.dif}`];
  }
};

var trial_prompt = function () {
  if (resp_mode == "button") {
    return "<p>" + lang.pcon.button.trial_txt + "</p>";
  } else {
    return "<p>" + lang.pcon.key.trial_txt + "</p>";
  }
};

//----------------------- 3 ----------------------
//-------------------- TRIALS --------------------

var pcon_preload = {
  type: jsPsychPreload,
  auto_preload: true,
};

//initiate trials to be loaded within the refresh function
var pcon_instr1_trial = {};
var pcon_demo1_trial = {};
var pcon_instr2_trial = {};
var pcon_demo2_trial = {};
var pcon_instr3_trial = {};
var pcon_end = {};
var pconinst_TL = [];

// refresh function called on Login once options for resp_mode and lang are set
function refresh_pcon_trials() {
  console.log("...refreshing pcon trials");

  pcon_instr1_trial = {
    type: resp_mode == "button" ? jsPsychHtmlButtonResponse : jsPsychHtmlKeyboardResponse,
    choices: instr_choice,
    prompt: instr1_prompt,
    margin_horizontal: "40px",
    margin_vertical: "0px",
    stimulus: instr1_stim,
    data: { task: phasename },
  };

  pcon_demo1_trial = {
    timeline: [
      {
        type: jsPsychHtmlKeyboardResponse,
        choices: "NO_KEYS",
        trial_duration: 1000,
        response_ends_trial: false,
        stimulus: lang.pcon.ready,
        data: { task: phasename },
      },
      {
        //type: (resp_mode == 'button' ? jsPsychImageButtonResponse : jsPsychImageKeyboardResponse),
        //choices: (resp_mode == 'button' ? ['Same','Different'] : "NO_KEYS"),
        //button_html: '<button class="jspsych-btn dimtext">%choice%</button>',
        type: jsPsychImageKeyboardResponse,
        choices: "NO_KEYS",
        trial_duration: 2000,
        response_ends_trial: false,
        stimulus: images["pprac1a.jpg"],
        data: { task: phasename },
      },
      {
        type: jsPsychAnimation,
        stimuli: noise_sequence,
        sequence_reps: 2,
        frame_time: 200,
        prompt: wait,
        data: { task: phasename },
      },
      {
        type: resp_mode == "button" ? jsPsychImageButtonResponse : jsPsychImageKeyboardResponse,
        choices: trial_choices,
        prompt: trial_prompt,
        //stimulus_duration: 2000,
        trial_duration: null,
        response_ends_trial: true,
        stimulus: images["pprac1b.jpg"],
        data: { task: phasename },
      },
    ],
  };

  pcon_instr2_trial = {
    type: resp_mode == "button" ? jsPsychHtmlButtonResponse : jsPsychHtmlKeyboardResponse,
    choices: instr_choice,
    prompt: instr2_prompt,
    margin_horizontal: "40px",
    margin_vertical: "0px",
    stimulus: instr2_stim,
    data: { task: phasename },
  };

  pcon_demo2_trial = {
    timeline: [
      {
        type: jsPsychHtmlKeyboardResponse,
        choices: "NO_KEYS",
        trial_duration: 500,
        response_ends_trial: false,
        stimulus: lang.pcon.ready,
        data: { task: phasename },
      },
      {
        //type: (resp_mode == 'button' ? jsPsychImageButtonResponse : jsPsychImageKeyboardResponse),
        //choices: (resp_mode == 'button' ? ['Same','Different'] : "NO_KEYS"),
        //button_html: '<button class="jspsych-btn dimtext">%choice%</button>',
        type: jsPsychImageKeyboardResponse,
        choices: "NO_KEYS",
        trial_duration: 2000,
        response_ends_trial: false,
        stimulus: images["pprac2a.jpg"],
        data: { task: phasename },
      },
      {
        type: jsPsychAnimation,
        stimuli: noise_sequence,
        sequence_reps: 2,
        frame_time: 200,
        prompt: wait,
        data: { task: phasename },
      },
      {
        type: resp_mode == "button" ? jsPsychImageButtonResponse : jsPsychImageKeyboardResponse,
        choices: trial_choices,
        prompt: trial_prompt,
        //stimulus_duration: 2000,
        trial_duration: null,
        response_ends_trial: true,
        stimulus: images["pprac2b.jpg"],
        data: { task: phasename },
      },
    ],
  };

  pcon_instr3_trial = {
    type: resp_mode == "button" ? jsPsychHtmlButtonResponse : jsPsychHtmlKeyboardResponse,
    choices: instr_choice,
    prompt: instr3_prompt,
    margin_horizontal: "40px",
    margin_vertical: "0px",
    stimulus: instr3_stim,
    data: { task: phasename },
  };

  pcon_end = {
    type: jsPsychHtmlKeyboardResponse,
    trial_duration: 500,
    stimulus: lang.pcon.ty,
    response_ends_trial: false,
    data: { task: phasename },
  };

  pconinst_TL = [
    pcon_instr1_trial, // instructions and demos
    pcon_demo1_trial,
    pcon_instr2_trial,
    pcon_demo2_trial,
    pcon_instr3_trial,
  ];

  console.log("refreshed pcondemo trials");
}

// pcon data summary function called on experiment end to include the summary in the data file
var pconDataCalcFunction = (data) => {
  let validtrials = data.filterCustom(function (trial) {
    return trial.resp !== null;
  });
  let targets = validtrials.filter({ cresp: "s" });
  let foils = validtrials.filter({ cresp: "d" });

  console.log("valid pcon trials: " + validtrials.count());
  console.log("targets: " + targets.count());
  console.log("foils: " + foils.count());

  let corr_targs = targets.filter({ correct: true });
  let corr_foils = foils.filter({ correct: true });

  let hits = Math.round(corr_targs.count() / targets.count());
  let crs = Math.round(corr_foils.count() / foils.count());
  let p_fa = 0.0;
  let p_hit = 0.0;
  if (corr_targs.count() == 0) {
    p_hit = 0.5 / targets.count();
  } else if (corr_targs.count() == targets.count()) {
    p_hit = (targets.count() - 0.5) / targets.count();
  } else {
    p_hit = corr_targs.count() / targets.count();
  }

  if (corr_foils.count() == foils.count()) {
    p_fa = 0.5 / foils.count();
  } else if (corr_foils.count() == 0) {
    p_fa = (foils.count() - 0.5) / foils.count();
  } else {
    p_fa = 1 - corr_foils.count() / foils.count();
  }

  console.log(corr_targs.count() + " " + targets.count() + " " + p_hit);
  console.log(corr_foils.count() + " " + foils.count() + " " + p_fa);
  console.log(invNormcdf(p_hit));
  console.log(invNormcdf(p_fa));

  let dpTF = invNormcdf(p_hit) - invNormcdf(p_fa);

  var retstr =
    "HR, " + hits.toFixed(3) + ", CR rate, " + crs.toFixed(3) + ", d'T:F, " + dpTF.toFixed(3);
  data.summary = retstr;
  console.log("retstr:" + retstr);
  return retstr;
};

//----------------------- 4 ----------------------
//--------------------- EXPORTS -------------------

export { pcon_preload, refresh_pcon_trials, pcon_end, pconDataCalcFunction, pconinst_TL };
