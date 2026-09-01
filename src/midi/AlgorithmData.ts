import type { opNumber } from './VoiceEditorData';

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
      'OP1': {modulatedBy: ['OP2'], x: 0, y: 0},
      'OP2': {modulatedBy: [], x: 0, y: 1},
      'OP3': {modulatedBy: ['OP4'], x: 1, y: 0},
      'OP4': {modulatedBy: ['OP5'], x: 1, y: 1},
      'OP5': {modulatedBy: ['OP6'], x: 1, y: 2},
      'OP6': {modulatedBy: [], x: 1, y: 3, feedbackFrom: 'OP6'}},
  2: {
      'OP1': {modulatedBy: ['OP2'], x: 0, y: 0},
      'OP2': {modulatedBy: [], x: 0, y: 1, feedbackFrom: 'OP2'},
      'OP3': {modulatedBy: ['OP4'], x: 1, y: 0},
      'OP4': {modulatedBy: ['OP5'], x: 1, y: 1},
      'OP5': {modulatedBy: ['OP6'], x: 1, y: 2},
      'OP6': {modulatedBy: [], x: 1, y: 3}},
  3: {
      'OP1': {modulatedBy: ['OP2'], x: 0, y: 0},
      'OP2': {modulatedBy: ['OP3'], x: 0, y: 1},
      'OP3': {modulatedBy: [], x: 0, y: 2},
      'OP4': {modulatedBy: ['OP5'], x: 1, y: 0},
      'OP5': {modulatedBy: ['OP6'], x: 1, y: 1},
      'OP6': {modulatedBy: [], x: 1, y: 2, feedbackFrom: 'OP6'}},
  4: {
      'OP1': {modulatedBy: ['OP2'], x: 0, y: 0},
      'OP2': {modulatedBy: ['OP3'], x: 0, y: 1},
      'OP3': {modulatedBy: [], x: 0, y: 2},
      'OP4': {modulatedBy: ['OP5'], x: 1, y: 0},
      'OP5': {modulatedBy: ['OP6'], x: 1, y: 1},
      'OP6': {modulatedBy: [], x: 1, y: 2, feedbackFrom: 'OP4'}},
  5: {
      'OP1': {modulatedBy: ['OP2'], x: 0, y: 0},
      'OP2': {modulatedBy: [], x: 0, y: 1},
      'OP3': {modulatedBy: ['OP4'], x: 1, y: 0},
      'OP4': {modulatedBy: [], x: 1, y: 1},
      'OP5': {modulatedBy: ['OP6'], x: 2, y: 0},
      'OP6': {modulatedBy: [], x: 2, y: 1, feedbackFrom: 'OP6'}},
  6: {
      'OP1': {modulatedBy: ['OP2'], x: 0, y: 0},
      'OP2': {modulatedBy: [], x: 0, y: 1},
      'OP3': {modulatedBy: ['OP4'], x: 1, y: 0},
      'OP4': {modulatedBy: [], x: 1, y: 1},
      'OP5': {modulatedBy: ['OP6'], x: 2, y: 0},
      'OP6': {modulatedBy: [], x: 2, y: 1, feedbackFrom: 'OP5'}},
  7: {
      'OP1': {modulatedBy: ['OP2'], x: 0, y: 0},
      'OP2': {modulatedBy: [], x: 0, y: 1},
      'OP3': {modulatedBy: ['OP4', 'OP5'], x: 1, y: 0},
      'OP4': {modulatedBy: [], x: 1, y: 1},
      'OP5': {modulatedBy: ['OP6'], x: 2, y: 1},
      'OP6': {modulatedBy: [], x: 2, y: 2, feedbackFrom: 'OP6'}},
  8: {
      'OP1': {modulatedBy: ['OP2'], x: 0, y: 0},
      'OP2': {modulatedBy: [], x: 0, y: 1},
      'OP3': {modulatedBy: ['OP4', 'OP5'], x: 1, y: 0},
      'OP4': {modulatedBy: [], x: 1, y: 1, feedbackFrom: 'OP4'},
      'OP5': {modulatedBy: ['OP6'], x: 2, y: 1},
      'OP6': {modulatedBy: [], x: 2, y: 2}},
  9: {
      'OP1': {modulatedBy: ['OP2'], x: 0, y: 0},
      'OP2': {modulatedBy: [], x: 0, y: 1, feedbackFrom: 'OP2'},
      'OP3': {modulatedBy: ['OP4', 'OP5'], x: 1, y: 0},
      'OP4': {modulatedBy: [], x: 1, y: 1},
      'OP5': {modulatedBy: ['OP6'], x: 2, y: 1},
      'OP6': {modulatedBy: [], x: 2, y: 2}},
  10: {
      'OP1': {modulatedBy: ['OP2'], x: 2, y: 0},
      'OP2': {modulatedBy: ['OP3'], x: 2, y: 1},
      'OP3': {modulatedBy: [], x: 2, y: 2, feedbackFrom: 'OP3'},  
      'OP4': {modulatedBy: ['OP5', 'OP6'], x: 1, y: 0},
      'OP5': {modulatedBy: [], x: 0, y: 1},
      'OP6': {modulatedBy: [], x: 1, y: 1}},
  11: {
      'OP1': {modulatedBy: ['OP2'], x: 2, y: 0},
      'OP2': {modulatedBy: ['OP3'], x: 2, y: 1},
      'OP3': {modulatedBy: [], x: 2, y: 2},
      'OP4': {modulatedBy: ['OP5', 'OP6'], x: 1, y: 0},
      'OP5': {modulatedBy: [], x: 0, y: 1},
      'OP6': {modulatedBy: [], x: 1, y: 1, feedbackFrom: 'OP6'}},
  12: {
      'OP1': {modulatedBy: ['OP2'], x: 3, y: 0},
      'OP2': {modulatedBy: [], x: 3, y: 1},
      'OP3': {modulatedBy: ['OP4', 'OP5', 'OP6'], x: 1, y: 0},
      'OP4': {modulatedBy: [], x: 0, y: 1},
      'OP5': {modulatedBy: [], x: 1, y: 1},
      'OP6': {modulatedBy: [], x: 2, y: 1, feedbackFrom: 'OP6'}},
  13: {
      'OP3': {modulatedBy: ['OP4', 'OP5', 'OP6'], x: 1, y: 0},
      'OP4': {modulatedBy: [], x: 0, y: 1},
      'OP5': {modulatedBy: [], x: 1, y: 1},
      'OP6': {modulatedBy: [], x: 2, y: 1, feedbackFrom: 'OP6'},
      'OP1': {modulatedBy: ['OP2'], x: 3, y: 0},
      'OP2': {modulatedBy: [], x: 3, y: 1}},  
  14: {
      'OP1': {modulatedBy: ['OP2'], x: 0, y: 0},
      'OP2': {modulatedBy: [], x: 0, y: 1},
      'OP3': {modulatedBy: ['OP4'], x: 1, y: 0},
      'OP4': {modulatedBy: ['OP5', 'OP6'], x: 1, y: 1},
      'OP5': {modulatedBy: [], x: 0, y: 2},
      'OP6': {modulatedBy: [], x: 1, y: 2, feedbackFrom: 'OP6'}},
  15: {
      'OP1': {modulatedBy: ['OP2'], x: 0, y: 0},
      'OP2': {modulatedBy: [], x: 0, y: 1, feedbackFrom: 'OP2'},
      'OP3': {modulatedBy: ['OP4'], x: 1, y: 0},
      'OP4': {modulatedBy: ['OP5', 'OP6'], x: 1, y: 1},
      'OP5': {modulatedBy: [], x: 0, y: 2},
      'OP6': {modulatedBy: [], x: 1, y: 2, feedbackFrom: 'OP6'}},
  16: {
      'OP1': {modulatedBy: ['OP2', 'OP3', 'OP5'], x: 1, y: 0},
      'OP2': {modulatedBy: [], x: 0, y: 1},
      'OP3': {modulatedBy: ['OP4'], x: 1, y: 1},
      'OP4': {modulatedBy: [], x: 1, y: 2},
      'OP5': {modulatedBy: ['OP6'], x: 2, y: 1},
      'OP6': {modulatedBy: [], x: 2, y: 2, feedbackFrom: 'OP6'}},
  17: {
      'OP1': {modulatedBy: ['OP2', 'OP3', 'OP5'], x: 1, y: 0},
      'OP2': {modulatedBy: [], x: 0, y: 1, feedbackFrom: 'OP2'},
      'OP3': {modulatedBy: ['OP4'], x: 1, y: 1},
      'OP4': {modulatedBy: [], x: 1, y: 2},
      'OP5': {modulatedBy: ['OP6'], x: 2, y: 1},
      'OP6': {modulatedBy: [], x: 2, y: 2}},
  18: {
      'OP1': {modulatedBy: ['OP2', 'OP3', 'OP4'], x: 1, y: 0},
      'OP2': {modulatedBy: [], x: 0, y: 1},
      'OP3': {modulatedBy: [], x: 1, y: 1, feedbackFrom: 'OP3'},
      'OP4': {modulatedBy: ['OP5'], x: 2, y: 1},
      'OP5': {modulatedBy: ['OP6'], x: 2, y: 2},
      'OP6': {modulatedBy: [], x: 2, y: 3}},
  19: {
      'OP1': {modulatedBy: ['OP2'], x: 0, y: 0},
      'OP2': {modulatedBy: ['OP3'], x: 0, y: 1},
      'OP3': {modulatedBy: [], x: 0, y: 2},
      'OP4': {modulatedBy: ['OP6'], x: 1, y: 0},
      'OP5': {modulatedBy: ['OP6'], x: 2, y: 0},
      'OP6': {modulatedBy: [], x: 1, y: 1, feedbackFrom: 'OP6'}},
  20: {
      'OP1': {modulatedBy: ['OP3'], x: 0, y: 0},
      'OP2': {modulatedBy: ['OP3'], x: 1, y: 0},
      'OP3': {modulatedBy: [], x: 0, y: 1, feedbackFrom: 'OP3'},
      'OP4': {modulatedBy: ['OP5', 'OP6'], x: 2, y: 0},
      'OP5': {modulatedBy: [], x: 1, y: 1},
      'OP6': {modulatedBy: [], x: 2, y: 1}},
  21: {
      'OP1': {modulatedBy: ['OP3'], x: 0, y: 0},
      'OP2': {modulatedBy: ['OP3'], x: 1, y: 0},
      'OP3': {modulatedBy: [], x: 0, y: 1, feedbackFrom: 'OP3'},
      'OP4': {modulatedBy: ['OP6'], x: 2, y: 0},
      'OP5': {modulatedBy: ['OP6'], x: 3, y: 0},
      'OP6': {modulatedBy: [], x: 2, y: 1}},
  22: {
      'OP1': {modulatedBy: ['OP2'], x: 0, y: 0},
      'OP2': {modulatedBy: [], x: 0, y: 1},
      'OP3': {modulatedBy: ['OP6'], x: 1, y: 0},
      'OP4': {modulatedBy: ['OP6'], x: 2, y: 0},
      'OP5': {modulatedBy: ['OP6'], x: 3, y: 0},
      'OP6': {modulatedBy: [], x: 2, y: 1, feedbackFrom: 'OP6'}},
  23: {
      'OP1': {modulatedBy: [], x: 0, y: 0},
      'OP2': {modulatedBy: ['OP3'], x: 1, y: 0},
      'OP3': {modulatedBy: [], x: 1, y: 1},
      'OP4': {modulatedBy: ['OP6'], x: 2, y: 0},
      'OP5': {modulatedBy: ['OP6'], x: 3, y: 0},
      'OP6': {modulatedBy: [], x: 2, y: 1, feedbackFrom: 'OP6'}},
  24: {
      'OP1': {modulatedBy: [], x: 0, y: 0},
      'OP2': {modulatedBy: [], x: 1, y: 0},
      'OP3': {modulatedBy: ['OP6'], x: 2, y: 0},
      'OP4': {modulatedBy: ['OP6'], x: 3, y: 0},
      'OP5': {modulatedBy: ['OP6'], x: 4, y: 0},
      'OP6': {modulatedBy: [], x: 3, y: 1, feedbackFrom: 'OP6'}},
  25: {
      'OP1': {modulatedBy: [], x: 0, y: 0},
      'OP2': {modulatedBy: [], x: 1, y: 0},
      'OP3': {modulatedBy: [], x: 2, y: 0},
      'OP4': {modulatedBy: ['OP6'], x: 3, y: 0},
      'OP5': {modulatedBy: ['OP6'], x: 4, y: 0},
      'OP6': {modulatedBy: [], x: 3, y: 1, feedbackFrom: 'OP6'}},
  26: {
      'OP1': {modulatedBy: [], x: 0, y: 0},
      'OP2': {modulatedBy: ['OP3'], x: 1, y: 0},
      'OP3': {modulatedBy: [], x: 1, y: 1},
      'OP4': {modulatedBy: ['OP5', 'OP6'], x: 3, y: 0},
      'OP5': {modulatedBy: [], x: 2, y: 1},
      'OP6': {modulatedBy: [], x: 3, y: 1, feedbackFrom: 'OP6'}},
  27: {
      'OP1': {modulatedBy: [], x: 0, y: 0},
      'OP2': {modulatedBy: ['OP3'], x: 1, y: 0},
      'OP3': {modulatedBy: [], x: 1, y: 1, feedbackFrom: 'OP3'},
      'OP4': {modulatedBy: ['OP5', 'OP6'], x: 3, y: 0},
      'OP5': {modulatedBy: [], x: 2, y: 1},
      'OP6': {modulatedBy: [], x: 3, y: 1}},
  28: {
      'OP1': {modulatedBy: ['OP2'], x: 0, y: 0},
      'OP2': {modulatedBy: [], x: 0, y: 1},
      'OP3': {modulatedBy: ['OP4'], x: 1, y: 0},
      'OP4': {modulatedBy: ['OP5'], x: 1, y: 1},
      'OP5': {modulatedBy: [], x: 1, y: 2, feedbackFrom: 'OP5'},
      'OP6': {modulatedBy: [], x: 2, y: 0}},
  29: {
      'OP1': {modulatedBy: [], x: 0, y: 0},
      'OP2': {modulatedBy: [], x: 1, y: 0},
      'OP3': {modulatedBy: ['OP4'], x: 2, y: 0},
      'OP4': {modulatedBy: [], x: 2, y: 1},
      'OP5': {modulatedBy: ['OP6'], x: 3, y: 0},
      'OP6': {modulatedBy: [], x: 3, y: 1, feedbackFrom: 'OP6'}},
  30: {
      'OP1': {modulatedBy: [], x: 0, y: 0},
      'OP2': {modulatedBy: [], x: 1, y: 0},
      'OP3': {modulatedBy: ['OP4'], x: 2, y: 0},
      'OP4': {modulatedBy: ['OP5'], x: 2, y: 1},
      'OP5': {modulatedBy: [], x: 2, y: 2, feedbackFrom: 'OP5'},
      'OP6': {modulatedBy: [], x: 3, y: 0}},
  31: {
      'OP1': {modulatedBy: [], x: 0, y: 0},
      'OP2': {modulatedBy: [], x: 1, y: 0},
      'OP3': {modulatedBy: [], x: 2, y: 0},
      'OP4': {modulatedBy: [], x: 3, y: 0},
      'OP5': {modulatedBy: ['OP6'], x: 4, y: 0},
      'OP6': {modulatedBy: [], x: 4, y: 1, feedbackFrom: 'OP6'}},
  32: {
      'OP1': {modulatedBy: [], x: 0, y: 0},
      'OP2': {modulatedBy: [], x: 1, y: 0},
      'OP3': {modulatedBy: [], x: 2, y: 0},
      'OP4': {modulatedBy: [], x: 3, y: 0},
      'OP5': {modulatedBy: [], x: 4, y: 0},
      'OP6': {modulatedBy: [], x: 5, y: 0, feedbackFrom: 'OP6'}},
};