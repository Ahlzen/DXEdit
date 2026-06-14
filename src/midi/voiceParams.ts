export type voiceParam = 
  'OP6 EG Rate 1' |
  'OP6 EG Rate 2' |
  'OP6 EG Rate 3' |
  'OP6 EG Rate 4' |
  'OP6 EG Level 1' |
  'OP6 EG Level 2' |
  'OP6 EG Level 3' |
  'OP6 EG Level 4' |
  'Feeback' |
  'Oscillator Sync';

type voiceParamSpec = {
  offset: number, // parameter number or offset from start of sub-structure
  maxValue: number,
}

let voiceParamSpecs : {[name in voiceParam]: voiceParamSpec} = {
  'OP6 EG Rate 1': { offset: 0, maxValue: 99 },
  'OP6 EG Rate 2': { offset: 1, maxValue: 99 },
  'OP6 EG Rate 3': { offset: 2, maxValue: 99 },
  'OP6 EG Rate 4': { offset: 3, maxValue: 99 },
  'OP6 EG Level 1': { offset: 4, maxValue: 99 },
  'OP6 EG Level 2': { offset: 5, maxValue: 99 },
  'OP6 EG Level 3': { offset: 6, maxValue: 99 },
  'OP6 EG Level 4': { offset: 7, maxValue: 99 },
  'Feeback': { offset: 135, maxValue: 7 },
  'Oscillator Sync': { offset: 136, maxValue: 1 },
};


export class voiceParamData {
  private data: Uint8Array;

  constructor();
  constructor(data: Uint8Array | null = null) {
    if (data) {
      this.data = new Uint8Array(data);
    }
    else {
      // TODO: fill with init patch data
      this.data = new Uint8Array(154);
    }
  }

  getValue(param: voiceParam) : number {
    let offset = voiceParamSpecs[param].offset;
    return this.data[offset];
  }

  setValue(param: voiceParam, value: number) : void {
    let specs = voiceParamSpecs[param];
    value = this.clamp(value, 0, specs.maxValue);
    this.data[specs.offset] = value;
  }

  private clamp(value: number, min: number, max: number) : number {
    if (value < min) value = min;
    if (value > max) value = max;
    return value;
  }
}




// ///// Voice parameters

// export type voiceParam =
//   'ops' |
//   'pitchEg' |
//   'algorithm'
//   // TODO: rest
//   ;

// export type opParam =
//   'eg' |
//   'kbdLevSclBrkPt' |
//   'kbdLevSclLftDepth' |
//   'kbdLevSclRhtDepth' |
//   'kbdLevSclLftCurve' |
//   'kbdLevSclRhtCurve'
//   // TODO: rest
//   ;

// export type egValues = {
//   'rates': number[],
//   'levels': number[]
// }

// export type opValues = {
//   [name in opParam]: number | egValues;
// }

// export type voiceValues = {
//   [name in voiceParam]: number | opValues[] | egValues;
// }


// ///// Parameter specs

// export type voiceParamSpec = {
//   offset: number, // parameter number or offset from start of sub-structure
//   maxValue: number,
// }

// export type egParamSpecs = {
//   [name in 'rates' | 'levels']: voiceParamSpec[]
// }

// export type opParamSpecs = {
//   [name in opParam]: voiceParamSpec | egParamSpecs
// }

// export type voiceParamSpecsT = {
//   [name in voiceParam]: voiceParamSpec | egParamSpecs | opParamSpecs[]
// }


// export let voiceParamSpecs : voiceParamSpecsT = {
//   'algorithm': { offset: 134, maxValue: 31 },
//   'pitchEg': {
//     'rates': [],
//     'levels': []
//   },
//   'ops': [
    
//   ]
// }




// ///// Helpers

// // TODO: Get actual init patch parameters
// export function getInitVoice(): voiceValues {
//   return {
//     'ops': [
//       {
//         'eg': {
//           'rates': [99, 50, 0, 50],
//           'levels': [99, 99, 0, 0]
//         },
//         'kbdLevSclBrkPt': 64,
//         'kbdLevSclLftDepth': 0,
//         'kbdLevSclLftCurve': 0,
//         'kbdLevSclRhtDepth': 0,
//         'kbdLevSclRhtCurve': 0,
//       },
//       {
//         'eg': {
//           'rates': [0, 0, 0, 0],
//           'levels': [0, 0, 0, 0]
//         },
//         'kbdLevSclBrkPt': 64,
//         'kbdLevSclLftDepth': 0,
//         'kbdLevSclLftCurve': 0,
//         'kbdLevSclRhtDepth': 0,
//         'kbdLevSclRhtCurve': 0,
//       },
//       {
//         'eg': {
//           'rates': [0, 0, 0, 0],
//           'levels': [0, 0, 0, 0]
//         },
//         'kbdLevSclBrkPt': 64,
//         'kbdLevSclLftDepth': 0,
//         'kbdLevSclLftCurve': 0,
//         'kbdLevSclRhtDepth': 0,
//         'kbdLevSclRhtCurve': 0,
//       },
//       {
//         'eg': {
//           'rates': [0, 0, 0, 0],
//           'levels': [0, 0, 0, 0]
//         },
//         'kbdLevSclBrkPt': 64,
//         'kbdLevSclLftDepth': 0,
//         'kbdLevSclLftCurve': 0,
//         'kbdLevSclRhtDepth': 0,
//         'kbdLevSclRhtCurve': 0,
//       },
//       {
//         'eg': {
//           'rates': [0, 0, 0, 0],
//           'levels': [0, 0, 0, 0]
//         },
//         'kbdLevSclBrkPt': 64,
//         'kbdLevSclLftDepth': 0,
//         'kbdLevSclLftCurve': 0,
//         'kbdLevSclRhtDepth': 0,
//         'kbdLevSclRhtCurve': 0,
//       },
//       {
//         'eg': {
//           'rates': [0, 0, 0, 0],
//           'levels': [0, 0, 0, 0]
//         },
//         'kbdLevSclBrkPt': 64,
//         'kbdLevSclLftDepth': 0,
//         'kbdLevSclLftCurve': 0,
//         'kbdLevSclRhtDepth': 0,
//         'kbdLevSclRhtCurve': 0,
//       },
//     ],
//     'pitchEg': {
//       'rates': [99, 99, 99, 99],
//       'levels': [50, 50, 50, 50],
//     },
//     'algorithm': 1,
//   }
