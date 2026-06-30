# DX Edit

## TODO

- [x] Ensure WebMIDI works with FF linux (snap or deb)
- [x] List and select midi ports, send and receive midi
- [x] Edit performance parameters
- [x] Save MIDI settings
- [x] Port midi.js to TS
- [x] Remove minValue support (not needed)
- [x] Env Editor: Show envelope shape (canvas)
- [x] Add INIT patch (default to that)
- [x] Try mantine (mantine.dev)
- [x] Move Patch Name to Voice Editor.
- [x] Add All-notes-off to Config tab.
- [x] Voice Editor: Add "Send/Sync" feature to send all voice params to DX7
- [x] Factor DX7 logic out of App.tsx
- [x] Send sysex only on release (sliders)
- [ ] Check: Only valid ASCII chars in voice name
- [ ] Check: voiceParamData.constructor: validate string length
- [ ] Config: Add instructions for setting up DX7 (and other devices)
- [ ] UI: Create own icons for tabs etc.
- [ ] UI: Fix color scheme
- [ ] UI: Fix spacing, ensure works on various devices
- [ ] UI: Add help/descriptions to controls (tooltips?)
- [ ] UI: Graphics for Algorithms, LFO Waveforms, Keyboard level scaling
- [ ] Pick Kbd Break Point by MIDI controller
- [ ] Visualize LFO, Keyboard Level Scaling
- [ ] Env Editor: Show values in actual units (dB, seconds)
- [ ] Env Editor: Support Rate/Level, ADSR, AR envelopes
- [ ] Edit current program params and name
- [ ] Send/receive full voice/bank sysex
- [ ] Send individual programs
- [ ] Librarian features. Save and remix banks
- [ ] Cloud/share support

## Changelog


### v0.2.0

2026-06-30

New/improved features
* Sysex is sent only when you finish dragging a slider (or move it
  with the keyboard). This is because too frequent parameter changes
  overwhelms the DX7 and leads to annoying dropouts.
  UI is still updated continously.
* Added "Init Voice (reset to default)" feature in Voice Editor.
* Added "Send All to Device (synchronize)" feature in Voice Editor.
* Added correct title.

Internal
* Factored out DX7-specific code.
* Cleaned up some React warnings.

### v0.1.2

2026-06-28

* Editing "Voice Name" now works correctly.

### v0.1.1

2026-06-27

* Layout fixes.
* Minor code cleanup and refactoring.

### v0.1.0

Initial release.
2026-06-26

* Selectable MIDI ports (in/out/controller).
* MIDI note test.
* All notes off.
* Performance editor supporting all of the
  DX7 performance parameters.
* Voice editor supporting all DX7 voice parameters.
  - OP and Pitch EG (envelope) visualization.
  - Displays "friendly" parameter values.
  - Calculates and displays OP frequencies in fixed mode.
