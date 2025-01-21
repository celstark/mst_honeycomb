//*******************************************************************
//
//   File: mstt.js               Folder: trials
//
//   Author: Craig Stark, Audrey Hempel
//   --------------------
//
//   Changes:
//        6/26/23 (AGH): began converting cont_omst.html into honeycomb template
//                       (adding imports, exports, removing JATOS code)
//        6/27/23 (AGH): moved config variables (stim_set, orderfile...)
//                       to /config/contOmstset.js
//                       made dynamic for lang and resp_mode
//        6/28/23 (AGH):  moved repeat test_trials to /trials/trialCont.js +
//                       /timelines/testTrial.js + /timelines/testBlock.js
//        6/28/23 (AGH):  moved timeline variables set up of test_trials
//                       as the condition of msttBlock in /config/experiment.js
//                       (gets called in main timeline as testBlock(msttBlock))
//        7/6/23 (AGH):  deleted preload
//        7/13/23 (AGH): added task data property to trials
//        7/14/23 (AGH): split instructions into keyboard and button version
//        7/21/23 (AGH): made debrief data calculations a seperate function o
//                       exported to /components/JsPsychExperiment
//        7/26/23 (AGH): consolodated key and button constructions with
//                       refresh_mstt_trials called at Login
//        7/27/23 (AGH): added paragraph markers to param functions (previously
//                       within text file)
//        8/1/23 (AGH):  moved invNormcdf function to utils, now imported
//        10/28/23 (CELS): Added preloading
//        1/20/25 (CELS): Shifted to being mstt.js from contOmst.js
//
//   --------------------
//   This file includes the misc helper trials, instructions and debrief trials
//   as well as the data anlaysis function for the MST test phase (it no longer
//   contains the looped trials or preload).
//
//*******************************************************************

//----------------------- 1 ----------------------
//-------------------- IMPORTS -------------------

import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychPreload from "@jspsych/plugin-preload";
import jsPsychCanvasButtonResponse from "@jspsych/plugin-canvas-button-response";
import jsPsychCanvasKeyboardResponse from "@jspsych/plugin-canvas-keyboard-response";

import { twochoice, lang, resp_mode } from "../App/components/Login";

import { invNormcdf } from "../lib/utils";

//----------------------- 2 ----------------------
//---------------- HELPER METHODS ----------------
// helper methods that setup prompts and response options based on keyboard/button and 2/3 choices

var mstt_preload = {
  type: jsPsychPreload,
  auto_preload: true,
};

var mstt_refresh_choice = function () {
  if (resp_mode == "button") {
    return [lang.cont.button.instr_choice];
  } else {
    return lang.cont.key.instr_choice;
  }
};

var mstt_refresh_prompt = function () {
  if (resp_mode == "button") {
    return "<p>" + lang.cont.button.instr_prompt + "</p>";
  } else {
    return "<p>" + lang.cont.key.instr_prompt + "</p>";
  }
};

var mstt_refresh_stim = function () {
  if (resp_mode == "button") {
    if (twochoice == 0) {
      return "<p>" + lang.st.button.threechoice + "</p>";
    } else {
      return "<p>" + lang.st.button.twochoice + "</p>";
    }
  } else {
    if (twochoice == 0) {
      return "<p>" + lang.st.key.threechoice + "</p>";
    } else {
      return "<p>" + lang.st.key.twochoice + "</p>";
    }
  }
};

//----------------------- 3 ----------------------
//--------------------- TRIALS -------------------

//-------------instructions-------------

var mstt_instr_trial = {};

function refresh_mstt_trials() {
  mstt_instr_trial = {
    type: resp_mode == "button" ? jsPsychHtmlButtonResponse : jsPsychHtmlKeyboardResponse,
    choices: mstt_refresh_choice,
    prompt: mstt_refresh_prompt,
    margin_horizontal: "40px",
    margin_vertical: "20px",
    //        button_html: '<button style="font-size: 150%" class="jspsych-btn">%choice%</button>',
    stimulus: mstt_refresh_stim,
    // add task name to data collection
    data: { task: "MSTT" },
  };
}

