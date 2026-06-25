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
* Factor DX7 logic out of App.tsx
* Move Patch Name to Voice Editor. Add All-notes-off and Panic to Config tab.
* Config: Add instructions for setting up DX7 (and other devices)
* Add help/descriptions to controls (tooltips?)
* Voice Editor: Add "Send/Sync" feature to send all voice params to DX7
* Try mantine (mantine.dev)
* Send sysex only on release (sliders) -> Mantine?
* Pick Kbd Break Point by MIDI controller
* Visualize LFO, Keyboard Level Scaling
* Env Editor: Show values in actual units (dB, seconds)
* Env Editor: Support Rate/Level, ADSR, AR envelopes
* Edit current program params and name
* Send/receive full voice/bank sysex.
* Send individual programs.
* Librarian features. Save and remix banks.
* Cloud/share support.

* Mantine / layout
  * Create own icons for tabs etc.
  * Fix color scheme
  * Fix spacing, ensure works on various devices
  * 


## Template

Vite + TS + React from:
https://medium.com/@selfint/build-an-electron-app-using-vite-typescript-and-react-e98f7fc1babd

