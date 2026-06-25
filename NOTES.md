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
* UI: Create own icons for tabs etc.
* UI: Fix color scheme
* UI: Fix spacing, ensure works on various devices
* Factor DX7 logic out of App.tsx
* Move Patch Name to Voice Editor. Add All-notes-off and Panic to Config tab.
* Config: Add instructions for setting up DX7 (and other devices)
* Add help/descriptions to controls (tooltips?)
* Graphics for Algorithms, LFO Waveforms, Keyboard level scaling
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


## Setup and Requirements

Browser: WebMIDI requirements
* Ensure app is running on HTTPS
* Chrome, Edge, Firefox (Linux)
  See: https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API#browser_compatibility

DX7: Enable SysEx
1. [Function], [8], [8]
2. SYS INFO UNAVAIL
3. [+1]
4. SYS INFO AVAIL

DX7: Disable memory protection
5. Memory Protect [Internal] (or [Cartridge] if RAM cartridge)
6. MEMORY PROTECT INTERNAL ON
7. [-1]
8. MEMORY PROTECT INTERNAL OFF


## Troubleshooting

### List MIDI devices on Linux

amidi -l
