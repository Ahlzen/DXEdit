/**
 * Describes an operator (carrier or modulator) and its relationship
 * with other operators within an algorithm.
 * Carriers (operators that produce sound) are at the bottom
 * of the structure (y = 0).
 */
type operator = {
  /**
   * Each operator may be modulated by one or more other
   * other operators. This contains the numbers of such modulators.
   * Empty for operators with no modulators.
   */ 
  modulatedBy: number[],

  /**
   * If set, this is the number of the operator that is the
   * source of the feedback path. This is often, but not always,
   * the operator itself.
   */
  feedbackFrom?: number,

  // Position in the diagram

  x: number, // units from left, 0-based
  y: number, // units from bottom, 0-based
};

// Maximum dimensions (units) of any algorithm
export const algorithmMaxDimensions = {
  x: 6,
  y: 4
};

/** 
 * An algorithm is a set of 6 operators, with the operator
 * number as key (1-based). 
 */
export type algorithm = {[key: number]: operator};

/**
 * Describes the structure of the 32 6-operator algorithms
 * of the DX7 / DX7ii / TX7 / DX5 / DX1 etc.
 * The DX7 algorithm number (1-based) is the key.
 */
export const algorithms : {[key: number]: algorithm} = {
  1: {
      1: {modulatedBy: [2], x: 0, y: 0},
      2: {modulatedBy: [], x: 0, y: 1},
      3: {modulatedBy: [4], x: 1, y: 0},
      4: {modulatedBy: [5], x: 1, y: 1},
      5: {modulatedBy: [6], x: 1, y: 2},
      6: {modulatedBy: [], x: 1, y: 3, feedbackFrom: 6}},
  2: {
      1: {modulatedBy: [2], x: 0, y: 0},
      2: {modulatedBy: [], x: 0, y: 1, feedbackFrom: 2},
      3: {modulatedBy: [4], x: 1, y: 0},
      4: {modulatedBy: [5], x: 1, y: 1},
      5: {modulatedBy: [6], x: 1, y: 2},
      6: {modulatedBy: [], x: 1, y: 3}},
  3: {
      1: {modulatedBy: [2], x: 0, y: 0},
      2: {modulatedBy: [3], x: 0, y: 1},
      3: {modulatedBy: [], x: 0, y: 2},
      4: {modulatedBy: [5], x: 1, y: 0},
      5: {modulatedBy: [6], x: 1, y: 1},
      6: {modulatedBy: [], x: 1, y: 2, feedbackFrom: 6}},
  4: {
      1: {modulatedBy: [2], x: 0, y: 0},
      2: {modulatedBy: [3], x: 0, y: 1},
      3: {modulatedBy: [], x: 0, y: 2},
      4: {modulatedBy: [5], x: 1, y: 0},
      5: {modulatedBy: [6], x: 1, y: 1},
      6: {modulatedBy: [], x: 1, y: 2, feedbackFrom: 4}},
  5: {
      1: {modulatedBy: [2], x: 0, y: 0},
      2: {modulatedBy: [], x: 0, y: 1},
      3: {modulatedBy: [4], x: 1, y: 0},
      4: {modulatedBy: [], x: 1, y: 1},
      5: {modulatedBy: [6], x: 2, y: 0},
      6: {modulatedBy: [], x: 2, y: 1, feedbackFrom: 6}},
  6: {
      1: {modulatedBy: [2], x: 0, y: 0},
      2: {modulatedBy: [], x: 0, y: 1},
      3: {modulatedBy: [4], x: 1, y: 0},
      4: {modulatedBy: [], x: 1, y: 1},
      5: {modulatedBy: [6], x: 2, y: 0},
      6: {modulatedBy: [], x: 2, y: 1, feedbackFrom: 5}},
  7: {
      1: {modulatedBy: [2], x: 0, y: 0},
      2: {modulatedBy: [], x: 0, y: 1},
      3: {modulatedBy: [4,5], x: 1, y: 0},
      4: {modulatedBy: [], x: 1, y: 1},
      5: {modulatedBy: [6], x: 2, y: 1},
      6: {modulatedBy: [], x: 2, y: 2, feedbackFrom: 6}},
  8: {
      1: {modulatedBy: [2], x: 0, y: 0},
      2: {modulatedBy: [], x: 0, y: 1},
      3: {modulatedBy: [4,5], x: 1, y: 0},
      4: {modulatedBy: [], x: 1, y: 1, feedbackFrom: 4},
      5: {modulatedBy: [6], x: 2, y: 1},
      6: {modulatedBy: [], x: 2, y: 2}},
  9: {
      1: {modulatedBy: [2], x: 0, y: 0},
      2: {modulatedBy: [], x: 0, y: 1, feedbackFrom: 2},
      3: {modulatedBy: [4,5], x: 1, y: 0},
      4: {modulatedBy: [], x: 1, y: 1},
      5: {modulatedBy: [6], x: 2, y: 1},
      6: {modulatedBy: [], x: 2, y: 2}},
  10: {
      1: {modulatedBy: [2], x: 2, y: 0},
      2: {modulatedBy: [3], x: 2, y: 1},
      3: {modulatedBy: [], x: 2, y: 2, feedbackFrom: 3},
      4: {modulatedBy: [5,6], x: 1, y: 0},
      5: {modulatedBy: [], x: 0, y: 1},
      6: {modulatedBy: [], x: 1, y: 1}},
  11: {
      1: {modulatedBy: [2], x: 2, y: 0},
      2: {modulatedBy: [3], x: 2, y: 1},
      3: {modulatedBy: [], x: 2, y: 2},
      4: {modulatedBy: [5,6], x: 1, y: 0},
      5: {modulatedBy: [], x: 0, y: 1},
      6: {modulatedBy: [], x: 1, y: 1, feedbackFrom: 6}},
  12: {
      1: {modulatedBy: [2], x: 3, y: 0},
      2: {modulatedBy: [], x: 3, y: 1},
      3: {modulatedBy: [4,5,6], x: 1, y: 0},
      4: {modulatedBy: [], x: 0, y: 1},
      5: {modulatedBy: [], x: 1, y: 1},
      6: {modulatedBy: [], x: 2, y: 1, feedbackFrom: 6}},
  13: {
      3: {modulatedBy: [4,5,6], x: 1, y: 0},
      4: {modulatedBy: [], x: 0, y: 1},
      5: {modulatedBy: [], x: 1, y: 1},
      6: {modulatedBy: [], x: 2, y: 1, feedbackFrom: 6},
      1: {modulatedBy: [2], x: 3, y: 0},
      2: {modulatedBy: [], x: 3, y: 1}},  
  14: {
      1: {modulatedBy: [2], x: 0, y: 0},
      2: {modulatedBy: [], x: 0, y: 1},
      3: {modulatedBy: [4], x: 1, y: 0},
      4: {modulatedBy: [5,6], x: 1, y: 1},
      5: {modulatedBy: [], x: 0, y: 2},
      6: {modulatedBy: [], x: 1, y: 2, feedbackFrom: 6}},
  15: {
      1: {modulatedBy: [2], x: 0, y: 0},
      2: {modulatedBy: [], x: 0, y: 1, feedbackFrom: 2},
      3: {modulatedBy: [4], x: 1, y: 0},
      4: {modulatedBy: [5,6], x: 1, y: 1},
      5: {modulatedBy: [], x: 0, y: 2},
      6: {modulatedBy: [], x: 1, y: 2, feedbackFrom: 6}},
  16: {
      1: {modulatedBy: [2,3,5], x: 1, y: 0},
      2: {modulatedBy: [], x: 0, y: 1},
      3: {modulatedBy: [4], x: 1, y: 1},
      4: {modulatedBy: [], x: 1, y: 2},
      5: {modulatedBy: [6], x: 2, y: 1},
      6: {modulatedBy: [], x: 2, y: 2, feedbackFrom: 6}},
  17: {
      1: {modulatedBy: [2,3,5], x: 1, y: 0},
      2: {modulatedBy: [], x: 0, y: 1, feedbackFrom: 2},
      3: {modulatedBy: [4], x: 1, y: 1},
      4: {modulatedBy: [], x: 1, y: 2},
      5: {modulatedBy: [6], x: 2, y: 1},
      6: {modulatedBy: [], x: 2, y: 2}},
  18: {
      1: {modulatedBy: [2,3,4], x: 1, y: 0},
      2: {modulatedBy: [], x: 0, y: 1},
      3: {modulatedBy: [], x: 1, y: 1, feedbackFrom: 3},
      4: {modulatedBy: [5], x: 2, y: 1},
      5: {modulatedBy: [6], x: 2, y: 2},
      6: {modulatedBy: [], x: 2, y: 3}},
  19: {
      1: {modulatedBy: [2], x: 0, y: 0},
      2: {modulatedBy: [3], x: 0, y: 1},
      3: {modulatedBy: [], x: 0, y: 2},
      4: {modulatedBy: [6], x: 1, y: 0},
      5: {modulatedBy: [6], x: 2, y: 0},
      6: {modulatedBy: [], x: 1, y: 1, feedbackFrom: 6}},
  20: {
      1: {modulatedBy: [3], x: 0, y: 0},
      2: {modulatedBy: [3], x: 1, y: 0},
      3: {modulatedBy: [], x: 0, y: 1, feedbackFrom: 3},
      4: {modulatedBy: [5,6], x: 2, y: 0},
      5: {modulatedBy: [], x: 1, y: 1},
      6: {modulatedBy: [], x: 2, y: 1}},
  21: {
      1: {modulatedBy: [3], x: 0, y: 0},
      2: {modulatedBy: [3], x: 1, y: 0},
      3: {modulatedBy: [], x: 0, y: 1, feedbackFrom: 3},
      4: {modulatedBy: [6], x: 2, y: 0},
      5: {modulatedBy: [6], x: 3, y: 0},
      6: {modulatedBy: [], x: 2, y: 1}},
  22: {
      1: {modulatedBy: [2], x: 0, y: 0},
      2: {modulatedBy: [], x: 0, y: 1},
      3: {modulatedBy: [6], x: 1, y: 0},
      4: {modulatedBy: [6], x: 2, y: 0},
      5: {modulatedBy: [6], x: 3, y: 0},
      6: {modulatedBy: [], x: 2, y: 1, feedbackFrom: 6}},
  23: {
      1: {modulatedBy: [], x: 0, y: 0},
      2: {modulatedBy: [3], x: 1, y: 0},
      3: {modulatedBy: [], x: 1, y: 1},
      4: {modulatedBy: [6], x: 2, y: 0},
      5: {modulatedBy: [6], x: 3, y: 0},
      6: {modulatedBy: [], x: 2, y: 1, feedbackFrom: 6}},
  24: {
      1: {modulatedBy: [], x: 0, y: 0},
      2: {modulatedBy: [], x: 1, y: 0},
      3: {modulatedBy: [6], x: 2, y: 0},
      4: {modulatedBy: [6], x: 3, y: 0},
      5: {modulatedBy: [6], x: 4, y: 0},
      6: {modulatedBy: [], x: 3, y: 1, feedbackFrom: 6}},
  25: {
      1: {modulatedBy: [], x: 0, y: 0},
      2: {modulatedBy: [], x: 1, y: 0},
      3: {modulatedBy: [], x: 2, y: 0},
      4: {modulatedBy: [6], x: 3, y: 0},
      5: {modulatedBy: [6], x: 4, y: 0},
      6: {modulatedBy: [], x: 3, y: 1, feedbackFrom: 6}},
  26: {
      1: {modulatedBy: [], x: 0, y: 0},
      2: {modulatedBy: [3], x: 1, y: 0},
      3: {modulatedBy: [], x: 1, y: 1},
      4: {modulatedBy: [5,6], x: 3, y: 0},
      5: {modulatedBy: [], x: 2, y: 1},
      6: {modulatedBy: [], x: 3, y: 1, feedbackFrom: 6}},
  27: {
      1: {modulatedBy: [], x: 0, y: 0},
      2: {modulatedBy: [3], x: 1, y: 0},
      3: {modulatedBy: [], x: 1, y: 1, feedbackFrom: 3},
      4: {modulatedBy: [5,6], x: 3, y: 0},
      5: {modulatedBy: [], x: 2, y: 1},
      6: {modulatedBy: [], x: 3, y: 1}},
  28: {
      1: {modulatedBy: [2], x: 0, y: 0},
      2: {modulatedBy: [], x: 0, y: 1},
      3: {modulatedBy: [4], x: 1, y: 0},
      4: {modulatedBy: [5], x: 1, y: 1},
      5: {modulatedBy: [], x: 1, y: 2, feedbackFrom: 5},
      6: {modulatedBy: [], x: 2, y: 0}},
  29: {
      1: {modulatedBy: [], x: 0, y: 0},
      2: {modulatedBy: [], x: 1, y: 0},
      3: {modulatedBy: [4], x: 2, y: 0},
      4: {modulatedBy: [], x: 2, y: 1},
      5: {modulatedBy: [6], x: 3, y: 0},
      6: {modulatedBy: [], x: 3, y: 1, feedbackFrom: 6}},
  30: {
      1: {modulatedBy: [], x: 0, y: 0},
      2: {modulatedBy: [], x: 1, y: 0},
      3: {modulatedBy: [4], x: 2, y: 0},
      4: {modulatedBy: [5], x: 2, y: 1},
      5: {modulatedBy: [], x: 2, y: 2, feedbackFrom: 5},
      6: {modulatedBy: [], x: 3, y: 0}},
  31: {
      1: {modulatedBy: [], x: 0, y: 0},
      2: {modulatedBy: [], x: 1, y: 0},
      3: {modulatedBy: [], x: 2, y: 0},
      4: {modulatedBy: [], x: 3, y: 0},
      5: {modulatedBy: [6], x: 4, y: 0},
      6: {modulatedBy: [], x: 4, y: 1, feedbackFrom: 6}},
  32: {
      1: {modulatedBy: [], x: 0, y: 0},
      2: {modulatedBy: [], x: 1, y: 0},
      3: {modulatedBy: [], x: 2, y: 0},
      4: {modulatedBy: [], x: 3, y: 0},
      5: {modulatedBy: [], x: 4, y: 0},
      6: {modulatedBy: [], x: 5, y: 0, feedbackFrom: 6}},
};