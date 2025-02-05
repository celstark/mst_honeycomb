# MST Stand-alone
The Mnemonic Similarity Task began in 2007 (Kirwan & Stark, 2007) as a way to assess hippocampal function by using an object recognition memory task that consisted of studied targets, novel foils, and lures that had a controlled level of similarity (mnemonic similarity, not perceptual similarity) to studied items. This "classic version" has been [coded up in many ways](https://github.com/celstark/MST), including as a C++ stand-alone that many labs used for years to administer the task. Here, we have converted the classic study-test MST into a stand-alone Honeycomb / Electron app.

Before using this, know that there is also an "optimized" version of the MST, called the **oMST**.  The goal of a number of studies in 2019-22 and one of the aims of an NIA grant (R01 AG066683-01) was to develop a more optimized version of the task that might be more suitable for clinical use. The results of these studies are published ([Stark et al., 2023](https://www.frontiersin.org/articles/10.3389/fnbeh.2023.1080366/full)) and a web-based version (JATOS + jsPsych) is [available for all to use](https://github.com/celstark/oMST). For those that do not want to setup their own web server, a version of the [oMST using the same Honeycomb / Electron](https://github.com/celstark/omst_honeycomb) is available as well.

Both apps are multi-lingual, available in English, Chinese, Korean, Spanish, Dutch, and Russian. Contact us if you're interested in helping port the text to other languages.

# Current status
This is pre-release code.  Translations are incomplete (study-test aspects are in English only -- other languages should see the English version at least and run) and currently it's barely tested. Let me know what is broken (not if anything is broken).  The various phases should be in place now and functional. 

# Usage
If you're not a developer, download the appropriate `.dmg` or `.exe` from the Release page. (_Note, currently, the "universal" `.dmg` is actually only Apple Silicon / ARM specific.). These currently are not signed, so Windows Defender will likely complain.  The first time its run on Windows, it's unpacking a bit, but nothing gets "installed", at least not system-wide.  It does a local-user install into your AppData folder.  On Macs, as it's not signed yet, double-clicking on the app icon will likely lead to macOS preventing it from running.  Right-click (2 finger tap on the trackpad) and select Open (and yes, this is different than double-clicking) and it should run and not need this in the future. Feel free to drag to the Applications folder if you like as well.

## Task parameters and setup
The main screen that appears lets you enter in a study-ID and a participant-ID. These are used to save the data (to your desktop). When you type in the study-ID, any other parameters will be automatically restored from any prior runs with that same study-ID, so it's a good idea to set this first.

You'll notice a faint box in the upper-left of the screen that, when you mouse-over says "Experimenter view". Clicking on this reveals a new set of parameters. There you can set parameters and enable or disable each of the optional phases:

**Optional phases**:
- Consent: A simple consent form.  You'll need to rebuild from the source to have a lab specific one
- Demographics: NIH style demographics form
- Perceptual control: A short perceptual / working memory control task that shows color objects, a noise mask, then either a repeat or a similar lure (matched to the MST's similarity).
- Instructions: Guided instruction phase for the oMST

**Main options**:
- Stimulus set: There are 6 main sets of 192 pairs of objects in the MST. Sets are reasonably well-matched for difficulty
- Sublist: The MST can run quite well at half-length. Each stimulus set can be divided into 2 subsets that have matched difficulty (matching based on the MST's "lure bins").  With 6 sets and 2 sublists per set, you get 12 possible independent tests
- Response mode: Button / touchscreen (touches are mouse clicks on the buttons) or keyboard responses?
- Language: What language should be used?

In addition, there are two more options:
- Two-choice: Use old/new rather than old/similar/new.  Our studies have shown this is less effective / reliable than old/similar/new, but the option is here. We caution against using it and the instructions for this aren't complete.
- Self-paced: We use this in any somewhat impaired population. The image is on the screen for the same amount of time, but when the screen goes blank (as in the normal ISI) it remains on that blank screen awaiting a response rather than automatically moving on to the next trial. This keeps the memory aspects similar to the "normal" version but allows for slower motor components.

# Data
Your data will be saved to the Desktop in a folder for the study-ID. Within that, each participant-ID gets a folder and within that, each session gets a folder. Within that, files are stored with date-codes, so you should never overwrite any existing results.

Data are saved in both a `.json` and a `.csv` file. The `.json` is a jsPsych data file output in all its glory.  The `.csv` is very much like the original stand-alone in that you've got multiple tasks in one text file with data in comma-separated format. Spreadsheet programs are perfectly happy with this, but you may want to cut/paste out the blocks you really need.

# Credits
## People
Mad props go to [Audrey Hempel](https://github.com/audrey-hemp/omst_honeycomb), who wrote the first version of the stand-alone task rather than having a relaxing summer break. That was the real heavy lift. After that, [Craig Stark](https://github.com/celstark) created this fork for further development of the project.

## Tools
There are several technologies that make this work. At its core, this is an [Electron](https://www.electronjs.org/) application. Electron is a tool that essentially bundles a web browser and your JavaScript code into a single desktop application. Here, we took the [oMST](https://github.com/celstark/oMST) that typically runs in a web browser (via [JATOS](https://www.jatos.org/) and [jsPsych](https://www.jspsych.org/)) as the basis and ported it into [Honeycomb](https://github.com/brown-ccv/honeycomb), a purpose-built template for this kind of thing (see below). We're using this here for stand-alone apps, but Honeycomb incorporates with things like PsiTurk and Firebase if you're into that sort of thing.

## Honeycomb

[![DOI:10.1590/1516-4446-2020-1675](https://img.shields.io/badge/DOI-10.1590%2F1516--4446--2020--1675-orange)](https://doi.org/10.1590/1516-4446-2020-1675) [![docs](https://img.shields.io/badge/docs-stable-blue)](https://brown-ccv.github.io/honeycomb-docs/)

Honeycomb is a template for reproducible psychophysiological tasks for clinic, laboratory, and home use. It is maintained by members of the [Center for Computation and Visualization](https://ccv.brown.edu) and the [Neuromotion Lab](http://borton.engin.brown.edu/) at Brown University. To learn about installation, usage and deployment please [visit our documentation](https://brown-ccv.github.io/honeycomb-docs/).

_Note: previously named Neuro Task Starter, some references may still refer to it as such._

If you use Honeycomb in your work, please cite:

[Provenza, N.R., Gelin, L.F.F., Mahaphanit, W., McGrath, M.C., Dastin-van Rijn, E.M., Fan, Y., Dhar, R., Frank, M.J., Restrepo, M.I., Goodman, W.K. and Borton, D.A., 2021. Honeycomb: a template for reproducible psychophysiological tasks for clinic, laboratory, and home use. Brazilian Journal of Psychiatry, 44, pp.147-155.](https://doi.org/10.1590/1516-4446-2020-1675)
