//*******************************************************************
//
//   File: Login.js               Folder: components
//
//   Author: Honeycomb, Craig Stark, Audrey Hempel
//   --------------------
//
//   Changes:
//        7/18/23 (AGH): moved the timeline variables for contOMST
//                       test_trials from ./trials (stim_set, trialorder,
//                       run, twochoice, selfpaced, orderfile);
//                       set up each as state variables defined when the
//                       user submits the Login page
//                       changed the resp_mode selection from a trial (in
//                       /trials/setRepType) to a state variable
//                       moved msttBlock from /config/experiment so that
//                       the experiment conditions are updated based on
//                       the user selection of the state variables on Login
//                       (now calls the function loadmsttBlock from
//                       /config/experiment)
//        7/21/23 (AGH): reformatted login page in App.css
//        7/26/23 (AGH): added UseEffect for a studyID change and localstorage
//                       API to save the options for a particular studyID so
//                       that repeated uses of the same studyID automatically
//                       sets the previously used options
//        7/27/23 (AGH): added chooseLanguage, includeConsent, includeDemog,
//                       includePcon and includeInstr
//        7/28/23 (AGH): added showExperimentView to create hide and show element
//                       for participant view and experiment view login screens
//        7/31/23 (AGH): added var login_data and conditional vars to record the
//                       login options at the first included trial (in
//                       checkConfigOptions)
//        8/9/23  (AGH): updated for new 2x3 orderfiles, removed trialorder
//                       state var and changed run to "sublist"
//       6/10/24 (CELS): Added feedback option
//        1/20/25 (CELS): Added MSTS and MSTT bit
//
//   --------------------
//   This file creates a Login screen that logs in the participant
//   and allows selection of experiment options (stim_set, sublist,
//   twochoice, selfpaced, orderfile, resp_mode).
//
//*******************************************************************

//----------------------- 1 ----------------------
//-------------------- IMPORTS -------------------

import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import { deepCopy } from "../../lib/utils";
import { loadOrder } from "../../config/cont";
import { loadMSTSBlock, loadMSTTBlock } from "../../config/experiment";
import { defaultBlockSettings } from "../../config/main";

import { refresh_pcon_trials } from "../../trials/pcon_demos";
import { refresh_instr_trials } from "../../trials/instructions";
import { refresh_mstt_trials } from "../../trials/mstt";
import { refresh_msts_trials } from "../../trials/msts";
import { getFormattedDate } from "../../lib/utils";

//----------------------- 2 ----------------------
//------------------- VARIABLES ------------------

var start_date;
var stim_set = "1";
var sublist = "1";
var twochoice;
var selfpaced;
var orderfile_msts = "./jsOrders/MST_64_s1_p1_o1";
var orderfile_mstt = ""; // Used in test phase of study-test
var resp_mode = "button";
var format = "st64";
var lang;
var language;
var include_consent;
var include_demog;
var include_pcon;
var include_instr;
var include_feedback;

var trial_stim_msts;
var trial_stim_mstt;
var msttBlock = deepCopy(defaultBlockSettings);
var mstsBlock = deepCopy(defaultBlockSettings);

var consent_login_data;
var demog_login_data;
var pcon_login_data;
var instr_login_data;
var cont_login_data;

//----------------------- 3 ----------------------
//------------------- FUNCTIONS ------------------

