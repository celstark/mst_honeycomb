/* eslint-disable */
//*******************************************************************
//
//   File: pcon.js               Folder: config
//
//   Author: Honeycomb, Craig Stark, Audrey Hempel
//   --------------------
//
//   Changes:
//        7/31/23 (AGH): adapted from experiment.js
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
// image objects that allow image path of each set (based on stim_set)
import { images } from "../lib/utils";

//----------------------- 2 ----------------------
//---------- TIMELINE VARIABLE FUNCTION-----------

// pcon images sequence
var pcon_vars = [
  { img1: "img/pcon001a.jpg", img2: "img/pcon001b.jpg", cresp: "d" },
  { img1: "img/pcon002a.jpg", img2: "img/pcon002a.jpg", cresp: "s" },
  { img1: "img/pcon003a.jpg", img2: "img/pcon003a.jpg", cresp: "s" },
  { img1: "img/pcon004a.jpg", img2: "img/pcon004b.jpg", cresp: "d" },
  { img1: "img/pcon005a.jpg", img2: "img/pcon005a.jpg", cresp: "s" },
  { img1: "img/pcon006a.jpg", img2: "img/pcon006a.jpg", cresp: "s" },
  { img1: "img/pcon007a.jpg", img2: "img/pcon007a.jpg", cresp: "s" },
  { img1: "img/pcon008a.jpg", img2: "img/pcon008b.jpg", cresp: "d" },
  { img1: "img/pcon009a.jpg", img2: "img/pcon009b.jpg", cresp: "d" },
  { img1: "img/pcon010a.jpg", img2: "img/pcon010b.jpg", cresp: "d" },
  { img1: "img/pcon011a.jpg", img2: "img/pcon011a.jpg", cresp: "s" },
  { img1: "img/pcon012a.jpg", img2: "img/pcon012b.jpg", cresp: "d" },
  { img1: "img/pcon013a.jpg", img2: "img/pcon013a.jpg", cresp: "s" },
  { img1: "img/pcon014a.jpg", img2: "img/pcon014b.jpg", cresp: "d" },
  { img1: "img/pcon015a.jpg", img2: "img/pcon015a.jpg", cresp: "s" },
  { img1: "img/pcon016a.jpg", img2: "img/pcon016b.jpg", cresp: "d" },
  { img1: "img/pcon017a.jpg", img2: "img/pcon017a.jpg", cresp: "s" },
  { img1: "img/pcon018a.jpg", img2: "img/pcon018a.jpg", cresp: "s" },
  { img1: "img/pcon019a.jpg", img2: "img/pcon019a.jpg", cresp: "s" },
  { img1: "img/pcon020a.jpg", img2: "img/pcon020b.jpg", cresp: "d" },
  { img1: "img/pcon021a.jpg", img2: "img/pcon021b.jpg", cresp: "d" },
  { img1: "img/pcon022a.jpg", img2: "img/pcon022a.jpg", cresp: "s" },
  { img1: "img/pcon023a.jpg", img2: "img/pcon023b.jpg", cresp: "d" },
  { img1: "img/pcon024a.jpg", img2: "img/pcon024b.jpg", cresp: "d" },
  { img1: "img/pcon025a.jpg", img2: "img/pcon025b.jpg", cresp: "d" },
  //{ img1: 'img/pcon026a.jpg', img2: 'img/pcon026b.jpg', cresp: 'd'},
  { img1: "img/pcon027a.jpg", img2: "img/pcon027a.jpg", cresp: "s" },
  // { img1: 'img/pcon028a.jpg', img2: 'img/pcon028a.jpg', cresp: 's'},
];

//  sets up the tlv array to include the appropriate info from the image sequence
var tlv = [];
var ntrials = pcon_vars.length;
let DEBUGMODE = 0;
if (DEBUGMODE == 1) {
  ntrials = 20;
}
console.log("Building up the " + ntrials + "pcon trials");

for (var i = 0; i < ntrials; i++) {
  let var_info = pcon_vars[i];

  var pconImage1;
  var pconImage2;

  // pare image path
  pcon_vars[i].img1 = pcon_vars[i].img1.replace("img/", "");
  pconImage1 = images[var_info.img1];

  pcon_vars[i].img2 = pcon_vars[i].img2.replace("img/", "");
  pconImage2 = images[var_info.img2];

  // create the timeline variable object
  let obj = {
    img1: pconImage1,
    img2: pconImage2,
    cresp: var_info.cresp,
  };

  tlv.push(obj);
}

//----------------------- 3 ----------------------
//-------------- EXPERIMENT BLOCK ----------------

// create copy of default settings
var pconBlock1 = deepCopy(defaultBlockSettings);

pconBlock1.conditions = tlv; //set the conditions of the trials to the array

//----------------------- 4 ----------------------
//--------------------- EXPORT -------------------

export { pconBlock1 };
