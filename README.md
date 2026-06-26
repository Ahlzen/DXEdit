# DX Edit

Browser based editor and utility for Yamaha DX and TX series synthesizers.

Work in progress.


## Setup and Requirements

### Browser: WebMIDI+Sysex

* Ensure app is running on HTTPS
* Supported browsers: Chrome, Edge, Firefox on Linux
  https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API#browser_compatibility

### DX7: Enable SysEx

1. [Function], [8], [8]
2. SYS INFO UNAVAIL
3. [+1]
4. SYS INFO AVAIL

### DX7: Disable memory protection

1. Memory Protect [Internal] (or [Cartridge] if RAM cartridge)
2. MEMORY PROTECT INTERNAL ON
3. [-1]
4. MEMORY PROTECT INTERNAL OFF


