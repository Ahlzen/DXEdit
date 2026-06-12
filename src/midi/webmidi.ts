// Work in progress

export class WebMidi
{
  // Internal state
  
  private _midiAccess?: MIDIAccess; // set when initialized
  private _midiIn?: MIDIInput;
  private _midiOut?: MIDIOutput;
  private _controllerIn? : MIDIInput;
  private _midiInPorts: MIDIInput[] = [];
  private _midiOutPorts: MIDIOutput[] = [];


  // Public events

  onMidiIn?: (data: Uint8Array) => void;
  onControllerIn?: (data: Uint8Array) => void;


  ///// Initialization

  constructor(needSysex: boolean)
  {
    const midiOptions: MIDIOptions = {
      sysex: needSysex
    }
    navigator.requestMIDIAccess(midiOptions).then(
      (access: MIDIAccess) => {
        this._midiAccess = access;
        this.reinitialize();
      },
      (error: any) => {
        console.error("Error initializing WebMIDI: " + error.name);    
      }
    )
  }

  reinitialize() {
    if (!this._midiAccess) console.error('No MIDI access.');
    this._midiInPorts = [];
    this._midiOutPorts = [];
    this._midiAccess?.inputs.forEach((port) => this._midiInPorts.push(port));
    this._midiAccess?.outputs.forEach((port) => this._midiOutPorts.push(port));
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


  useMidiIn(portName: string) {
    this.closeMidiIn();
    let port = this.getInPort(portName);
    if (port) {
      this._midiIn = port;
      this._midiIn.onmidimessage = this.handleMidiIn;
      console.log('Using MIDI in: ' + portName);
    } else {
      console.error('MIDI port not available: ' + portName);
    }
  }

  useControllerIn(portName: string) {
    this.closeControllerIn();
    let port = this.getInPort(portName);
    if (port) {
      this._controllerIn = port;
      this._controllerIn.onmidimessage = this.handleControllerIn;
      console.log('Using MIDI controller in: ' + portName);
    } else {
      console.error('MIDI port not available: ' + portName);
    }
  }

  useMidiOut(portName: string) {
    this.closeMidiOut();
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
    this._midiOut.send(data);
    console.log('Out: [' + this.toHexStrings(data) + ']');
  }


  ///// MIDI Input handlers

  private handleMidiIn(event: MIDIMessageEvent) : any {
    let data = event.data;
    if (data !== null) {
      console.log('In: [' + this.toHexStrings(data) + ']');
      if (this.onMidiIn)
        this.onMidiIn(data);
    }
  }

  private handleControllerIn(event: MIDIMessageEvent) : any {
    let data = event.data;
    if (data !== null) {
      console.log('C.In: [' + this.toHexStrings(data) + ']');
      if (this.onControllerIn)
        this.onControllerIn(data);
    }
  }


  ///// Helpers

  // TODO: Factor out
  private* toHexStrings(data: Iterable<number>) : Iterable<string> {
    for (let n of data)
      yield n.toString(16);
  }

};
