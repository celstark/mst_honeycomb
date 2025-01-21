//*******************************************************************
//
//   File: testBlock.js               Folder: timelines
//
//   Author: Honeycomb, Audrey Hempel
//   --------------------
//
//   Changes:
//        6/28/23 (AGH): copied from honeycomb taskBlock
//                       imported copied testTrial
//        7/13/23 (AGH): changed arg condition --> tlv
//        1/20/25 (CELS): Merged the old block and trial.js into singular timeline file
//
//   --------------------
//   Sets up the timeline for both individual mstt trials and the block
//   This format merges the omstBlock and omstTrial code and adapts for the
//   mstt phase.

//*******************************************************************

//----------------------- 1 ----------------------
//-------------------- IMPORTS -------------------

import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import jsPsychImageKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import jsPsychImageButtonResponse from "@jspsych/plugin-html-button-response";

import { config } from "../config/main";
import { generateStartingOpts } from "../lib/taskUtils";
import { stim_set, selfpaced, orderfile_mstt, resp_mode } from "../App/components/Login";

// default settings for a  trial
import { keyMsttTrial, buttonMsttTrial } from "../trials/trialMstt";

const msttTrial = (tlv) => {
  var timeline = [];
  // if keyboard response, load stimulus and data specifications for keyboard trials into timeline
  if (resp_mode == "keyboard") {
    timeline = [
      keyMsttTrial(config, {
        image: function () {
          return tlv.stimulus;
        },
        data: function () {
          // tlv data conditions
          let condition = tlv.data.condition;
          let correct_response = tlv.data.correct_response;
          let lbin = tlv.data.lbin;
          // return with other data properties
          return {
            condition,
            correct_response,
            lbin,
            task: "MSTT",
            set: stim_set,
            selfpaced: selfpaced,
            orderfile: orderfile_mstt,
          };
        },
      }),
    ];
  }
  // if button response response, load stimulus and data specifications for keyboard trials into timeline
  else {
    timeline = [
      buttonMsttTrial(config, {
        image: function () {
          return tlv.stimulus;
        },
        data: function () {
          // tlv data conditions
          let condition = tlv.data.condition;
          let correct_response = tlv.data.correct_response;
          let lbin = tlv.data.lbin;
          // return with other data properties
          return {
            condition,
            correct_response,
            lbin,
            task: "MSTT",
            set: stim_set,
            selfpaced: selfpaced,
            orderfile: orderfile_mstt,
          };
        },
      }),
    ];
  }

  // if keyboard response, return keyboard type and timeline
  if (resp_mode == "keyboard") {
    return {
      type: jsPsychImageKeyboardResponse,
      timeline,
    };
  }
  // if button response, return button type and timeline
  else if (resp_mode == "button") {
    return {
      type: jsPsychImageButtonResponse,
      timeline,
    };
  }
};

//----------------------- 2 ----------------------
//-------------------- TIMELINE ------------------

// testBlock

const setupMsttBlock = (blockSettings, jsPsych) => {
  // initialize block with starting options that set up looped trials
  const startingOpts = generateStartingOpts(blockSettings);

  // const blockDetails = {
  //   block_earnings: 0.0,
  //   optimal_earnings: 0.0,
  //   continue_block: true,
  // };

  // timeline = loop through trials
  console.dir(jsPsych); // remove
  const timeline = startingOpts.map((tlv) => msttTrial(tlv));

  const blockStart = {
    type: htmlKeyboardResponse,
    stimulus: "",
    trial_duration: 1,
    on_finish: (data) => {
      data.block_settings = blockSettings;
    },
  };

  timeline.unshift(blockStart);

  return {
    type: htmlKeyboardResponse,
    on_finish: function (data) {
      console.log("testBlock finished");
      console.log(data);
    },
    timeline,
  };
};

//----------------------- 3 ----------------------
//--------------------- EXPORT -------------------

export default setupMsttBlock;
