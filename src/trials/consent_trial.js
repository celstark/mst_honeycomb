//*******************************************************************
//
//   File: consent_trial.js               Folder: trials
//
//   Author: Craig Stark, Audrey Hempel
//   --------------------
//
//   Changes:
//        6/30/23 (AGH): converted consent_trial from consent_form.html
//                       added selector ids and custom formatting
//                       in App.css
//        7/7/23 (AGH):  created not_consented for conditional timeline
//        7/13/23 (AGH): added task data property to trials
//        7/14/23 (AGH): added margin-vertical parameter to space buttons
//
//   --------------------
//   This file creates a consent trial that displays a formatted
//   consent form and stores the participant's response in the var
//   consentGiven (for a conditional timeline in the main
//   timeline). It also creates a not_consented trial that runs if
//   the participant does not consent.
//
//*******************************************************************

//----------------------- 1 ----------------------
//-------------------- IMPORTS -------------------

import { lang } from "../App/components/Login";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";

//----------------------- 2 ----------------------
//----------------- HELPER METHODS ---------------
// functions for formatting stimulus and button choices

var irb_stim = function () {
  return (
    '<div id="consenttext"> <h1 style="text-align: center">' +
    lang.consent.title +
    "</h1><br><br>" +
    lang.consent.study.uni +
    lang.consent.study.sis +
    lang.consent.study.num +
    "<br>" +
    lang.consent.researcher.title +
    lang.consent.researcher.name +
    lang.consent.researcher.dept +
    lang.consent.researcher.tele +
    '<a href="mailto:cestark@uci.edu">' +
    lang.consent.researcher.email +
    "</a><br><ul>" +
    lang.consent.text +
    "<br><br>" +
    lang.consent.prompt +
    "</div>"
  );
};

var buttons = function () {
  return [
    '<div id="agreeButton">' + lang.consent.buttons.agree + "</div>",
    '<div id="cancelButton">' + lang.consent.buttons.cancel + "</div>",
  ];
};

//----------------------- 3 ----------------------
//--------------------- TRIALS -------------------

// consent trial settup
var consentGiven = null;

var consent_trial = {
  type: jsPsychHtmlButtonResponse,
  stimulus: irb_stim,
  choices: buttons,
  margin_vertical: "20px",
  data: { task: "consent" }, // add task name to data collection
  on_finish: function (data) {
    if (data.response == 0) {
      consentGiven = true; //var used to run conditional timeline
    } else {
      consentGiven = false;
    }
  },
};

// trial called in conditional timeline if participant does not consent
var not_consented = {
  type: jsPsychHtmlKeyboardResponse,
  trial_duration: 1000,
  data: { task: "endNotConsented" }, // add task name to data collection
  stimulus: function () {
    return lang.end.nc;
  },
};

//----------------------- 4 ----------------------
//-------------------- EXPORTS -------------------

export { consent_trial, consentGiven, not_consented };