function Login({ handleLogin, initialParticipantID, initialStudyID, validationFunction }) {
  // State variables for login screen
  const [participantId, setParticipant] = useState(initialParticipantID);
  const [studyId, setStudy] = useState(initialStudyID);
  const [isError, setIsError] = useState(false);

  const [chooseStimset, setStimset] = useState("1");
  const [chooseSublist, setSublist] = useState("1");
  const [chooseRespmode, setRespmode] = useState("button");
  const [chooseFormat, setFormat] = useState("st64");
  const [chooseLang, setLang] = useState("English");
  const [chooseTwochoice, setTwochoice] = useState(false);
  const [chooseSelfpaced, setSelfpaced] = useState(false);
  const [includeConsent, setConsent] = useState(false);
  const [includeDemog, setDemog] = useState(false);
  const [includePcon, setPcon] = useState(false);
  const [includeInstr, setInstr] = useState(false);
  const [includeFeedback, setFeedback] = useState(false);
  const [showExperimenterView, setShowExperimenterView] = useState(false); // Toggle for experimenter view

  // Function to check and retrieve the stored options from localStorage
  // This function will be called when the Login component mounts
  useEffect(() => {
    if (!studyId) return; // Return early if studyId is empty or null

    const storedStimset = localStorage.getItem(`${studyId}_stimset`);
    const storedSublist = localStorage.getItem(`${studyId}_sublist`);
    const storedRespmode = localStorage.getItem(`${studyId}_respmode`);
    const storedFormat = localStorage.getItem(`${studyId}_format`);
    const storedLang = localStorage.getItem(`${studyId}_lang`);
    const storedTwochoice = localStorage.getItem(`${studyId}_twochoice`);
    const storedSelfpaced = localStorage.getItem(`${studyId}_selfpaced`);
    const storedConsent = localStorage.getItem(`${studyId}_consent`);
    const storedDemog = localStorage.getItem(`${studyId}_demog`);
    const storedPcon = localStorage.getItem(`${studyId}_pcon`);
    const storedInstr = localStorage.getItem(`${studyId}_instr`);
    const storedFeedback = localStorage.getItem(`${studyId}_feedback`);

    // Set the stored options as the initial state if available
    setStimset(storedStimset || "1");
    setSublist(storedSublist || "1");
    setRespmode(storedRespmode || "button");
    setFormat(storedFormat || "st64");
    setLang(storedLang || "English");
    setTwochoice(storedTwochoice == "true");
    setSelfpaced(storedSelfpaced == "true");
    setConsent(storedConsent == "true");
    setDemog(storedDemog == "true");
    setPcon(storedPcon == "true");
    setInstr(storedInstr == "true");
    setFeedback(storedFeedback == "true");
  }, [studyId]); // Only run this effect when studyId change

  // Function to log in participant
  function handleSubmit(e) {
    e.preventDefault();
    // Logs user in if a valid participant/study id combination is given
    validationFunction(participantId, studyId).then((isValid) => {
      setIsError(!isValid);
      if (isValid) handleLogin(participantId, studyId);
    });
  }

  // Function to check the states of all the options and assign chosen values to each variable, called when Login button is pressed
  function checkConfigOptions() {
    start_date = getFormattedDate(new Date());

    // [set=#]: Stimulus set -- 1-6 (1=default) -- used in loading the order file
    stim_set = chooseStimset;
    console.log("stimset = " + chooseStimset);

    // [run=#]: Which particular run? (1-3, 1=default) -- controls which actual stimuli in that set are plugged into the order
    sublist = chooseSublist;
    console.log("sublist = " + chooseSublist);

    // [resp_mode='']: Respond with buttons or keyboard? (default = button)
    resp_mode = chooseRespmode;
    console.log("respmode = " + chooseRespmode);

    // [lang='']: Which language file? (default = English)
    if (chooseLang == "Spanish") {
      lang = require("../../language/omst_es.json");
    } else if (chooseLang == "Korean") {
      lang = require("../../language/omst_kr.json");
    } else if (chooseLang == "Chinese") {
      lang = require("../../language/omst_cn.json");
    } else if (chooseLang == "Russian") {
      lang = require("../../language/omst_ru.json");
    } else {
      lang = require("../../language/omst_en.json");
    }

    language = chooseLang;
    console.log("language = " + chooseLang);

    format = chooseFormat; 
    console.log('format = ',format,chooseFormat)
    if (format == "st64") {
      sublist="1";
    }

    // [twochoice=#]: 0=OSN, 1=ON response choices (0=default)
    if (chooseTwochoice === true) {
      twochoice = 1;
    } else {
      twochoice = 0;
    }
    console.log("twochoice =" + twochoice);

    // [selfpaced=#]: Should we allow infinite time with blank screen to make the response? (default =1)
    if (chooseSelfpaced === true) {
      selfpaced = 1;
    } else {
      selfpaced = 0;
    }
    console.log("selfpaced =" + selfpaced);

    include_consent = includeConsent;
    console.log("include consent =" + includeConsent);

    include_demog = includeDemog;
    console.log("include demog =" + includeDemog);

    include_pcon = includePcon;
    console.log("include pcon =" + includePcon);

    include_instr = includeInstr;
    console.log("include instr =" + includeInstr);

    include_feedback = includeFeedback;
    console.log("include feedback =" + includeFeedback);

    // load trial stim from jsOrders file
    // For study-test, orderfile = study, orderfile2 = test
    console.log('getting order ',format,stim_set,sublist)
    const ofvals = loadOrder(format, stim_set, sublist);
    orderfile_msts = ofvals[0];
    trial_stim_msts = ofvals[1];
    console.log('MSTS order ',orderfile_msts,trial_stim_msts.length)
    mstsBlock = loadMSTSBlock(trial_stim_msts, stim_set);

    //orderfile_mstt = orderfile_msts.replace("_p1_", "_p2_");
    const ofvals_mstt = loadOrder(format, stim_set, sublist, 2);
    orderfile_mstt = ofvals_mstt[0];
    trial_stim_mstt = ofvals_mstt[1];
    console.log('MSTT order ',orderfile_mstt,trial_stim_mstt.length)
    msttBlock = loadMSTTBlock(trial_stim_mstt, stim_set);


    // refresh trails based on Login options
    console.log("refreshing trials");
    refresh_instr_trials();
    refresh_mstt_trials();
    refresh_msts_trials();
    refresh_pcon_trials();

    // Save the user-selected options to localStorage
    localStorage.setItem(`${studyId}_stimset`, chooseStimset);
    localStorage.setItem(`${studyId}_sublist`, chooseSublist);
    localStorage.setItem(`${studyId}_respmode`, chooseRespmode);
    localStorage.setItem(`${studyId}_format`, chooseFormat);
    localStorage.setItem(`${studyId}_lang`, chooseLang);
    localStorage.setItem(`${studyId}_twochoice`, chooseTwochoice);
    localStorage.setItem(`${studyId}_selfpaced`, chooseSelfpaced);
    localStorage.setItem(`${studyId}_consent`, includeConsent);
    localStorage.setItem(`${studyId}_demog`, includeDemog);
    localStorage.setItem(`${studyId}_pcon`, includePcon);
    localStorage.setItem(`${studyId}_instr`, includeInstr);
    localStorage.setItem(`${studyId}_feedback`, includeFeedback);

    // load login options to be recorded in data file
    var login_data = {
      start_date: start_date,
      stimset: stim_set,
      sublist: sublist,
      respmode: resp_mode,
      format: format,
      language: language,
      include_consent: include_consent,
      include_demog: include_demog,
      include_pcon: include_pcon,
      include_instr: include_instr,
      include_feedback: include_feedback,
      twochoice: twochoice,
      selfpaced: selfpaced,
    };

    // record login_data at first included trial
    if (!include_consent) {
      console.log("login data at demog");
      demog_login_data = login_data;
      if (!include_demog) {
        console.log("overwrite: login data at pcon");
        pcon_login_data = login_data;
        if (!include_pcon) {
          console.log("overwrite: login data at instr");
          instr_login_data = login_data;
          if (!include_instr) {
            console.log("overwrite: login data at cont");
            cont_login_data = login_data;
          }
        }
      }
    } else {
      console.log("login data at consent");
      consent_login_data = login_data;
    }
  }

  // Toggle between experimenter view and participant view
  function toggleExperimenterView() {
    setShowExperimenterView((prevShow) => !prevShow);
  }

  //----------------------- 4 ----------------------
  //--------------------LOGIN FORM -----------------

  const renderLoginForm = () => {
    if (showExperimenterView) {
      return (
        // show all options
        <div className="centered-h-v">
          <div className="login-form">
            <Form className="centered-h-v" onSubmit={handleSubmit}>
              <Form.Group className="login" size="lg" controlId="participantId">
                <Form.Label>Participant ID</Form.Label>
                <Form.Control
                  autoFocus
                  type="participantId"
                  value={participantId}
                  onChange={(e) => setParticipant(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="login" size="lg" controlId="studyId">
                <Form.Label>Study ID</Form.Label>
                <Form.Control
                  type="studyId"
                  value={studyId}
                  onChange={(e) => setStudy(e.target.value)}
                />
              </Form.Group>

              <div className="num-options-container">
                <div className="num-options">
                  <Form.Group controlId="stim_set">
                    <Form.Label>Stimulus set:</Form.Label>
                    <Form.Control
                      as="select"
                      value={chooseStimset}
                      onChange={(e) => setStimset(e.target.value)}
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                    </Form.Control>
                  </Form.Group>
                  <Form.Group controlId="sublist">
                    <Form.Label>Sublist:</Form.Label>
                    <Form.Control
                      as="select"
                      value={chooseSublist}
                      onChange={(e) => setSublist(e.target.value)}
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                    </Form.Control>
                  </Form.Group>
                </div>

                <div className="response-options-container">
                  <div className="response-options">
                    <Form.Group controlId="respmode">
                      <Form.Label>Response mode:</Form.Label>
                      <Form.Control
                        as="select"
                        value={chooseRespmode}
                        onChange={(e) => setRespmode(e.target.value)}
                      >
                        <option value="button">Buttons</option>
                        <option value="keyboard">Keyboard</option>
                      </Form.Control>
                    </Form.Group>
                  </div>
                  <div className="response-options">
                    <Form.Group controlId="lang">
                      <Form.Label>Language:</Form.Label>
                      <Form.Control
                        as="select"
                        value={chooseLang}
                        onChange={(e) => setLang(e.target.value)}
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Español</option>
                        <option value="Korean">한국인</option>
                        <option value="Chinese">中文</option>
                        <option value="Russian">Pyccкий</option>
                      </Form.Control>
                    </Form.Group>
                  </div>
                  <div className="response-options">
                    <Form.Group controlId="format">
                      <Form.Label>Format:</Form.Label>
                      <Form.Control
                        as="select"
                        value={chooseFormat}
                        onChange={(e) => setFormat(e.target.value)}
                      >
                        <option value="st64">Classic-full</option>
                        <option value="st32">Classic-half</option>
                      </Form.Control>
                    </Form.Group>
                  </div>
                </div>
              </div>


              <div className="checkboxes-container">
                <div className="checkbox-option">
                  <Form.Group controlId="consent">
                    <Form.Check
                      type="checkbox"
                      label="Consent"
                      checked={includeConsent}
                      onChange={(e) => setConsent(e.target.checked)}
                    />
                  </Form.Group>
                </div>
                <div className="checkbox-option">
                  <Form.Group controlId="demog">
                    <Form.Check
                      type="checkbox"
                      label="Demographics"
                      checked={includeDemog}
                      onChange={(e) => setDemog(e.target.checked)}
                    />
                  </Form.Group>
                </div>
                <div className="checkbox-option">
                  <Form.Group controlId="pcon">
                    <Form.Check
                      type="checkbox"
                      label="Perceptual Control"
                      checked={includePcon}
                      onChange={(e) => setPcon(e.target.checked)}
                    />
                  </Form.Group>
                </div>
                <div className="checkbox-option">
                  <Form.Group controlId="instr">
                    <Form.Check
                      type="checkbox"
                      label="Instructions"
                      checked={includeInstr}
                      onChange={(e) => setInstr(e.target.checked)}
                    />
                  </Form.Group>
                </div>
                <div className="checkbox-option">
                  <Form.Group controlId="twochoice">
                    <Form.Check
                      type="checkbox"
                      label="Two Choice"
                      checked={chooseTwochoice}
                      onChange={(e) => setTwochoice(e.target.checked)}
                    />
                  </Form.Group>
                </div>
                <div className="checkbox-option">
                  <Form.Group controlId="selfpaced">
                    <Form.Check
                      type="checkbox"
                      label="Self-paced"
                      checked={chooseSelfpaced}
                      onChange={(e) => setSelfpaced(e.target.checked)}
                    />
                  </Form.Group>
                </div>
                <div className="checkbox-option">
                  <Form.Group controlId="feedback">
                    <Form.Check
                      type="checkbox"
                      label="Feedback"
                      checked={includeFeedback}
                      onChange={(e) => setFeedback(e.target.checked)}
                    />
                  </Form.Group>
                </div>
              </div>

              <Button
                style={{ width: "100%" }}
                block
                size="lg"
                type="submit"
                disabled={participantId.length === 0 || studyId.length === 0}
                onClick={checkConfigOptions}
              >
                Log In
              </Button>
            </Form>
            {isError ? (
              <div className="alert alert-danger" role="alert">
                No matching experiment found for this participant and study
              </div>
            ) : null}
          </div>
        </div>
      );
    } else {
      return (
        <div className="centered-h-v">
          <div className="login-form">
            <Form className="centered-h-v" onSubmit={handleSubmit}>
              <Form.Group className="login" size="lg" controlId="participantId">
                <Form.Label>Participant ID</Form.Label>
                <Form.Control
                  autoFocus
                  type="participantId"
                  value={participantId}
                  onChange={(e) => setParticipant(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="login" size="lg" controlId="studyId">
                <Form.Label>Study ID</Form.Label>
                <Form.Control
                  type="studyId"
                  value={studyId}
                  onChange={(e) => setStudy(e.target.value)}
                />
              </Form.Group>
              <Button
                style={{ width: "100%" }}
                block
                size="lg"
                type="submit"
                disabled={participantId.length === 0 || studyId.length === 0}
                onClick={checkConfigOptions}
              >
                Log In
              </Button>
            </Form>
            {isError ? (
              <div className="alert alert-danger" role="alert">
                No matching experiment found for this participant and study
              </div>
            ) : null}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="centered-h-v">
      {/* Toggle button to switch between experimenter and participant views */}
      <Button className="toggle-button" onClick={toggleExperimenterView}>
        {showExperimenterView ? "Switch to Participant View" : "Switch to Experimenter View"}
      </Button>
      {/* Render the appropriate login form */}
      {renderLoginForm()}
    </div>
  );
}

//----------------------- 5 ----------------------
//---------------------EXPORTS -------------------

export {
  Login,
  stim_set,
  sublist,
  resp_mode,
  lang,
  language,
  include_consent,
  include_demog,
  include_pcon,
  include_instr,
  include_feedback,
  twochoice,
  selfpaced,
  orderfile_msts,
  orderfile_mstt,
  trial_stim_msts,
  trial_stim_mstt,
  mstsBlock,
  msttBlock,
  consent_login_data,
  demog_login_data,
  pcon_login_data,
  instr_login_data,
  cont_login_data,
};
