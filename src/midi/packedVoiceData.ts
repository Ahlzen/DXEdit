import { voiceParamDataLength, packedVoiceParamDataLength } from "./VoiceData";

// Functions for packing and unpacking data to fit the normal
// 155 bytes of voice data into the 128 bytes of a 32-voice
// bank sysex format.

// See: Yamaha DX7 Sysex Format.txt


///// Unpacking

function unpack(
  src: Uint8Array,
  srcOffset: number,
  srcStartBit: number,
  srcBitCount: number,
  dst: Uint8Array,
  dstOffset: number)
{
  let value = src[srcOffset] >> srcStartBit;
  const mask = (1 << srcBitCount) -1;
  value = value & mask;
  dst[dstOffset] = value;
}

function unpackOpData(src: Uint8Array, opNumber: number /* 1-6 */) : Uint8Array {
  // src: 128 bytes
  // dst: 21 bytes
  const dst = new Uint8Array(21);
  const srcOffset = (6-opNumber)*17;

  dst.set(src.slice(srcOffset, srcOffset+11), 0); // first 11 bytes are identical
  unpack(src, srcOffset+11, 0, 2, dst, 11); // kbd scale left curve
  unpack(src, srcOffset+11, 2, 2, dst, 12); // kbd scale right curve
  unpack(src, srcOffset+12, 0, 3, dst, 13); // kbd rate scale
  unpack(src, srcOffset+12, 3, 4, dst, 20); // osc detune
  unpack(src, srcOffset+13, 0, 2, dst, 14); // amp mod sens
  unpack(src, srcOffset+13, 2, 3, dst, 15); // key vel sens
  unpack(src, srcOffset+14, 0, 7, dst, 16); // osc output level
  unpack(src, srcOffset+15, 0, 1, dst, 17); // osc mode
  unpack(src, srcOffset+15, 1, 5, dst, 18); // osc freq coarse
  unpack(src, srcOffset+16, 0, 7, dst, 19); // osc freq fine
  return dst;
}

export function unpackVoiceData(src: Uint8Array) : Uint8Array {
  // packed (src): 128 bytes
  // unpacked (dst): 155 bytes
  if (src.length != packedVoiceParamDataLength)
    throw new Error("Unpack voice data: Source data is not the expected length.")
  const dst = new Uint8Array(voiceParamDataLength);

  // OP1-6
  for (let op = 1; op <= 6; op++) {
    const dstOffset = (6-op)*21;
    dst.set(unpackOpData(src, op), dstOffset);
  }
  dst.set(src.slice(102, 110), 126);
  unpack(src, 110, 0, 5, dst, 134); // algorithm
  unpack(src, 111, 0, 3, dst, 135); // feedback
  unpack(src, 111, 3, 1, dst, 136); // osc sync
  unpack(src, 112, 0, 7, dst, 137); // lfo speed
  unpack(src, 113, 0, 7, dst, 138); // lfo delay
  unpack(src, 114, 0, 7, dst, 139); // lfo pitch mod depth
  unpack(src, 115, 0, 7, dst, 140); // lfo amp mod depth
  unpack(src, 116, 0, 1, dst, 141); // lfo sync
  unpack(src, 116, 1, 3, dst, 142); // lfo wave
  unpack(src, 116, 4, 3, dst, 143); // pitch mod sens
  unpack(src, 117, 0, 7, dst, 144); // transpose
  dst.set(src.slice(118, 128), 145); 
  return dst;
}


///// Packing

function pack(
  src: Uint8Array,
  srcOffset: number,
  dst: Uint8Array,
  dstOffset: number,
  dstStartBit: number)
{
  // Inserts the packed bits from source value into
  // the destination.
  // NOTE: Does NOT perform any range checks.
  // NOTE: Does NOT clear existing data. Assumes that
  // affected bits are zero prior.
  let value: number = src[srcOffset];
  value <<= dstStartBit;
  dst[dstOffset] |= value;
}


function packOpData(src: Uint8Array, opNumber: number /* 1-6 */) : Uint8Array {
  // src: 155 bytes
  // dst: 17 bytes
  const dst = new Uint8Array(17);
  const srcOffset = (6-opNumber)*21;
  dst.set(src.slice(srcOffset, srcOffset+11), 0); // first 11 bytes are identical
  pack(src, srcOffset+11, dst, 11, 0); // kbd lev scl left curve
  pack(src, srcOffset+12, dst, 11, 2); // kbd lev scl right curve
  pack(src, srcOffset+13, dst, 12, 0); // kbd rate scaling
  pack(src, srcOffset+14, dst, 13, 0); // amp mod sens
  pack(src, srcOffset+15, dst, 13, 2); // key vel sens
  pack(src, srcOffset+16, dst, 14, 0); // op output level
  pack(src, srcOffset+17, dst, 15, 0); // osc mode
  pack(src, srcOffset+18, dst, 15, 1); // osc freq coarse
  pack(src, srcOffset+19, dst, 16, 0); // osc freq fine
  pack(src, srcOffset+20, dst, 12, 3); // osc detune
  return dst;
}

export function packVoiceData(src: Uint8Array) : Uint8Array {
  // src: 155 bytes
  // dst: 128 bytes
  if (src.length != voiceParamDataLength)
    throw new Error("Pack voice data: Source data is not the expected length.")
  const dst = new Uint8Array(packedVoiceParamDataLength);

  // OP1-6
  for (let op = 1; op <= 6; op++) {
    const dstOffset = (6-op)*17;
    dst.set(packOpData(src, op), dstOffset);
  }
  dst.set(src.slice(126, 134), 102); // Pitch EG
  pack(src, 134, dst, 110, 0); // algorithm
  pack(src, 135, dst, 111, 0); // feedback
  pack(src, 136, dst, 111, 3); // osc sync
  pack(src, 137, dst, 112, 0); // lfo speed
  pack(src, 138, dst, 113, 0); // lfo delay
  pack(src, 139, dst, 114, 0); // lfo pt mod dep
  pack(src, 140, dst, 115, 0); // lfo am mod dep
  pack(src, 141, dst, 116, 0); // lfo sync 
  pack(src, 142, dst, 116, 1); // lfo wave
  pack(src, 143, dst, 116, 4); // pitch mod sens
  pack(src, 144, dst, 117, 0); // transpose
  dst.set(src.slice(145,155), 118); // voice name (10 bytes)
  return dst;
} 