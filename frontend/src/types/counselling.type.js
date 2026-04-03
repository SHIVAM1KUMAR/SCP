/**
 * @file counselling.type.js
 * JSDoc typedefs for counselling forms and helpers.
 */

/**
 * @typedef {Object} CounsellorAvailabilitySlot
 * @property {string} day
 * @property {string} startTime
 * @property {string} endTime
 */

/**
 * @typedef {Object} CounsellorFormValues
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string} department
 * @property {string} status
 * @property {CounsellorAvailabilitySlot[]} availability
 */

/**
 * @typedef {Object} SessionFormValues
 * @property {string} counsellorId
 * @property {string} studentId
 * @property {string} scheduledDate
 * @property {string} scheduledTime
 * @property {string} notes
 * @property {string} status
 */

export {};
