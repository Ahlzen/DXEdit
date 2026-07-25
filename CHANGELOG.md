## DX Edit Changelog


### v0.4.1

2026-07-25

* Fixed bug saving "envelope time mode" setting.


### v0.4.0

2026-07-25

* Added Algorithm Picker dialog.
* Added "knobs" (drag or wheel to change) for Envelope values.
* Envelopes can be set to display and edit Time (instead of
  Rate) values. This may be more intuitive when used to other
  synthesizers.


### v0.3.1

2026-07-12

* Removed redundant slider hovertext.
* Fixed version number.
* Cleaned up most linting warnings.


### v0.3.0

2026-07-12

* Added visual diagram of selected algorithm.
* More internal cleanups.


### v0.2.0

2026-06-30

* Sysex is sent only when you finish dragging a slider (or move it
  with the keyboard). This is because too frequent parameter changes
  overwhelms the DX7 and leads to annoying dropouts.
  UI is still updated continuously.
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
