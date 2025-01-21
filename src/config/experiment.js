/* eslint-disable */
//*******************************************************************
//
//   File: experiment.js               Folder: config
//
//   Author: Honeycomb, Craig Stark, Audrey Hempel
//   --------------------
//
//   Changes:
//        6/28/23 (AGH): moved the timeline variables for contOMST
//                       test_trials from ./trials
//                       set up tlv as msttBlock conditions
//        7/18/23 (AGH): encapsulated everthing into the function
//                       loadmsttBlock (allows trial_stim and stim_set
//                       options chosen on Login)
//                       added var exptImage to include the set#Image
//                       objects (previously in /trials/testTrial) and
//                       edit image name for each set (now tlv.stimulus)
//        1/20/25 (CELS): Wrote helper function for getImageName and streamlined
//                        Added functions loadMSTSBlock and loadMSTTBlock (all from add-classic branch)
//
//   --------------------
//   This file contains a function that defines the experiment's changing
//   conditions in repeated trials (stimulus and data).
//
//*******************************************************************

//----------------------- 1 ----------------------
//-------------------- IMPORTS -------------------

import { defaultBlockSettings } from "./main";
import { deepCopy } from "../lib/utils";
import { twochoice } from "../App/components/Login";
// image objects that allow image path of each set (based on stim_set)
import {
  set1Images,
  set2Images,
  set3Images,
  set4Images,
  set5Images,
  set6Images,
} from "../lib/utils";

function getImageName(imagename, stim_set) {
  // CELS: helper function we'll use a few times to return the base image name
  // These come in as things like Set 1_rs/153a.jpg and need to become /static/media/153a.95b34cd0b497afc6341d.jpg
  // The SetX_rs bits are already gone here in Electron, replaced by that random string, but our goal is to
  //console.log('getImageName: ',imagename);
  if (stim_set == "1") {
    return set1Images[imagename.replace("Set 1_rs/", "")];
  } else if (stim_set == "2") {
    return set2Images[imagename.replace("Set 2_rs/", "")];
  } else if (stim_set == "3") {
    return set3Images[imagename.replace("Set 3_rs/", "")];
  } else if (stim_set == "4") {
    return set4Images[imagename.replace("Set 4_rs/", "")];
  } else if (stim_set == "5") {
    return set5Images[imagename.replace("Set 5_rs/", "")];
  } else if (stim_set == "6") {
    return set6Images[imagename.replace("Set 6_rs/", "")];
  }
  return "Unknown";
}

//----------------------- 2 ----------------------
//---------- TIMELINE VARIABLE FUNCTION-----------

//  sets up the tlv array to include the appropriate info from the seleced jsOrders file

/* 
 // Not used here, but brought it in for posterity
function loadOMSTBlock (trial_stim, stim_set) { 
  var tlv = [];
  var ntrials = trial_stim.length;
  const DEBUGMODE = 0;
  if (DEBUGMODE == 1) {
    ntrials = 20;
  }
  console.log('oMST - Building up the ' + ntrials + ' trials');
  for (var i = 0; i < ntrials; i++) {
    // in corr_resp: 0=old, 1=sim, 2=new
    const this_trial = trial_stim[i]; 
    let tr_type = 'foil';
    let cresp = 'n';
    if (this_trial.correct_resp == 0) {
      tr_type = 'target';
      cresp = 'o';
    } else if (this_trial.correct_resp == 1) {
      tr_type = 'lure';
      if (twochoice == 1) {
        cresp = 'n';
      } else {
        cresp = 's';
      }
    }
    let lure_bin = 0; // We may or may not have this in the order file
    if (this_trial.lbin && this_trial.lbin !== 'undefined') {
      lure_bin = this_trial.lbin;
    }

    // Assign exptImage to the right path for the selected stim set
    const exptImage=getImageName(this_trial.image,stim_set);
    
    // create the timeline variable object
    let obj = {
      stimulus: exptImage,
      data: { condition: tr_type, correct_response: cresp, lbin: lure_bin },
    };
    //console.log('DBG:',exptImage, this_trial.image)
    //console.log(i + '  bin: ' + lure_bin)
    tlv.push(obj); // add it to the array of timeline variables
  }

  // create copy of default settings
  var omstBlock = deepCopy(defaultBlockSettings);
  omstBlock.conditions = tlv; //set the conditions of the trials to the array
  return omstBlock;
} */

function loadMSTSBlock(trial_stim, stim_set) {
  // Study phase of the classic version
  // We just have stim and cond in the order file
  // Copied / modified version of loadOMSTBlock
  var tlv = [];
  var ntrials = trial_stim.length;
  const DEBUGMODE = 0;
  if (DEBUGMODE == 1) {
    ntrials = 20;
  }
  console.log("MSTS - building up the " + ntrials + " trials for set " + stim_set);
  //console.log(trial_stim);
  for (var i = 0; i < ntrials; i++) {
    // in corr_resp: 0=old, 1=sim, 2=new
    const this_trial = trial_stim[i];
    const tr_type = this_trial.cond;
    // Assign exptImage to the right path for the selected stim set
    const exptImage = getImageName(this_trial.stim, stim_set);
    // create the timeline variable object
    let obj = {
      stimulus: exptImage,
      data: { condition: tr_type },
    };
    tlv.push(obj); // add it to the array of timeline variables
  }

  var mstsBlock = deepCopy(defaultBlockSettings);
  mstsBlock.conditions = tlv; //set the conditions of the trials to the array
  return mstsBlock;
}

function loadMSTTBlock(trial_stim, stim_set) {
  var tlv = [];
  var ntrials = trial_stim.length;
  const DEBUGMODE = 0;
  if (DEBUGMODE == 1) {
    ntrials = 20;
  }
  console.log("MSTT - Building up the " + ntrials + " trials");
  for (var i = 0; i < ntrials; i++) {
    // in corr_resp: 0=old, 1=sim, 2=new
    const this_trial = trial_stim[i];
    let tr_type = "foil"; // Yes, the order files have these, but I'm trying to keep things parallel with oMST (CELS)
    let cresp = "n";
    if (this_trial.cond == "TR") {
      tr_type = "target";
      cresp = "o";
    } else if (this_trial.cond == "TL") {
      tr_type = "lure";
      if (twochoice == 1) {
        cresp = "n";
      } else {
        cresp = "s";
      }
    }
    let lure_bin = 0; // We may or may not have this in the order file
    if (this_trial.lbin && this_trial.lbin !== "undefined") {
      lure_bin = this_trial.lbin;
    }

    // Assign exptImage to the right path for the selected stim set
    const exptImage = getImageName(this_trial.stim, stim_set);

    // create the timeline variable object
    let obj = {
      stimulus: exptImage,
      data: { condition: tr_type, correct_response: cresp, lbin: lure_bin },
    };
    //console.log('DBG:',exptImage, this_trial.image)
    //console.log(i + '  bin: ' + lure_bin)
    tlv.push(obj); // add it to the array of timeline variables
  }

  // create copy of default settings
  var msttBlock = deepCopy(defaultBlockSettings);
  msttBlock.conditions = tlv; //set the conditions of the trials to the array
  return msttBlock;
}

//----------------------- 4 ----------------------
//--------------------- EXPORT -------------------

export { loadMSTSBlock, loadMSTTBlock };
