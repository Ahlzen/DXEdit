import { toHexString } from "../utils";

export class WebMidi
{
  ///// Internal state
  
  private _midiAccess?: MIDIAccess; // set when initialized
  private _midiIn?: MIDIInput;
  private _midiOut?: MIDIOutput;
  private _controllerIn? : MIDIInput;
  private _midiInPorts: MIDIInput[] = [];
  private _midiOutPorts: MIDIOutput[] = [];

  private _isInitialized = false;
  get isInitialized() {
    return this._isInitialized;
  }


  ///// Public events

  onMidiIn?: (data: Uint8Array) => void;
  onControllerIn?: (data: Uint8Array) => void;


  ///// Constants

  // Enable for more debug output
  private verbose: boolean = true;

	START_OF_SYSEX = 0xF0;
	END_OF_SYSEX = 0xF7;
	YAMAHA_MANUFACTURER_ID = 0x43;
  // TODO: factor out. these are DX7 specific:
	SUB_STATUS_BULK = 0x00;
	SUB_STATUS_PARAMETER = 0x10; // 0x01 << 4
	BULK_FORMAT_SINGLE_VOICE = 0x00;
	BULK_FORMAT_32VOICES = 0x09;
	PARAMETER_GROUP_VOICE = 0x00;
	PARAMETER_GROUP_FUNCTION = 0x08; // 0x02 << 2


  ///// Initialization

  constructor()
  {
  }

  initialize(needSysex: boolean,
    onSuccess: () => void,
    onError: (errorMessage: string) => void
  ) {
    const midiOptions: MIDIOptions = {
      sysex: needSysex
    }
    navigator.requestMIDIAccess(midiOptions).then(
      (access: MIDIAccess) => {
        this._midiAccess = access;
        this._midiInPorts = [];
        this._midiOutPorts = [];
        this._midiAccess?.inputs.forEach((port) => this._midiInPorts.push(port));
        this._midiAccess?.outputs.forEach((port) => this._midiOutPorts.push(port));    
        this._isInitialized = true;
        onSuccess();
      },
      (error: any) => {
        const errorMessage = "Error initializing WebMIDI: " + error.name;
        onError(errorMessage);
      }
    )
  }

  
  ///// MIDI settings/state

  getInNames() : string[] {
    return this._midiInPorts.map(port => port.name ?? '');
  }

  getOutNames() : string[] {
    return this._midiOutPorts.map(port => port.name ?? '');
  }


  private getInPort(portName: string) : MIDIInput | undefined {
    return this._midiInPorts.find(port => port.name === portName);
  }

  private getOutPort(portName: string) : MIDIOutput | undefined {
    return this._midiOutPorts.find(port => port.name === portName);
  }


  useMidiIn(portName: string|null) {
    this.closeMidiIn();
    if (portName === null) return;
    let port = this.getInPort(portName);
    if (port) {
      this._midiIn = port;
      this._midiIn.onmidimessage = this.handleMidiIn;
      console.log('Using MIDI in: ' + portName);
    } else {
      console.error('MIDI port not available: ' + portName);
    }
  }

  useControllerIn(portName: string|null) {
    this.closeControllerIn();
    if (portName === null) return;
    let port = this.getInPort(portName);
    if (port) {
      this._controllerIn = port;
      this._controllerIn.onmidimessage = this.handleControllerIn;
      console.log('Using MIDI controller in: ' + portName);
    } else {
      console.error('MIDI port not available: ' + portName);
    }
  }

  useMidiOut(portName: string|null) {
    this.closeMidiOut();
    if (portName === null) return;
    let port = this.getOutPort(portName);
    if (port) {
      this._midiOut = port;
      console.log('Using MIDI out: ' + portName);
    } else {
      console.error('MIDI port not available: ' + portName);
    }
  }


  ///// Cleanup

  shutdown() {
    this.closeMidiIn();
    this.closeControllerIn();
    this.closeMidiOut();
    this._midiInPorts = [];
    this._midiOutPorts = [];
    if (this._midiAccess) {
      this._midiAccess.onstatechange = null;
      this._midiAccess = undefined;
    }
  }

  private closeMidiIn() {
    if (this._midiIn) {
      this._midiIn.onmidimessage = null;
      this._midiIn.close();
      this._midiIn = undefined;
    }
  }

  private closeControllerIn() {
    if (this._controllerIn) {
      this._controllerIn.onmidimessage = null;
      this._controllerIn.close();
      this._controllerIn = undefined;
    }
  }

  private closeMidiOut() {
    if (this._midiOut) {
      this._midiOut.close();
      this._midiOut = undefined;
    }
  }


  ///// MIDI Output

  sendMessage(data: Iterable<number>) {
    if (!this._midiOut) return;
    if (this.verbose)
      console.log('Out: [' + toHexString(data) + ']');
    this._midiOut.send(data);
  }


  ///// MIDI Input handlers

  private handleMidiIn(event: MIDIMessageEvent) : any {
    let data = event.data;
    if (data !== null) {
      if (this.verbose)
        console.log('In: [' + toHexString(data) + ']');
      if (this.onMidiIn)
        this.onMidiIn(data);
    }
  }

  private handleControllerIn(event: MIDIMessageEvent) : any {
    let data = event.data;
    if (data !== null) {
      if (this.verbose)
        console.log('C.In: [' + toHexString(data) + ']');
      if (this.onControllerIn)
        this.onControllerIn(data);
    }
  }


  ///// Diagnostics

  listPortsToConsole() : void {
    this._midiInPorts.forEach(port => console.log(" In: " + port.name));
		this._midiOutPorts.forEach(port => console.log(" Out: " + port.name));
  }

};
