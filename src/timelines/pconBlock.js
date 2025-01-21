//*******************************************************************
//
//   File: pconBlock.js               Folder: timelines
//
//   Author: Honeycomb, Audrey Hempel
//   --------------------
//
//   Changes:
//        7/31/23 (AGH): inital convert from pcon.html into honeycomb
//                       template
//
//   --------------------
//   This file loops through pconTrial (/timelines/pconTrial.js) using
//   the conditions (pconBlock1 from /config/pcon_config.js) passed into
//   it in /timelines/main.js.
//
//*******************************************************************

//----------------------- 1 ----------------------
//-------------------- IMPORTS -------------------

import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import pconTrial from "./pconTrial";
import { generateStartingOpts } from "../lib/taskUtils";

//----------------------- 2 ----------------------
//-------------------- TIMELINE ------------------

// pconBlock

const pconBlock = (blockSettings) => {
  // initialize block with starting options that set up looped trials
  const startingOpts = generateStartingOpts(blockSettings);

  const blockDetails = {
    block_earnings: 0.0,
    optimal_earnings: 0.0,
    continue_block: true,
  };

  // timeline = loop through trials
  const timeline = startingOpts.map((tlv) => pconTrial(blockSettings, blockDetails, tlv));

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

export default pconBlock;
