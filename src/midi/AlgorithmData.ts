import type { opNumber } from './VoiceParamData';

/**
 * Describes an operator (carrier or modulator) and its relationship
 * with other operators within an algorithm.
 * Carriers (operators that produce sound) are at the bottom
 * of the structure (y = 0).
 */
export type operator = {
  /**
   * Each operator may be modulated by one or more other
   * other operators. This contains the numbers of such modulators.
   * Empty for operators with no modulators.
   */ 
  modulatedBy: opNumber[],

  /**
   * If set, this is the number of the operator that is the
   * source of the feedback path. This is often, but not always,
   * the operator itself.
   */
  feedbackFrom?: opNumber,

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
 * number as key. 
 */
export type algorithm = {[key in opNumber]: operator};

/**
 * Describes the structure of the 32 6-operator algorithms
 * of the DX7 / DX7ii / TX7 / DX5 / DX1 etc.
 * The DX7 algorithm number (1-based) is the key.
 */
export const algorithms : {[algNumber in number]: algorithm} = {
  1: {
      'op1': {modulatedBy: ['op2'], x: 0, y: 0},
      'op2': {modulatedBy: [], x: 0, y: 1},
      'op3': {modulatedBy: ['op4'], x: 1, y: 0},
      'op4': {modulatedBy: ['op5'], x: 1, y: 1},
      'op5': {modulatedBy: ['op6'], x: 1, y: 2},
      'op6': {modulatedBy: [], x: 1, y: 3, feedbackFrom: 'op6'}},
  2: {
      'op1': {modulatedBy: ['op2'], x: 0, y: 0},
      'op2': {modulatedBy: [], x: 0, y: 1, feedbackFrom: 'op2'},
      'op3': {modulatedBy: ['op4'], x: 1, y: 0},
      'op4': {modulatedBy: ['op5'], x: 1, y: 1},
      'op5': {modulatedBy: ['op6'], x: 1, y: 2},
      'op6': {modulatedBy: [], x: 1, y: 3}},
  3: {
      'op1': {modulatedBy: ['op2'], x: 0, y: 0},
      'op2': {modulatedBy: ['op3'], x: 0, y: 1},
      'op3': {modulatedBy: [], x: 0, y: 2},
      'op4': {modulatedBy: ['op5'], x: 1, y: 0},
      'op5': {modulatedBy: ['op6'], x: 1, y: 1},
      'op6': {modulatedBy: [], x: 1, y: 2, feedbackFrom: 'op6'}},
  4: {
      'op1': {modulatedBy: ['op2'], x: 0, y: 0},
      'op2': {modulatedBy: ['op3'], x: 0, y: 1},
      'op3': {modulatedBy: [], x: 0, y: 2},
      'op4': {modulatedBy: ['op5'], x: 1, y: 0},
      'op5': {modulatedBy: ['op6'], x: 1, y: 1},
      'op6': {modulatedBy: [], x: 1, y: 2, feedbackFrom: 'op4'}},
  5: {
      'op1': {modulatedBy: ['op2'], x: 0, y: 0},
      'op2': {modulatedBy: [], x: 0, y: 1},
      'op3': {modulatedBy: ['op4'], x: 1, y: 0},
      'op4': {modulatedBy: [], x: 1, y: 1},
      'op5': {modulatedBy: ['op6'], x: 2, y: 0},
      'op6': {modulatedBy: [], x: 2, y: 1, feedbackFrom: 'op6'}},
  6: {
      'op1': {modulatedBy: ['op2'], x: 0, y: 0},
      'op2': {modulatedBy: [], x: 0, y: 1},
      'op3': {modulatedBy: ['op4'], x: 1, y: 0},
      'op4': {modulatedBy: [], x: 1, y: 1},
      'op5': {modulatedBy: ['op6'], x: 2, y: 0},
      'op6': {modulatedBy: [], x: 2, y: 1, feedbackFrom: 'op5'}},
  7: {
      'op1': {modulatedBy: ['op2'], x: 0, y: 0},
      'op2': {modulatedBy: [], x: 0, y: 1},
      'op3': {modulatedBy: ['op4', 'op5'], x: 1, y: 0},
      'op4': {modulatedBy: [], x: 1, y: 1},
      'op5': {modulatedBy: ['op6'], x: 2, y: 1},
      'op6': {modulatedBy: [], x: 2, y: 2, feedbackFrom: 'op6'}},
  8: {
      'op1': {modulatedBy: ['op2'], x: 0, y: 0},
      'op2': {modulatedBy: [], x: 0, y: 1},
      'op3': {modulatedBy: ['op4', 'op5'], x: 1, y: 0},
      'op4': {modulatedBy: [], x: 1, y: 1, feedbackFrom: 'op4'},
      'op5': {modulatedBy: ['op6'], x: 2, y: 1},
      'op6': {modulatedBy: [], x: 2, y: 2}},
  9: {
      'op1': {modulatedBy: ['op2'], x: 0, y: 0},
      'op2': {modulatedBy: [], x: 0, y: 1, feedbackFrom: 'op2'},
      'op3': {modulatedBy: ['op4', 'op5'], x: 1, y: 0},
      'op4': {modulatedBy: [], x: 1, y: 1},
      'op5': {modulatedBy: ['op6'], x: 2, y: 1},
      'op6': {modulatedBy: [], x: 2, y: 2}},
  10: {
      'op1': {modulatedBy: ['op2'], x: 2, y: 0},
      'op2': {modulatedBy: ['op3'], x: 2, y: 1},
      'op3': {modulatedBy: [], x: 2, y: 2, feedbackFrom: 'op3'},  
      'op4': {modulatedBy: ['op5', 'op6'], x: 1, y: 0},
      'op5': {modulatedBy: [], x: 0, y: 1},
      'op6': {modulatedBy: [], x: 1, y: 1}},
  11: {
      'op1': {modulatedBy: ['op2'], x: 2, y: 0},
      'op2': {modulatedBy: ['op3'], x: 2, y: 1},
      'op3': {modulatedBy: [], x: 2, y: 2},
      'op4': {modulatedBy: ['op5', 'op6'], x: 1, y: 0},
      'op5': {modulatedBy: [], x: 0, y: 1},
      'op6': {modulatedBy: [], x: 1, y: 1, feedbackFrom: 'op6'}},
  12: {
      'op1': {modulatedBy: ['op2'], x: 3, y: 0},
      'op2': {modulatedBy: [], x: 3, y: 1},
      'op3': {modulatedBy: ['op4', 'op5', 'op6'], x: 1, y: 0},
      'op4': {modulatedBy: [], x: 0, y: 1},
      'op5': {modulatedBy: [], x: 1, y: 1},
      'op6': {modulatedBy: [], x: 2, y: 1, feedbackFrom: 'op6'}},
  13: {
      'op3': {modulatedBy: ['op4', 'op5', 'op6'], x: 1, y: 0},
      'op4': {modulatedBy: [], x: 0, y: 1},
      'op5': {modulatedBy: [], x: 1, y: 1},
      'op6': {modulatedBy: [], x: 2, y: 1, feedbackFrom: 'op6'},
      'op1': {modulatedBy: ['op2'], x: 3, y: 0},
      'op2': {modulatedBy: [], x: 3, y: 1}},  
  14: {
      'op1': {modulatedBy: ['op2'], x: 0, y: 0},
      'op2': {modulatedBy: [], x: 0, y: 1},
      'op3': {modulatedBy: ['op4'], x: 1, y: 0},
      'op4': {modulatedBy: ['op5', 'op6'], x: 1, y: 1},
      'op5': {modulatedBy: [], x: 0, y: 2},
      'op6': {modulatedBy: [], x: 1, y: 2, feedbackFrom: 'op6'}},
  15: {
      'op1': {modulatedBy: ['op2'], x: 0, y: 0},
      'op2': {modulatedBy: [], x: 0, y: 1, feedbackFrom: 'op2'},
      'op3': {modulatedBy: ['op4'], x: 1, y: 0},
      'op4': {modulatedBy: ['op5', 'op6'], x: 1, y: 1},
      'op5': {modulatedBy: [], x: 0, y: 2},
      'op6': {modulatedBy: [], x: 1, y: 2, feedbackFrom: 'op6'}},
  16: {
      'op1': {modulatedBy: ['op2', 'op3', 'op5'], x: 1, y: 0},
      'op2': {modulatedBy: [], x: 0, y: 1},
      'op3': {modulatedBy: ['op4'], x: 1, y: 1},
      'op4': {modulatedBy: [], x: 1, y: 2},
      'op5': {modulatedBy: ['op6'], x: 2, y: 1},
      'op6': {modulatedBy: [], x: 2, y: 2, feedbackFrom: 'op6'}},
  17: {
      'op1': {modulatedBy: ['op2', 'op3', 'op5'], x: 1, y: 0},
      'op2': {modulatedBy: [], x: 0, y: 1, feedbackFrom: 'op2'},
      'op3': {modulatedBy: ['op4'], x: 1, y: 1},
      'op4': {modulatedBy: [], x: 1, y: 2},
      'op5': {modulatedBy: ['op6'], x: 2, y: 1},
      'op6': {modulatedBy: [], x: 2, y: 2}},
  18: {
      'op1': {modulatedBy: ['op2', 'op3', 'op4'], x: 1, y: 0},
      'op2': {modulatedBy: [], x: 0, y: 1},
      'op3': {modulatedBy: [], x: 1, y: 1, feedbackFrom: 'op3'},
      'op4': {modulatedBy: ['op5'], x: 2, y: 1},
      'op5': {modulatedBy: ['op6'], x: 2, y: 2},
      'op6': {modulatedBy: [], x: 2, y: 3}},
  19: {
      'op1': {modulatedBy: ['op2'], x: 0, y: 0},
      'op2': {modulatedBy: ['op3'], x: 0, y: 1},
      'op3': {modulatedBy: [], x: 0, y: 2},
      'op4': {modulatedBy: ['op6'], x: 1, y: 0},
      'op5': {modulatedBy: ['op6'], x: 2, y: 0},
      'op6': {modulatedBy: [], x: 1, y: 1, feedbackFrom: 'op6'}},
  20: {
      'op1': {modulatedBy: ['op3'], x: 0, y: 0},
      'op2': {modulatedBy: ['op3'], x: 1, y: 0},
      'op3': {modulatedBy: [], x: 0, y: 1, feedbackFrom: 'op3'},
      'op4': {modulatedBy: ['op5', 'op6'], x: 2, y: 0},
      'op5': {modulatedBy: [], x: 1, y: 1},
      'op6': {modulatedBy: [], x: 2, y: 1}},
  21: {
      'op1': {modulatedBy: ['op3'], x: 0, y: 0},
      'op2': {modulatedBy: ['op3'], x: 1, y: 0},
      'op3': {modulatedBy: [], x: 0, y: 1, feedbackFrom: 'op3'},
      'op4': {modulatedBy: ['op6'], x: 2, y: 0},
      'op5': {modulatedBy: ['op6'], x: 3, y: 0},
      'op6': {modulatedBy: [], x: 2, y: 1}},
  22: {
      'op1': {modulatedBy: ['op2'], x: 0, y: 0},
      'op2': {modulatedBy: [], x: 0, y: 1},
      'op3': {modulatedBy: ['op6'], x: 1, y: 0},
      'op4': {modulatedBy: ['op6'], x: 2, y: 0},
      'op5': {modulatedBy: ['op6'], x: 3, y: 0},
      'op6': {modulatedBy: [], x: 2, y: 1, feedbackFrom: 'op6'}},
  23: {
      'op1': {modulatedBy: [], x: 0, y: 0},
      'op2': {modulatedBy: ['op3'], x: 1, y: 0},
      'op3': {modulatedBy: [], x: 1, y: 1},
      'op4': {modulatedBy: ['op6'], x: 2, y: 0},
      'op5': {modulatedBy: ['op6'], x: 3, y: 0},
      'op6': {modulatedBy: [], x: 2, y: 1, feedbackFrom: 'op6'}},
  24: {
      'op1': {modulatedBy: [], x: 0, y: 0},
      'op2': {modulatedBy: [], x: 1, y: 0},
      'op3': {modulatedBy: ['op6'], x: 2, y: 0},
      'op4': {modulatedBy: ['op6'], x: 3, y: 0},
      'op5': {modulatedBy: ['op6'], x: 4, y: 0},
      'op6': {modulatedBy: [], x: 3, y: 1, feedbackFrom: 'op6'}},
  25: {
      'op1': {modulatedBy: [], x: 0, y: 0},
      'op2': {modulatedBy: [], x: 1, y: 0},
      'op3': {modulatedBy: [], x: 2, y: 0},
      'op4': {modulatedBy: ['op6'], x: 3, y: 0},
      'op5': {modulatedBy: ['op6'], x: 4, y: 0},
      'op6': {modulatedBy: [], x: 3, y: 1, feedbackFrom: 'op6'}},
  26: {
      'op1': {modulatedBy: [], x: 0, y: 0},
      'op2': {modulatedBy: ['op3'], x: 1, y: 0},
      'op3': {modulatedBy: [], x: 1, y: 1},
      'op4': {modulatedBy: ['op5', 'op6'], x: 3, y: 0},
      'op5': {modulatedBy: [], x: 2, y: 1},
      'op6': {modulatedBy: [], x: 3, y: 1, feedbackFrom: 'op6'}},
  27: {
      'op1': {modulatedBy: [], x: 0, y: 0},
      'op2': {modulatedBy: ['op3'], x: 1, y: 0},
      'op3': {modulatedBy: [], x: 1, y: 1, feedbackFrom: 'op3'},
      'op4': {modulatedBy: ['op5', 'op6'], x: 3, y: 0},
      'op5': {modulatedBy: [], x: 2, y: 1},
      'op6': {modulatedBy: [], x: 3, y: 1}},
  28: {
      'op1': {modulatedBy: ['op2'], x: 0, y: 0},
      'op2': {modulatedBy: [], x: 0, y: 1},
      'op3': {modulatedBy: ['op4'], x: 1, y: 0},
      'op4': {modulatedBy: ['op5'], x: 1, y: 1},
      'op5': {modulatedBy: [], x: 1, y: 2, feedbackFrom: 'op5'},
      'op6': {modulatedBy: [], x: 2, y: 0}},
  29: {
      'op1': {modulatedBy: [], x: 0, y: 0},
      'op2': {modulatedBy: [], x: 1, y: 0},
      'op3': {modulatedBy: ['op4'], x: 2, y: 0},
      'op4': {modulatedBy: [], x: 2, y: 1},
      'op5': {modulatedBy: ['op6'], x: 3, y: 0},
      'op6': {modulatedBy: [], x: 3, y: 1, feedbackFrom: 'op6'}},
  30: {
      'op1': {modulatedBy: [], x: 0, y: 0},
      'op2': {modulatedBy: [], x: 1, y: 0},
      'op3': {modulatedBy: ['op4'], x: 2, y: 0},
      'op4': {modulatedBy: ['op5'], x: 2, y: 1},
      'op5': {modulatedBy: [], x: 2, y: 2, feedbackFrom: 'op5'},
      'op6': {modulatedBy: [], x: 3, y: 0}},
  31: {
      'op1': {modulatedBy: [], x: 0, y: 0},
      'op2': {modulatedBy: [], x: 1, y: 0},
      'op3': {modulatedBy: [], x: 2, y: 0},
      'op4': {modulatedBy: [], x: 3, y: 0},
      'op5': {modulatedBy: ['op6'], x: 4, y: 0},
      'op6': {modulatedBy: [], x: 4, y: 1, feedbackFrom: 'op6'}},
  32: {
      'op1': {modulatedBy: [], x: 0, y: 0},
      'op2': {modulatedBy: [], x: 1, y: 0},
      'op3': {modulatedBy: [], x: 2, y: 0},
      'op4': {modulatedBy: [], x: 3, y: 0},
      'op5': {modulatedBy: [], x: 4, y: 0},
      'op6': {modulatedBy: [], x: 5, y: 0, feedbackFrom: 'op6'}},
};