//---------------thank you--------------
// (button type not necessary)
var mstt_debrief_block = {
  type: jsPsychHtmlKeyboardResponse,
  trial_duration: 500,
  stimulus: function () {
    return lang.cont.ty;
  },
  // add task name to data collection
  data: { task: "MSTT" },
};

// -------- graphical feedback ---------
const mstt_feedback = (jsPsych) => ({
  type: resp_mode == "button" ? jsPsychCanvasButtonResponse : jsPsychCanvasKeyboardResponse, // TODO: Adapt this later for keyboard
  choices: mstt_refresh_choice,
  canvas_size: [200, 600],
  on_start: function (trial) {
    trial.subjAge = 70; // TODO:  Will eventually get these numbers from the demog-form
    // Try to compute the LDI.  The data should be here by now
    let data = jsPsych.data.get();
    if (data === undefined) {
      trial.ldi = 0.0;
      trial.zscore = 0.0;
      console.log("NO DATA FOUND");
      return;
    }
    let validTrials = data.filterCustom(function (trial) {
      return trial.resp !== null;
    });
    //console.dir(validTrials);
    let lures = validTrials.filter({ condition: "lure" });
    let foils = validTrials.filter({ condition: "foil" });
    let lure_sim = lures.filter({ resp: "s" });
    let foil_sim = foils.filter({ resp: "s" });
    trial.ldi = lure_sim.count() / lures.count() - foil_sim.count() / foils.count();
    trial.zscore = (trial.ldi - (0.9688 - 0.006756 * trial.subjAge)) / 0.1753;
    console.log("LDI ", trial.ldi);
    //console.log(data)
  },
  prompt: lang.cont.ty,
  stimulus: function (c) {
    var ctx = c.getContext("2d");
    ctx.globalCompositeOperation = "source-over";
    //var randomNumber=-1.5;
    // Create gradient
    var grd = ctx.createLinearGradient(0, 0, 150, 0);
    grd.addColorStop(0, "red");
    grd.addColorStop(0.6, "yellow");
    grd.addColorStop(1, "green");

    // Fill with gradient
    ctx.fillStyle = grd;
    ctx.fillRect(0, 30, 600, 160);

    let ldi = this.ldi.toFixed(2);
    let zscore = Math.min(Math.max(this.zscore, -2.95), 2.95);
    var xPos = ((zscore + 3) / 6) * 600; // Scale the random number to canvas width
    //console.log(ldi,zscore);
    //console.log(xPos);
    ctx.beginPath();
    ctx.moveTo(xPos, 30); // main line
    ctx.lineTo(xPos, 190);
    ctx.moveTo(xPos - 10, 20); // top arrow
    ctx.lineTo(xPos, 30);
    ctx.lineTo(xPos + 10, 20);
    ctx.moveTo(xPos - 10, 200); // bottom arrow
    ctx.lineTo(xPos, 190);
    ctx.lineTo(xPos + 10, 200);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgb(0 0 255 / 50%)";
    ctx.stroke();

    ctx.font = "18px sans-serif";
    ctx.fillStyle = "black";
    //ctx.textAlign('center');  // shoot - don't seem to have these
    //ctx.textBaseline('top');
    //console.log('width',ctx.measureText(ldi.toString()))
    //let txtx = xPos - ctx.measureText(ldi.toString()).width / 2;
    //console.log(txtx)
    ctx.fillText(ldi.toString(), xPos - ctx.measureText(ldi.toString()).width / 2, 18);
  },
});

var retstr;

