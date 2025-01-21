//*******************************************************************
//
//   File: demographics.js               Folder: trials
//
//   Author: Craig Stark, Audrey Hempel
//   --------------------
//
//   Changes:
//        6/22/23 (AGH): adapted demogrpahics.html into honeycomb template
//                       (adding imports, exports, removing JATOS code)
//        6/23/23 (AGH): made dynamic for { lang }
//        6/30/23 (AGH): added selector ids and custom formatting
//                       in App.css
//        7/13/23 (AGH): added task data property to include task name
//
//   --------------------
//   This trial displays the demographics survey
//
//*******************************************************************

//----------------------- 1 ----------------------
//-------------------- IMPORTS -------------------

import { lang } from "../App/components/Login";
import jsPsychSurveyHtmlForm from "@jspsych/plugin-survey-html-form";

//----------------------- 2 ----------------------
//--------------------- TRIAL --------------------

// demographics survey trial
//lang.demog.name +
//      '</b> <input name="fullname" type="text" required /></p> \
//      <p> <b>' +
var demogform = {
  type: jsPsychSurveyHtmlForm,
  preamble: function () {
    return '<div id ="demogpramble">' + lang.demog.preamble + "</div>";
  },
  html: function () {
    return (
      '<div id ="demogform"> \
      <p><b>' +
      lang.demog.dob +
      '</b> <input name="dob" type="text" required /></p> \
      <p> <b>' +
      lang.demog.gender.prompt +
      '</b>\
         <br><input type="radio" id="male" name="gender" value="male" style="margin-left: 50px" required > <label for="male">' +
      lang.demog.gender.m +
      '</label> \
         <br><input type="radio" id="female" name="gender" value="female" style="margin-left: 50px"  > <label for="female">' +
      lang.demog.gender.f +
      "</label> \
      <p> <b>" +
      lang.demog.ethnicity.prompt +
      '</b>\
         <br><input type="radio" id="hispanic" name="ethnicity" value="hispanic" style="margin-left: 50px" required> <label for="hispanic">' +
      lang.demog.ethnicity.h +
      '</label>  \
         <br><input type="radio" id="nonhispanic" name="ethnicity" value="nonhispanic" style="margin-left: 50px"> <label for="nonhispanic">' +
      lang.demog.ethnicity.nh +
      "</label> \
      <p> <b>" +
      lang.demog.race.prompt +
      '</b>\
         <br><input type="radio" id="nativeamerican" name="race" value="nativeamerican" style="margin-left: 50px" required> <label for="nativeamerican">' +
      lang.demog.race.ai +
      '</label> \
         <br><input type="radio" id="asian" name="race" value="asian" style="margin-left: 50px"> <label for="asian">' +
      lang.demog.race.a +
      '</label> \
         <br><input type="radio" id="black" name="race" value="black" style="margin-left: 50px"> <label for="black">' +
      lang.demog.race.b +
      '</label> \
         <br><input type="radio" id="nativehawaiian" name="race" value="nativehawaiian" style="margin-left: 50px"> <label for="nativehawaiian">' +
      lang.demog.race.nh +
      '</label> \
         <br><input type="radio" id="white" name="race" value="white" style="margin-left: 50px"> <label for="white">' +
      lang.demog.race.w +
      '</label> \
         <br><input type="radio" id="more" name="race" value="more" style="margin-left: 50px"> <label for="more">' +
      lang.demog.race.m +
      "</label> \
      </div>"
    );
  },
  // add task name to data collection
  data: { task: "demographics" },
};

//----------------------- 3 ----------------------
//--------------------- EXPORT -------------------

export { demogform };
