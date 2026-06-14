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
  minValue: number,
  maxValue: number
};

export let performanceParamSpecs:
  {[name in performanceParam]: performanceParamSpec} =
{ 
  'monoMode': {paramNumber: 64, minValue: 0, maxValue: 1},
  'pitchBendRange': {paramNumber: 65, minValue: 0, maxValue: 12},
  'pitchBendStep': {paramNumber: 66, minValue: 0, maxValue: 12},
  'portamentoTime': {paramNumber: 69, minValue: 0, maxValue: 99},
  'portamentoMode': {paramNumber: 67, minValue: 0, maxValue: 1},
  'glissando': {paramNumber: 68, minValue: 0, maxValue: 1},
  'modWheelRange': {paramNumber: 70, minValue: 0, maxValue: 99},
  'modWheelAssign': {paramNumber: 71, minValue: 0, maxValue: 7},
  'aftertouchRange': {paramNumber: 76, minValue: 0, maxValue: 99},
  'aftertouchAssign': {paramNumber: 77, minValue: 0, maxValue: 7},
  'footControlRange': {paramNumber: 72, minValue: 0, maxValue: 99},
  'footControlAssign': {paramNumber: 73, minValue: 0, maxValue: 7},
  'breathControlRange': {paramNumber: 74, minValue: 0, maxValue: 99},
  'breathControlAssign': {paramNumber: 75, minValue: 0, maxValue: 7}
};
