# DX Edit

## TODO

o Ensure WebMIDI works with FF linux (snap or deb)
o List and select midi ports, send and receive midi
o Edit performance parameters
o Save MIDI settings
o Port midi.js to TS
o Remove minValue support (not needed)
o Env Editor: Show envelope shape (canvas)
o Add INIT patch (default to that)
o Try mantine (mantine.dev)
o Move Patch Name to Voice Editor.
o Add All-notes-off to Config tab.
* Voice Editor: Add "Send/Sync" feature to send all voice params to DX7
* Factor DX7 logic out of App.tsx
* Send sysex only on release (sliders) -> Mantine?
* Config: Add instructions for setting up DX7 (and other devices)
* UI: Create own icons for tabs etc.
* UI: Fix color scheme
* UI: Fix spacing, ensure works on various devices
* UI: Add help/descriptions to controls (tooltips?)
* UI: Graphics for Algorithms, LFO Waveforms, Keyboard level scaling
* Pick Kbd Break Point by MIDI controller
* Visualize LFO, Keyboard Level Scaling
* Env Editor: Show values in actual units (dB, seconds)
* Env Editor: Support Rate/Level, ADSR, AR envelopes
* Edit current program params and name
* Send/receive full voice/bank sysex.
* Send individual programs.
* Librarian features. Save and remix banks.
* Cloud/share support.

## Changelog



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
