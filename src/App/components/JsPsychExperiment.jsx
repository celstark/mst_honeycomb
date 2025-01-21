//*******************************************************************
//
//   File: JsPsychExperiment.js               Folder: components
//
//   Author: Honeycomb, Audrey Hempel
//   --------------------
//
//   Changes:
//        7/13/23 (AGH): deleted start_date and task_version from
//                       added properties
//        7/21/23 (AGH): added dataCalcFunction from contOmst to
//                       on_finish in combinedOptions
//        7/24/23 (AGH): modified on_finish to update the data with
//                       the added summary so it saves to the json
//                       file
//                       added endDate to record the time the
//                       experiment ends
//        8/1/23 (AGH):  added pconDataCalcFunction to on_finish in
//                       in combinedOptions to add pcon data summary
//                       to the data file
//       6/10/24 (CELS): Passing jsPsych to buildTimeline
//
//   --------------------
//   This file holds the experiment, adds properties and builds the
//   timelines
//
//*******************************************************************

//----------------------- 1 ----------------------
//-------------------- IMPORTS -------------------

import { initJsPsych } from "jspsych";
import React, { useEffect, useMemo, useRef } from "react";

import { config } from "../../config/main";
import { initParticipant } from "../deployments/firebase";
import { buildTimeline, jsPsychOptions } from "../../timelines/main";
import { dataCalcFunction } from "../../trials/mstt";
import { pconDataCalcFunction } from "../../trials/pcon_demos";
import { getFormattedDate } from "../../lib/utils";
import { include_pcon } from "./Login";

//----------------------- 2 ----------------------
//-------------------- JSPSYCH -------------------

function JsPsychExperiment({
  participantId,
  studyId,
  taskVersion,
  dataUpdateFunction,
  dataFinishFunction,
  height = "100%",
  width = "100%",
}) {
  // This will be the div in the dom that holds the experiment.
  // We reference it explicitly here so we can do some plumbing with react, jspsych, and events.
  const experimentDivId = "experimentWindow";
  const experimentDiv = useRef(null);

  // Combine custom options imported from timelines/maine.js, with necessary Honeycomb options.
  const combinedOptions = {
    ...jsPsychOptions,
    display_element: experimentDivId,
    on_data_update: (data) => dataUpdateFunction(data),
    on_finish: (data) => {
      var pconsummary = null;
      if (include_pcon) {
        pconsummary = pconDataCalcFunction(data);
      }
      const msttsummary = dataCalcFunction(data);
      const summary = { pconsummary, msttsummary };
      const end_date = getFormattedDate(new Date());
      dataUpdateFunction({ summary, end_date });
      const dataWithSummary = { ...data, summary, end_date };
      dataFinishFunction(dataWithSummary);
    },
  };

  // Create the instance of jsPsych that we'll reuse within the scope of this JsPsychExperiment component.
  // As of jspsych 7, we create our own jspsych instance(s) where needed instead of importing one global instance.
  const jsPsych = useMemo(() => {
    // Start date of the experiment - used as the UID
    // TODO 169: JsPsych has a built in timestamp function
    const startDate = new Date().toISOString();

    // Write the initial record to Firestore
    if (config.USE_FIREBASE) initParticipant(participantId, studyId, startDate);

    const jsPsych = initJsPsych(combinedOptions);
    // Add experiment properties into jsPsych directly
    jsPsych.data.addProperties({
      study_id: studyId,
      participant_id: participantId,
    });
    return jsPsych;
  }, [participantId, studyId, taskVersion]);

  // Build our jspsych experiment timeline (in this case a Honeycomb demo, you could substitute your own here).
  const timeline = buildTimeline(jsPsych, studyId, participantId);

  // Set up event and lifecycle callbacks to start and stop jspsych.
  // Inspiration from jspsych-react: https://github.com/makebrainwaves/jspsych-react/blob/master/src/index.js
  const handleKeyEvent = (e) => {
    if (e.redispatched) return;

    const newEvent = new e.constructor(e.type, e);
    newEvent.redispatched = true;
    experimentDiv.current.dispatchEvent(newEvent);
  };

  // These useEffect callbacks are similar to componentDidMount / componentWillUnmount.
  // If necessary, useLayoutEffect callbacks might be even more similar.
  useEffect(() => {
    window.addEventListener("keyup", handleKeyEvent, true);
    window.addEventListener("keydown", handleKeyEvent, true);
    jsPsych.run(timeline);

    return () => {
      window.removeEventListener("keyup", handleKeyEvent, true);
      window.removeEventListener("keydown", handleKeyEvent, true);
      try {
        jsPsych.endExperiment("Ended Experiment");
      } catch (e) {
        console.error("Experiment closed before unmount");
      }
    };
  });

  return (
    <div className="App">
      <div id={experimentDivId} style={{ height, width }} ref={experimentDiv} />
    </div>
  );
}

//----------------------- 3 ----------------------
//-------------------- EXPORTS -------------------

export default JsPsychExperiment;
