export type performanceParam =
  'monoMode' |
  'pitchBendRange' |
  'pitchBendStep' |
  'portamentoTime' |
  'portamentoMode' |
  'glissando' |
  'modWheelRange' |
  'modWheelAssign' |
  'aftertouchRange' |
  'aftertouchAssign' |
  'footControlRange' |
  'footControlAssign' |
  'breathControlRange' |
  'breathControlAssign';

export type performanceValues = {
  [name in performanceParam]: number
};


export type performanceParamSpec = {
  paramNumber: number,
  maxValue: number
};

export let performanceParamSpecs:
  {[name in performanceParam]: performanceParamSpec} =
{ 
  'monoMode': {paramNumber: 64, maxValue: 1},
  'pitchBendRange': {paramNumber: 65, maxValue: 12},
  'pitchBendStep': {paramNumber: 66, maxValue: 12},
  'portamentoTime': {paramNumber: 69, maxValue: 99},
  'portamentoMode': {paramNumber: 67, maxValue: 1},
  'glissando': {paramNumber: 68, maxValue: 1},
  'modWheelRange': {paramNumber: 70, maxValue: 99},
  'modWheelAssign': {paramNumber: 71, maxValue: 7},
  'aftertouchRange': {paramNumber: 76, maxValue: 99},
  'aftertouchAssign': {paramNumber: 77, maxValue: 7},
  'footControlRange': {paramNumber: 72, maxValue: 99},
  'footControlAssign': {paramNumber: 73, maxValue: 7},
  'breathControlRange': {paramNumber: 74, maxValue: 99},
  'breathControlAssign': {paramNumber: 75, maxValue: 7}
};
