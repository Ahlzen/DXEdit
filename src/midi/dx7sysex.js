'use strict';

// NOTE: Not currently in use. From a different project of mine.
// Included for reference.

dxtool.sysex = (function() {
  var my = {};

  var assert = console.assert; // for now...
  var log = console.log; // for now...

  // Constants
  const START_OF_SYSEX = 0xf0;
  const END_OF_SYSEX = 0xf7;
  const MANUFACTURER_YAMAHA = 0x43;
  const FORMAT_SINGLE_VOICE = 0x00;
  const FORMAT_32_VOICE = 0x09;


  // Parse sysex data bytes and return sysex object
  //  data: Uint8Array (or Buffer)
  //  Throws Error if invalid data.
  my.parse = function(data) {
    data = Uint8Array.from(data); // make sure it's UInt8Array
    let sysex = {
      voices: []
    };
    if (data.length < 155) throw new Error('Too little data for a sysex');
    if (data[0] != START_OF_SYSEX) throw new Error('Start-of-sysex byte not found');
    if (data[1] != MANUFACTURER_YAMAHA) throw new Error('Manufacturer not Yamaha');
    if (data[2] != 0x00) throw new Error('Unexpected substatus/channel byte');
    switch (data[3]) {

      case FORMAT_SINGLE_VOICE:
        console.log('single voice');
        if (data.length != (6+155+2)) throw new Error(
          'Data length mismatch: ' + data.length);
        //let voiceDataLength = (data[4] & 0x7f) << 7 + (data[5] & 0x7f);
        let voiceDataLength = 0;
        voiceDataLength = data[4];
        voiceDataLength <<=7;
        voiceDataLength += data[5];

        if (voiceDataLength != 155) throw new Error(
          'Voice data length mismatch: ' + voiceDataLength);
        let voiceData = data.slice(6, 6+voiceDataLength);
        let voice = parseSingleVoice(voiceData);
        sysex.voices.push(voice);
        sysex.format = 'SINGLE_VOICE';
        break;

      case FORMAT_32_VOICE:
        console.log('32 voice');
        if (data.length != (6+4096+2)) throw new Error(
          'Data length mismatch: ' + dataLength);
        let packedVoiceDataLength = (data[4] & 0x7f) << 7 + (data[5] & 0x7f);
        if (packedVoiceDataLength != 4096) throw new Error(
          'Voice data length mismatch: ' + packedVoiceDataLength);
        //sysex.voices = [];
        _.range(32).forEach(function(v) {
          let offset = 6 + 128*v;
          let voiceData = data.slice(offset, offset+128);
          let voice = parsePackedVoice(voiceData);
          sysex.voices.push(voice);
        });
        sysex.format = '32_VOICE';
        break;

      default:
        throw new Error("Unsupported sysex type: " + data[3]);
    }

    // verify checksum
    let checkedBytes = data.slice(6, data.length-2);
    let expectedChecksum = my.computeChecksum(checkedBytes);
    let actualChecksum = data[data.length-2] & 0x7f;
    if (expectedChecksum != actualChecksum)
      throw new Error('Checksum mismatch ' + expectedChecksum
        + ', ' + actualChecksum);

    if (data[data.length-1] != END_OF_SYSEX)
      throw new Error('End-of-sysex byte not found');

    return sysex;
  };


  // Builds a buffer of binary sysex data (UInt8Array)
  // based from the specified sysex type.
  my.toData = function(sysex) {
    switch (sysex.format) {
      case 'SINGLE_VOICE':
        assert(sysex.voices.length == 1);
        return formatSingleVoice(sysex.voices[0]);
      case '32_VOICE':
        return format32Voice(sysex);
      default:
        throw new Error("Unsupported sysex type: " + sysex.type);
    }
  };

  // Formats a raw SysEx buffer for a single voice (whether
  // it's part of a single voice sysex or a full 32_VOICE
  // bulk dump)
  my.toSingleVoiceData = function(voice) {
    return formatSingleVoice(voice);
  };


  // Formatting and parsing

  function format32Voice(sysex) {
    let data = new Uint8Array(6+4096+2);
    data[0] = START_OF_SYSEX;
    data[1] = MANUFACTURER_YAMAHA;
    data[2] = 0x00;
    data[3] = FORMAT_32_VOICE;
    data[4] = 0x20; // data...
    data[5] = 0x00; // ...length
    _.range(32).forEach(function(n){
      let offset = 6 + n*128;
      let voiceData = new Uint8Array(data.buffer, offset, 128);
      formatPackedVoice(sysex.voices[n], voiceData);
    });
    let checkedBytes = data.slice(6, data.length-2);
    data[data.length-2] = my.computeChecksum(checkedBytes);
    data[data.length-1] = END_OF_SYSEX;
    return data;
  }


  function parseSingleVoice(data) {
    assert(data.length === 155)
    let voice = {};
    _.range(1,7).forEach(function(o) {
      let offset = 21*(6-o); // oscs are ordered 6..1
      let oscData = data.slice(offset, offset+21);
      voice['osc'+o] = parseSingleOsc(oscData);
    });
    let commonData = data.slice(126, 155);
    voice.common = parseSingleCommon(commonData);
    return voice;
  };

  function formatSingleVoice(voice) {
    let data = new Uint8Array(6+155+2);
    data[0] = START_OF_SYSEX;
    data[1] = MANUFACTURER_YAMAHA;
    data[2] = 0x00;
    data[3] = FORMAT_SINGLE_VOICE;
    data[4] = 0x01; // data...
    data[5] = 0x1b; // ...length
    let voiceData = new Uint8Array(data.buffer, 6, 155);
    _.range(1,7).forEach(function(o) {
      let offset = 21 * (6-o);
      let oscData = new Uint8Array(voiceData.buffer, voiceData.byteOffset + offset, 21);
      formatSingleOsc(voice['osc'+o], oscData);
    });
    let commonData = new Uint8Array(voiceData.buffer, voiceData.byteOffset + 126, 29);
    formatSingleCommon(voice.common, commonData);
    let checkedBytes = data.slice(6, data.length-2);
    data[data.length-2] = my.computeChecksum(checkedBytes);
    data[data.length-1] = END_OF_SYSEX;
    return data;
  }

  function parsePackedVoice(data) {
    assert(data.length === 128);
    let voice = {};
    _.range(1,7).forEach(function(o) {
      let offset = 17*(6-o); // oscs are ordered 6..1
      let oscData = data.slice(offset, offset+17);
      voice['osc'+o] = parsePackedOsc(oscData);
    });
    let commonData = data.slice(102, 128);
    voice.common = parsePackedCommon(commonData);
    return voice;
  };

  function formatPackedVoice(voice, data) {
    assert(data.length === 128);
    _.range(1,7).forEach(function(o) {
      let offset = 17*(6-o);
      let oscData = new Uint8Array(data.buffer, data.byteOffset + offset, 17);
      formatPackedOsc(voice['osc'+o], oscData);
    });
    let commonData = new Uint8Array(data.buffer, data.byteOffset + 102, 26);
    formatPackedCommon(voice.common, commonData);
  }

  // TEST CODE
  function parseSingleOsc(data) {
    assert(data.length === 21);
    let osc = {};
    let parser = new ParamParser(osc, data);
    parser.parse(0, 'egR1', 0, 99);
    parser.parse(1, 'egR2', 0, 99);
    parser.parse(2, 'egR3', 0, 99);
    parser.parse(3, 'egR4', 0, 99);
    parser.parse(4, 'egL1', 0, 99);
    parser.parse(5, 'egL2', 0, 99);
    parser.parse(6, 'egL3', 0, 99);
    parser.parse(7, 'egL4', 0, 99);
    parser.parse(8, 'levSclBrkPt', 0, 99);
    parser.parse(9, 'sclLeftDepth', 0, 99);
    parser.parse(10, 'sclRightDepth', 0, 99);
    parser.parse(11, 'sclLeftCurve', 0, 3);
    parser.parse(12, 'sclRightCurve', 0, 3);
    parser.parse(13, 'oscRateScale', 0, 7);
    parser.parse(14, 'ampModSens', 0, 3);
    parser.parse(15, 'keyVelSens', 0, 7);
    parser.parse(16, 'outputLev', 0, 99);
    parser.parse(17, 'oscMode', 0, 1);
    parser.parse(18, 'freqCoarse', 0, 31);
    parser.parse(19, 'freqFine', 0, 99);
    parser.parse(20, 'oscDetune', 0, 14);
    return osc;
  }

  // TEST CODE
  // function parseParam(dest, data, offset, name, min, max, bitCount = 7, bitOffset = 0)
  // {
  //   let mask = (1 << bitCount) - 1;
  //   let value = (data[offset] >> bitOffset) & mask;
  //   if (value < min) throw new Error(
  //     'Parsing ' + name + ': Value ' + value + ' is too small.');
  //   if (value > max) throw new Error(
  //     'Parsing ' + name + ': Value ' + value + ' is too large.');
  //   dest[name] = value;
  // }
  function ParamParser(dest, data) {
    assert(dest);
    assert(data);
    this.dest = dest;
    this.data = data;
  }
  ParamParser.prototype.parse = function(
    offset, name, min, max, bitCount = 7, bitOffset = 0)
  {
    let mask = (1 << bitCount) - 1;
    let value = (this.data[offset] >> bitOffset) & mask;
    if (value < min) throw new Error(
      'Parsing ' + name + ': Value ' + value + ' is too small.');
    if (value > max) throw new Error(
      'Parsing ' + name + ': Value ' + value + ' is too large.');
    this.dest[name] = value;
  }
  ParamParser.prototype.parseString = function(
    offset, length, name)
  {
    var str = '';
    for (var i = 0; i < length; i++) {
      let val = this.data[offset+i];
      if (val < 0x20 || val > 126) val = 0x20; // ascii
      str += String.fromCharCode(val);
    }
    this.dest[name] = str;
  }
  function ParamFormatter(src, data) {
    assert(src);
    assert(data);
    this.src = src;
    this.data = data;
  }
  ParamFormatter.prototype.format = function(
    offset, name, min, max, bitCount = 7, bitOffset = 0)
  {
    let srcMask = (1 << bitCount) - 1;
    let dstMask = 0xFF - (srcMask << bitOffset);
    let value = this.src[name];
    if (value < min) throw new Error(
      'Parsing ' + name + ': Value ' + value + ' is too small.');
    if (value > max) throw new Error(
      'Parsing ' + name + ': Value ' + value + ' is too large.');
    value = (this.src[name] << bitOffset) & srcMask;
    this.data[offset] &= dstMask;
    this.data[offset] |= value;
  }
  ParamFormatter.prototype.formatString = function(
    offset, length, name)
  {
    for (var i = 0; i < length; i++) {
      let val = 0x20;
      if (i < this.src[name].length) {
        val = this.src[name].charCodeAt(i);
      }
      if (val < 0x20 || val > 126) val = 0x20; // ascii
      this.data[offset+i] = val;
    }
  }


  function parsePackedOsc(data) {
    assert(data.length === 17);
    let osc = {};
    osc.egR1 = data[0] & 0x7f;
    osc.egR2 = data[1] & 0x7f;
    osc.egR3 = data[2] & 0x7f;
    osc.egR4 = data[3] & 0x7f;
    osc.egL1 = data[4] & 0x7f;
    osc.egL2 = data[5] & 0x7f;
    osc.egL3 = data[6] & 0x7f;
    osc.egL4 = data[7] & 0x7f;
    osc.levSclBrkPt = data[8] & 0x7f;
    osc.sclLeftDepth = data[9] & 0x7f;
    osc.sclRightDepth = data[10] & 0x7f;
    osc.sclLeftCurve = (data[11] & 0x0c) >> 2;
    osc.sclRightCurve = data[11] & 0x03;
    osc.oscDetune = (data[12] >> 3) & 0x0f;
    osc.oscRateScale = data[12] & 0x07;
    osc.keyVelSens = (data[13] & 0x1c) >> 2;
    osc.ampModSens = data[13] & 0x03;
    osc.outputLev = data[14] & 0x7f;
    osc.freqCoarse = (data[15] & 0x7e) >> 1;
    osc.oscMode = data[15] & 0x01;
    osc.freqFine = data[16] & 0x7f;
    return osc;
  };

  function formatPackedOsc(osc, data) {
    assert(data.length === 17);
    data[0] = osc.egR1 & 0x7f;
    data[1] = osc.egR2 & 0x7f;
    data[2] = osc.egR3 & 0x7f;
    data[3] = osc.egR4 & 0x7f;
    data[4] = osc.egL1 & 0x7f;
    data[5] = osc.egL2 & 0x7f;
    data[6] = osc.egL3 & 0x7f;
    data[7] = osc.egL4 & 0x7f;
    data[8] = osc.levSclBrkPt & 0x7f;
    data[9] = osc.sclLeftDepth & 0x7f;
    data[10] = osc.sclRightDepth & 0x7f;
    data[11] = (osc.sclLeftCurve & 0x03) << 2;
    data[11] += osc.sclRightCurve & 0x03;
    data[12] = (osc.oscDetune & 0x0f) << 3;
    data[12] += osc.oscRateScale & 0x07;
    data[13] = (osc.keyVelSens & 0x07) << 2;
    data[13] += osc.ampModSens & 0x03;
    data[14] = osc.outputLev & 0x7f;
    data[15] = (osc.freqCoarse & 0x1f) << 1;
    data[15] += osc.oscMode & 0x01;
    data[16] = osc.freqFine & 0x7f;
  }


  function parseSingleOsc(data) {
    assert(data.length == 21);
    let osc = {};
    let parser = new ParamParser(osc, data);
    parser.parse(0, 'egR1', 0, 99);
    parser.parse(1, 'egR2', 0, 99);
    parser.parse(2, 'egR3', 0, 99);
    parser.parse(3, 'egR4', 0, 99);
    parser.parse(4, 'egL1', 0, 99);
    parser.parse(5, 'egL2', 0, 99);
    parser.parse(6, 'egL3', 0, 99);
    parser.parse(7, 'egL4', 0, 99);
    parser.parse(8, 'levSclBrkPt', 0, 99);
    parser.parse(9, 'sclLeftDepth', 0, 99);
    parser.parse(10, 'sclRightDepth', 0, 99);
    parser.parse(11, 'sclLeftCurve', 0, 3);
    parser.parse(12, 'sclRightCurve', 0, 3);
    parser.parse(13, 'oscRateScale', 0, 7);
    parser.parse(14, 'ampModSens', 0, 3);
    parser.parse(15, 'keyVelSens', 0, 7);
    parser.parse(16, 'outputLev', 0, 99);
    parser.parse(17, 'oscMode', 0, 1);
    parser.parse(18, 'freqCoarse', 0, 31);
    parser.parse(19, 'freqFine', 0, 99);
    parser.parse(20, 'oscDetune', 0, 14);
    return osc;
  }

  function formatSingleOsc(osc, data) {
    assert(osc);
    assert(data.length == 21);
    var formatter = new ParamFormatter(osc, data);
    formatter.format(0, 'egR1', 0, 99);
    formatter.format(1, 'egR2', 0, 99);
    formatter.format(2, 'egR3', 0, 99);
    formatter.format(3, 'egR4', 0, 99);
    formatter.format(4, 'egL1', 0, 99);
    formatter.format(5, 'egL2', 0, 99);
    formatter.format(6, 'egL3', 0, 99);
    formatter.format(7, 'egL4', 0, 99);
    formatter.format(8, 'levSclBrkPt', 0, 99);
    formatter.format(9, 'sclLeftDepth', 0, 99);
    formatter.format(10, 'sclRightDepth', 0, 99);
    formatter.format(11, 'sclLeftCurve', 0, 3);
    formatter.format(12, 'sclRightCurve', 0, 3);
    formatter.format(13, 'oscRateScale', 0, 7);
    formatter.format(14, 'ampModSens', 0, 3);
    formatter.format(15, 'keyVelSens', 0, 7);
    formatter.format(16, 'outputLev', 0, 99);
    formatter.format(17, 'oscMode', 0, 1);
    formatter.format(18, 'freqCoarse', 0, 31);
    formatter.format(19, 'freqFine', 0, 99);
    formatter.format(20, 'oscDetune', 0, 14);
  }


  function parsePackedCommon(data) {
    assert(data.length === 26);
    let common = {};
    common.pitchEgR1 = data[0] & 0x7f;
    common.pitchEgR2 = data[1] & 0x7f;
    common.pitchEgR3 = data[2] & 0x7f;
    common.pitchEgR4 = data[3] & 0x7f;
    common.pitchEgL1 = data[4] & 0x7f;
    common.pitchEgL2 = data[5] & 0x7f;
    common.pitchEgL3 = data[6] & 0x7f;
    common.pitchEgL4 = data[7] & 0x7f;
    common.algorithm = data[8] & 0x1f;
    common.feedback = data[9] & 0x07;
    common.oscKeySync = (data[9] & 0x08) >> 3;
    common.lfoSpeed = data[10] & 0x7f;
    common.lfoDelay = data[11] & 0x7f;
    common.lfPtModDepth = data[12] & 0x7f;
    common.lfAmModDepth = data[13] & 0x7f;
    common.sync = data[14] & 0x01;
    common.wave = (data[14] & 0x0e) >> 1;
    common.lfPtModSns = (data[14] & 0x70) >> 4;
    common.transpose = data[15] & 0x7f;
    let stringData = data.slice(16, 26);
    common.name = String.fromCharCode.apply(null, stringData);
    return common;
  };

  function formatPackedCommon(common, data) {
    assert(data.length === 26);
    data[0] = common.pitchEgR1 & 0x7f;
    data[1] = common.pitchEgR2 & 0x7f;
    data[2] = common.pitchEgR3 & 0x7f;
    data[3] = common.pitchEgR4 & 0x7f;
    data[4] = common.pitchEgL1 & 0x7f;
    data[5] = common.pitchEgL2 & 0x7f;
    data[6] = common.pitchEgL3 & 0x7f;
    data[7] = common.pitchEgL4 & 0x7f;
    data[8] = common.algorithm & 0x1f;
    data[9] = (common.oscKeySync & 0x01) << 3;
    data[9] += common.feedback & 0x07;
    data[10] = common.lfoSpeed & 0x7f;
    data[11] = common.lfoDelay & 0x7f;
    data[12] = common.lfPtModDepth & 0x7f;
    data[13] = common.lfAmModDepth & 0x7f;
    data[14] = (common.lfPtModSns & 0x07) << 4;
    data[14] += (common.wave & 0x07) << 1;
    data[14] += common.sync & 0x01;
    data[15] += common.transpose & 0x7f;
    let toneName = String("          " + common.name).slice(-10);
    for (var i=0; i<10; i++) {
      // TODO: Check ASCII!!
      data[16+i] = toneName.charCodeAt(i);
    }
  }


  function parseSingleCommon(data) {
    assert(data.length === 29)
    let common = {};
    let parser = new ParamParser(common, data);
    parser.parse(0, 'pitchEgR1', 0, 99);
    parser.parse(1, 'pitchEgR2', 0, 99);
    parser.parse(2, 'pitchEgR3', 0, 99);
    parser.parse(3, 'pitchEgR4', 0, 99);
    parser.parse(4, 'pitchEgL1', 0, 99);
    parser.parse(5, 'pitchEgL2', 0, 99);
    parser.parse(6, 'pitchEgL3', 0, 99);
    parser.parse(7, 'pitchEgL4', 0, 99);
    parser.parse(8, 'algorithm', 0, 31);
    parser.parse(9, 'feedback', 0, 7);
    parser.parse(10, 'oscKeySync', 0, 1);
    parser.parse(11, 'lfoSpeed', 0, 99);
    parser.parse(12, 'lfoDelay', 0, 99);
    parser.parse(13, 'lfPtModDepth', 0, 99);
    parser.parse(14, 'lfAmModDepth', 0, 99);
    parser.parse(15, 'sync', 0, 1);
    parser.parse(16, 'wave', 0, 5);
    parser.parse(17, 'lfPtModSns', 0, 7);
    parser.parse(18, 'transpose', 0, 48);
    parser.parseString(19, 10, 'name');
    return common;
  };

  function formatSingleCommon(common, data) {
    assert(data.length === 29);
    let formatter = new ParamFormatter(common, data);
    formatter.format(0, 'pitchEgR1', 0, 99);
    formatter.format(1, 'pitchEgR2', 0, 99);
    formatter.format(2, 'pitchEgR3', 0, 99);
    formatter.format(3, 'pitchEgR4', 0, 99);
    formatter.format(4, 'pitchEgL1', 0, 99);
    formatter.format(5, 'pitchEgL2', 0, 99);
    formatter.format(6, 'pitchEgL3', 0, 99);
    formatter.format(7, 'pitchEgL4', 0, 99);
    formatter.format(8, 'algorithm', 0, 31);
    formatter.format(9, 'feedback', 0, 7);
    formatter.format(10, 'oscKeySync', 0, 1);
    formatter.format(11, 'lfoSpeed', 0, 99);
    formatter.format(12, 'lfoDelay', 0, 99);
    formatter.format(13, 'lfPtModDepth', 0, 99);
    formatter.format(14, 'lfAmModDepth', 0, 99);
    formatter.format(15, 'sync', 0, 1);
    formatter.format(16, 'wave', 0, 5);
    formatter.format(17, 'lfPtModSns', 0, 7);
    formatter.format(18, 'transpose', 0, 48);
    formatter.formatString(19, 10, 'name');
  }


  my.computeChecksum = function(data) {
    // NOTE: checksum is for data bytes only (no header and footer)
    let sum = _.reduce(data, function(s,n){return s+n}, 0);
    sum &= 0x7f;
    let checksum = (128 - sum) & 0x7f; // low 7 bits of 2s complement
    return checksum;
  }

  return my;
})();
