export type algOp = {
  modulatedBy: number[],
  feedbackFrom?: number,

  // grid position (units) in the diagram
  x: number, // from left
  y: number, // from bottom
};

export type alg = {[key: number]: algOp};

export const algorithms : {[key: number]: alg} = {
  1: {
      1: {modulatedBy: [2], x: 0, y: 0},
      2: {modulatedBy: [], x: 0, y: 1},
      3: {modulatedBy: [4], x: 1, y: 0},
      4: {modulatedBy: [5], x: 1, y: 1},
      5: {modulatedBy: [6], x: 1, y: 2},
      6: {modulatedBy: [], x: 1, y: 3, feedbackFrom: 6},
    },
  13: {
      3: {modulatedBy: [4,5,6], x: 1, y: 0},
      4: {modulatedBy: [], x: 0, y: 1},
      5: {modulatedBy: [], x: 1, y: 1},
      6: {modulatedBy: [], x: 2, y: 1, feedbackFrom: 6},
      1: {modulatedBy: [2], x: 3, y: 0},
      2: {modulatedBy: [], x: 3, y: 1},
    },  
  14: {
      1: {modulatedBy: [2], x: 0, y: 0},
      2: {modulatedBy: [], x: 0, y: 1, feedbackFrom: 2},
      3: {modulatedBy: [4], x: 1, y: 0},
      4: {modulatedBy: [5,6], x: 1, y: 1},
      5: {modulatedBy: [], x: 0, y: 2},
      6: {modulatedBy: [], x: 1, y: 2},
    },
  21: {
      1: {modulatedBy: [3], x: 0, y: 0},
      2: {modulatedBy: [3], x: 1, y: 0},
      3: {modulatedBy: [], x: 0, y: 1, feedbackFrom: 3},
      4: {modulatedBy: [6], x: 2, y: 0},
      5: {modulatedBy: [6], x: 3, y: 0},
      6: {modulatedBy: [], x: 2, y: 1},
    },
};