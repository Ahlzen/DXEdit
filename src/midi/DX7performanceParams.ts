export type performanceControl =
  'modWheel' |
  'footControl' |
  'breathControl' |
  'aftertouch';

export type DX7performanceParams = {
  monoMode:             number, // 0=poly, 1=mono

  pitchBendRange:       number, // 0..12
  pitchBendStep:        number, // 0..12

  portamentoTime:       number, // 0-99
  portamentoMode:       number, // 0=retain, 1=follow
  glissando:            number, // 0 (disabled), 1 (enabled)

  modWheelRange:        number, // 0-99
  modWheelAssign:       number, // 0-7: 1=pitch, 2=amp, 4=EG bias

  aftertouchRange:      number, // 0-99
  aftertouchAssign:     number, // 0-7: 1=pitch, 2=amp, 4=EG bias

  footControlRange:     number, // 0-99
  footControlAssign:    number, // 0-7: 1=pitch, 2=amp, 4=EG bias

  breathControlRange:   number, // 0-99
  breathControlAssign:  number, // 0-7: 1=pitch, 2=amp, 4=EG bias
};
