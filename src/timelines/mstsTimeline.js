//*******************************************************************
//
//   File: mstsTimeline.js               Folder: timelines
//
//   Author: Craig Stark
//   --------------------
//   Sets up the timeline for both individual msts trials and the block
//   This format merges the omstBlock and omstTrial code and adapts for the
//   msts phase.

//----------------------- 1 ----------------------
//-------------------- IMPORTS -------------------

import jsPsychImageKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import jsPsychImageButtonResponse from "@jspsych/plugin-html-button-response";
import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";

import { config } from "../config/main";
import { generateStartingOpts } from "../lib/taskUtils";
import { stim_set, selfpaced, orderfile_msts, resp_mode } from "../App/components/Login";
import { msts_keyTrial, msts_buttonTrial } from "../trials/trialMsts";

// TODO: Loads in common with omst version and mstt version -- unify?
const mstsTrial = (blockSettings, blockDetails, tlv) => {
  var timeline = [];
  // if keyboard response, load stimulus and data specifications for keyboard trials into timeline
  if (resp_mode == "keyboard") {
    timeline = [
      msts_keyTrial(config, {
        image: function () {
          return tlv.stimulus;
        },
        data: function () {
          // tlv data conditions
          let condition = tlv.data.condition;
          //let correct_response = tlv.data.correct_response;
          //let lbin = tlv.data.lbin;
          // return with other data properties
          return {
            condition,
            //correct_response,
            //lbin,
            task: "MSTS",
            set: stim_set,
            selfpaced: selfpaced,
            orderfile: orderfile_msts,
          };
        },
      }),
    ];
  }
  // if button response response, load stimulus and data specifications for keyboard trials into timeline
  else {
    timeline = [
      msts_buttonTrial(config, {
        image: function () {
          return tlv.stimulus;
        },
        data: function () {
          // tlv data conditions
          let condition = tlv.data.condition;
          //let correct_response = tlv.data.correct_response;
          //let lbin = tlv.data.lbin;
          // return with other data properties
          return {
            condition,
            //correct_response,
            //lbin,
            task: "MSTS",
            set: stim_set,
            selfpaced: selfpaced,
            orderfile: orderfile_msts,
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

const setupMstsBlock = (blockSettings) => {
  // TODO: Can I eliminate this in the end?
  // initialize block with starting options that set up looped trials
  // This next line was doing the shuffling - make sure your blockSettings.randomizer_order is false
  const startingOpts = generateStartingOpts(blockSettings);
  const blockDetails = {
    foo: false, // TODO: Not really sure what I want in here
  };

  // timeline = loop through trials
  const timeline = startingOpts.map((tlv) => mstsTrial(blockSettings, blockDetails, tlv));

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
    timeline,
  };
};

//----------------------- 3 ----------------------
//--------------------- EXPORT -------------------

export default setupMstsBlock;
