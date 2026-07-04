# DX Edit

Browser based editor and utility for Yamaha DX / TX and similar synthesizers.


**Try it [here](https://dx.ahlzen.com/)**.

![Screenshot of Voice Editor](img/Voice%20Editor%2050.png)

![Screenshot of Performance Parameters Editor](img/Performance%20Parameters%2050.png)


## Features

* Full editing of DX7 Performance Parameters.
* Full Voice Editor.
* Friendly display of parameter values (Note, Semitones, Hz, etc).
* Calculates and displays operator frequencies in fixed mode.
* Envelope visualization, with Point/Segement highlight for sliders.


## Setup

### Browser Requirements

* Supported browsers include **Chrome, Edge, Firefox on Linux**.
  See https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API#browser_compatibility
* **HTTPS** is usually required (to allow WebMIDI with SysEx).

Select your MIDI ports under Configuration.

### DX7: Enable SysEx

System Exclusive support must be enabled every time the DX7 is turned on.

1. Press: [Function], [8], [8]
2. Display shows: `SYS INFO UNAVAIL`
3. Press: [+1]
4. Display shows: `SYS INFO AVAIL`
5. SysEx support is now enabled.

### DX7: Disable memory protection

Before saving your edits to the DX7, turn off memory protection.

1. Press: Memory Protect [Internal] (or [Cartridge] if RAM cartridge)
2. Display shows: `MEMORY PROTECT INTERNAL ON`
3. Press: [-1]
4. Display shows: `MEMORY PROTECT INTERNAL OFF`


## Development

Clone and build using _npm_ and _vite_.

```
git clone https://github.com/Ahlzen/DXEdit
cd DXEdit
npm install
```

Run locally:

```
npm run dev
```
Build dist package under `dist/`:
```
npm build
```


## Credits

Lars Ahlzen

lars@ahlzen.com