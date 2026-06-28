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
- [ ] Voice Editor: Add "Send/Sync" feature to send all voice params to DX7
- [ ] Factor DX7 logic out of App.tsx
- [ ] Send sysex only on release (sliders) -> Mantine?
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
- [ ] Send/receive full voice/bank sysex.
- [ ] Send individual programs.
- [ ] Librarian features. Save and remix banks.
- [ ] Cloud/share support.

## Changelog



* Editing "Voice Name" now works correctly

### v0.1.1

2026-06-27

* Layout fixes
* Minor code cleanup and refactoring

### v0.1.0

Initial release.
2026-06-26

* Selectable MIDI ports (in/out/controller)
* MIDI note test
* All notes off
* Performance editor supporting all of the
  DX7 performance parameters.
* Voice editor supporting all DX7 voice parameters
  - OP and Pitch EG (envelope) visualization
  - Displays "friendly" parameter values
  - Calculates and displays OP frequencies in fixed mode
