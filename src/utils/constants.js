// src/utils/constants.js 
/**
 * Constants used throughout the application.
 * @module constants
 */

/**
 * The base URL for the API.
 * @constant API_BASE_URL
 * @type {string}
 */
export const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:4000/api';

/**
 * The Google reCAPTCHA site key.
 * @constant RECAPTCHA_SITE_KEY
 * @type {string}
 */
export const RECAPTCHA_SITE_KEY = import.meta.env.VITE_REACT_APP_RECAPTCHA_SITE_KEY;