var dataCalcFunction = (data) => {
  let validtrials = data.filterCustom(function (trial) {
    return trial.resp !== null;
  });
  let targets = validtrials.filter({ condition: "target" });
  let lures = validtrials.filter({ condition: "lure" });
  let foils = validtrials.filter({ condition: "foil" });

  console.log("validtrials: " + validtrials.count());
  console.log("targets: " + targets.count());
  console.log("lures: " + lures.count());
  console.log("foils: " + foils.count());

  if (twochoice == 1) {
    let corr_targs = targets.filter({ correct: true });
    let corr_lures = lures.filter({ correct: true });
    let corr_foils = foils.filter({ correct: true });
    let hits = Math.round((corr_targs.count() / targets.count()) * 100);
    let cr_lure = Math.round((corr_lures.count() / lures.count()) * 100);
    let cr_foil = Math.round((corr_foils.count() / foils.count()) * 100);
    let p_fa_foil = 0.0;
    let p_fa_lure = 0.0;
    let p_hit = 0.0;
    if (corr_targs.count() == 0) {
      p_hit = 0.5 / targets.count();
    } else if (corr_targs.count() == targets.count()) {
      p_hit = (targets.count() - 0.5) / targets.count();
    } else {
      p_hit = corr_targs.count() / targets.count();
    }

    if (corr_lures.count() == lures.count()) {
      p_fa_lure = 0.5 / lures.count();
    } else if (corr_lures.count() == 0) {
      p_fa_lure = (lures.count() - 0.5) / lures.count();
    } else {
      p_fa_lure = 1 - corr_lures.count() / lures.count();
    }

    if (corr_foils.count() == foils.count()) {
      p_fa_foil = 0.5 / foils.count();
    } else if (corr_foils.count() == 0) {
      p_fa_foil = (foils.count() - 0.5) / foils.count();
    } else {
      p_fa_foil = 1 - corr_foils.count() / foils.count();
    }

    console.log(corr_targs.count() + " " + targets.count() + " " + p_hit);
    console.log(corr_lures.count() + " " + lures.count() + " " + p_fa_lure);
    console.log(corr_foils.count() + " " + foils.count() + " " + p_fa_foil);
    console.log(invNormcdf(p_hit));
    console.log(invNormcdf(p_fa_lure));
    console.log(invNormcdf(p_fa_foil));

    let dpTF = invNormcdf(p_hit) - invNormcdf(p_fa_foil);
    let dpTL = invNormcdf(p_hit) - invNormcdf(p_fa_lure);

    retstr =
      "HR, " +
      hits +
      ", CR-L, " +
      cr_lure +
      ", CR-F rate, " +
      cr_foil +
      ", d'T:F, " +
      dpTF.toFixed(3) +
      ", d'T:L, " +
      dpTL.toFixed(3);

    console.log("retstr:" + retstr);

    return retstr;
  } else {
    // OSN
    let targ_old = targets.filter({ resp: "o" });
    let targ_sim = targets.filter({ resp: "s" });
    let targ_new = targets.filter({ resp: "n" });
    let lure_old = lures.filter({ resp: "o" });
    let lure_sim = lures.filter({ resp: "s" });
    let lure_new = lures.filter({ resp: "n" });
    let foil_old = foils.filter({ resp: "o" });
    let foil_sim = foils.filter({ resp: "s" });
    let foil_new = foils.filter({ resp: "n" });

    let rec = targ_old.count() / targets.count() - foil_old.count() / foils.count();
    let ldi = lure_sim.count() / lures.count() - foil_sim.count() / foils.count();
    // removed var
    retstr = "Valid, " + targets.count() + ", " + lures.count() + ", " + foils.count() + "\n";
    retstr += "Old, " + targ_old.count() + ", " + lure_old.count() + ", " + foil_old.count() + "\n";
    retstr +=
      "Similar, " + targ_sim.count() + ", " + lure_sim.count() + ", " + foil_sim.count() + "\n";
    retstr += "New, " + targ_new.count() + ", " + lure_new.count() + ", " + foil_new.count() + "\n";
    retstr += "REC, " + rec.toFixed(3) + ", LDI, " + ldi.toFixed(3);

    console.log("ldi: " + ldi);
    console.log("retstr: " + retstr);

    return retstr;
  }
};
//----------------------- 4 ----------------------
//--------------------- EXPORTS -------------------

export {
  refresh_mstt_trials,
  mstt_preload,
  mstt_instr_trial,
  mstt_feedback,
  mstt_debrief_block,
  dataCalcFunction,
  retstr,
};
