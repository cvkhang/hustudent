import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitization utilities for frontend
 * Protects against XSS attacks by cleaning user-generated content
 */

/**
 * Default DOMPurify configuration
 * Allows most safe HTML but removes scripts, iframes, and dangerous attributes
 */
const DEFAULT_CONFIG = {
  ALLOWED_TAGS: [
    'b', 'i', 'em', 'strong', 'u', 'a', 'p', 'br',
    'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'span', 'div', 'img'
  ],
  ALLOWED_ATTR: ['href', 'title', 'alt', 'src', 'class'],
  ALLOW_DATA_ATTR: false,
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
};

/**
 * Strict configuration for plain text
 * Removes all HTML tags
 */
const PLAIN_TEXT_CONFIG = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
};

/**
 * Configuration for rich text content (posts, comments)
 */
const RICH_TEXT_CONFIG = {
  ...DEFAULT_CONFIG,
  ALLOWED_TAGS: [
    ...DEFAULT_CONFIG.ALLOWED_TAGS,
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ],
};

/**
 * Sanitize HTML string
 * @param {string} dirty - The dirty HTML string
 * @param {object} config - Custom DOMPurify configuration
 * @returns {string} - Clean HTML string
 */
export const sanitizeHtml = (dirty, config = DEFAULT_CONFIG) => {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }
  return DOMPurify.sanitize(dirty, config);
};

/**
 * Sanitize to plain text (remove all HTML)
 * @param {string} dirty - The dirty string
 * @returns {string} - Clean plain text
 */
export const sanitizeText = (dirty) => {
  return sanitizeHtml(dirty, PLAIN_TEXT_CONFIG);
};

/**
 * Sanitize rich text content (for posts, comments)
 * @param {string} dirty - The dirty HTML string
 * @returns {string} - Clean HTML string with rich formatting
 */
export const sanitizeRichText = (dirty) => {
  return sanitizeHtml(dirty, RICH_TEXT_CONFIG);
};

/**
 * Sanitize URL
 * @param {string} url - The URL to sanitize
 * @returns {string} - Clean URL or empty string if invalid
 */
export const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Remove javascript: protocol and other dangerous protocols
  const cleaned = url.trim().toLowerCase();
  if (
    cleaned.startsWith('javascript:') ||
    cleaned.startsWith('data:text/html') ||
    cleaned.startsWith('vbscript:')
  ) {
    return '';
  }

  return DOMPurify.sanitize(url, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
};

/**
 * Sanitize user input for display
 * Use this for displaying user names, titles, etc.
 * @param {string} input - User input
 * @returns {string} - Sanitized string
 */
export const sanitizeUserInput = (input) => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Escape HTML entities
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * React component helper - creates safe props for dangerouslySetInnerHTML
 * Only use this when you need to render HTML content
 * @param {string} html - HTML content to sanitize
 * @param {object} config - Custom DOMPurify configuration
 * @returns {object} - Props object for dangerouslySetInnerHTML
 */
export const createSafeHtml = (html, config = DEFAULT_CONFIG) => {
  return {
    __html: sanitizeHtml(html, config)
  };
};

/**
 * Sanitize object properties recursively
 * Useful for sanitizing API response data before display
 * @param {any} obj - Object to sanitize
 * @param {Array<string>} exemptKeys - Keys to skip sanitization (e.g., 'password')
 * @returns {any} - Sanitized object
 */
export const sanitizeObject = (obj, exemptKeys = []) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, exemptKeys));
  }

  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (exemptKeys.includes(key)) {
        sanitized[key] = obj[key];
      } else if (typeof obj[key] === 'string') {
        sanitized[key] = sanitizeText(obj[key]);
      } else if (typeof obj[key] === 'object') {
        sanitized[key] = sanitizeObject(obj[key], exemptKeys);
      } else {
        sanitized[key] = obj[key];
      }
    }
  }

  return sanitized;
};

/**
 * Custom React hook for sanitizing content
 * @param {string} content - Content to sanitize
 * @param {object} config - DOMPurify config
 * @returns {string} - Sanitized content
 */
export const useSanitize = (content, config = DEFAULT_CONFIG) => {
  return sanitizeHtml(content, config);
};

export default {
  sanitizeHtml,
  sanitizeText,
  sanitizeRichText,
  sanitizeUrl,
  sanitizeUserInput,
  createSafeHtml,
  sanitizeObject,
  useSanitize,
  // Export configs for custom usage
  DEFAULT_CONFIG,
  PLAIN_TEXT_CONFIG,
  RICH_TEXT_CONFIG,
};
