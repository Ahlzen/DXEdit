'use strict';

import { toHexStrings } from '../util';

// Constants
const NO_MIDI_PORT_VALUE = "None";

let midi = (function() {
	var my = {};

	// WebMIDI objects
	var m = null;
	var midiIn = null;
	var midiOut = null;
	var controllerIn = null;
	var midiInPorts = [];
	var midiOutPorts = [];

	// MIDI settings
	var channel = 0;
	var midiEcho = false;

	// Sysex event handler
	my.onSysex = null;


	///// Initialization

	my.initialize = function(onSuccess, onFail) {
		if (! navigator.requestMIDIAccess) {
			throw new Error("WebMIDI is not supported with this browser/device.");
		}
		console.log("WebMIDI supported.");

		var options = {sysex: true}; // we need sysex access
		navigator.requestMIDIAccess(options).then(
			function(midiAccess) {
				m = midiAccess;
				midiInPorts = [];
				midiOutPorts = [];
				midiAccess.inputs.forEach(port => midiInPorts.push(port));
				midiAccess.outputs.forEach(port => midiOutPorts.push(port));
				console.log("WebMIDI initialized.");
				if (onSuccess) onSuccess();
			},
			function(error) {
				console.log("Error initializing WebMIDI: " + error.name);
				if (onFail) onFail();
			}
		);
	};


	///// MIDI settings/state

	my.useMidiIn = function(portName) {
		closeMidiIn();
		var port = my.getInPort(portName);
		if (port) {
			midiIn = port;
			midiIn.onmidimessage = message => onMessage(this, message);
			console.log("Using MIDI in: " + portName);
		}
		else console.log("MIDI port not available");
	};

	my.useMidiOut = function(portName) {
		closeMidiOut();
		var port = my.getOutPort(portName);
		if (port) {
			midiOut = port;
			console.log("Using MIDI out: " + portName);
		}
		else console.log("MIDI port not available");
	};

	my.useControllerIn = function(portName) {
		closeControllerIn();
		var port = my.getInPort(portName);
		if (port) {
			controllerIn = port;
			controllerIn.onmidimessage = message => onMessage(this, message);
			console.log("Using MIDI controller in: " + portName);
		}
		else console.log("MIDI port not available");
	};


	///// Cleanup

	my.shutdown = function() {
		closeMidiIn();
		closeControllerIn();
		closeMidiOut();
		midiInPorts = [];
		midiOutPorts = [];
		if (m) {
			m.onstatechange = null;
			m = null;
		}		
	}
	
	let closeMidiIn = function() {
		if (midiIn) {
			midiIn.onmidimessage = null;
			midiIn.close();
			midiIn = null;
		}
	}

	let closeControllerIn = function() {
		if (controllerIn) {
			controllerIn.onmidimessage = null;
			controllerIn.close();
			controllerIn = null;
		}
	}

	let closeMidiOut = function() {
		if (midiOut) {
			midiOut.close();
			midiOut = null;
		}
	}


	///// Utility functions

	my.getInNames = () =>
		midiInPorts.map(port => port.name);

	my.getOutNames = () =>
		midiOutPorts.map(port => port.name);

	my.getInPort = (portName) =>
		midiInPorts.find(port => port.name === portName);

	my.getOutPort = (portName) =>
		midiOutPorts.find(port => port.name === portName);

	my.listPorts = function() {
		midiInPorts.forEach(port => console.log("In: " + port.name));
		midiOutPorts.forEach(port => console.log("Out: " + port.name));
	};


	///// MIDI out

	my.sendMessage = function(bytes) {
		console.log('Sent: [' + toHexStrings(bytes) + ']');
		if (!midiOut) return;
		midiOut.send(bytes);
	};

	// my.sendProgramChange = function(program) {
	// 	my.sendMessage([0xc0+channel, program]);
	// };

	// my.sendBankChange = function(bankMsb, bankLsb) {
	// 	my.sendMessage([0xb0+channel, 0x00, bankMsb]);
	// 	my.sendMessage([0xb0+channel, 0x20, bankLsb]);
	// };

	// my.sendProgramBankChange = function(program, bankMsb, bankLsb) {
	// 	// Special case: For banks with more than 128 programs,
	// 	// increment the bank LSB and subtract 128 from program #:
	// 	if (program > 127) {
	// 		program -= 127;
	// 		bankLsb++;
	// 	}
	// 	my.sendProgramChange(program);
	// 	my.sendBankChange(bankMsb, bankLsb);
	// };

	// my.sendAllNotesOff = function() {
	// 	for (var chan = 0; chan < 16; chan++) {
	// 		my.sendMessage([0xb0+chan, 123, 0]);
	// 	}
	// };


	///// MIDI input handler

	function onMessage(midi, event) {
		console.log('Received: [' + toHexStrings(event.data) + ']');
		if (event.data[0] == 0xf0) {
			if (my.onSysex) {
				my.onSysex(event.data);
			}
		}
		// TODO: Echo only MIDI events from controller input
		else if (midiOut) {
			// Echo message
			my.sendMessage(event.data);
		}
	}


	return my;
})();

export default midi;