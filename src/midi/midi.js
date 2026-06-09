'use strict';

import { toHexStrings } from '../util';

// Constants
const NO_MIDI_PORT_VALUE = "None";

let midi = (function() {
	var my = {};

	// Constants
	my.START_OF_SYSEX = 0xF0;
	my.END_OF_SYSEX = 0xF7;
	my.YAMAHA_MANUFACTURER_ID = 0x43;
	my.SUB_STATUS_BULK = 0x00;
	my.SUB_STATUS_PARAMETER = 0x10; // 0x01 << 4
	my.BULK_FORMAT_SINGLE_VOICE = 0x00;
	my.BULK_FORMAT_32VOICES = 0x09;
	my.PARAMETER_GROUP_VOICE = 0x00;
	my.PARAMETER_GROUP_FUNCTION = 0x08; // 0x02 << 2
	

	// WebMIDI objects
	var m = null;
	var midiIn = null;
	var midiOut = null;
	var controllerIn = null;
	var midiInPorts = [];
	var midiOutPorts = [];

	// MIDI input event handlers
	my.onMidiIn = null;
	my.onControllerIn = null;


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
			midiIn.onmidimessage = message => handleMidiIn(this, message);
			console.log("Using MIDI in: " + portName);
		}
		else console.log("MIDI port not available");
	};

	my.useControllerIn = function(portName) {
		closeControllerIn();
		var port = my.getInPort(portName);
		if (port) {
			controllerIn = port;
			controllerIn.onmidimessage = message => handleControllerIn(this, message);
			console.log("Using MIDI controller in: " + portName);
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


	///// MIDI input handlers

	function handleMidiIn(midi, event) {
		console.log('In: [' + toHexStrings(event.data) + ']');
		if (my.onMidiIn) {
			my.onMidiIn(event.data);
		}
	}

	function handleControllerIn(midi, event) {
		console.log('C.In: [' + toHexStrings(event.data) + ']');
		if (my.onControllerIn) {
			my.onControllerIn(event.data);
		}
	}

	return my;
})();

export default midi;