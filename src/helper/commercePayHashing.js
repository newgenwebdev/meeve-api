const crypto = require('crypto');

/**
 * Recursively sorts object properties in ascending order
 * @param {Object} obj - The object to sort
 * @returns {Object} - New object with sorted properties
 */
function sortObjectKeys(obj) {
  if (obj === null || typeof obj !== 'object' || obj instanceof Date) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  
  const sortedObj = {};
  const keys = Object.keys(obj).sort();
  
  for (const key of keys) {
    sortedObj[key] = sortObjectKeys(obj[key]);
  }
  
  return sortedObj;
}

/**
 * Generates HMAC-SHA256 signature for API requests
 * @param {string} requestUrl - The API endpoint URL
 * @param {Object} requestBody - The request body object
 * @param {string} secretKey - The secret key for HMAC
 * @returns {string} - The generated HMAC-SHA256 signature
 */
function generateHMACSignature(requestBody, secretKey, requestUrl) {
  // Step 1: Sort the request body object by property names in ascending order
//   const sortedData = sortObjectKeys(requestBody);
  const sortedData = requestBody;
  // Step 2: Convert sorted object to JSON string
  const jsonString = JSON.stringify(sortedData);
  
  // Step 3: Combine request URL and JSON string
  const dataToSign = requestUrl + jsonString;

  // Step 4: Convert to lowercase
  const lowercaseData = dataToSign.toLowerCase();
//   const lowercaseData = 'https://staging-payments.commerce.asia/api/services/app/paymentgateway/requestpayment{"amount":100,"callbackurl":"string","channelid":2,"currencycode":"myr","description":"order details","ipaddress":"127.0.0.1","customer":{"email":"test@commerce.asia","mobileno":"string","name":"string","username":"string"},"providerchannelid":"test0021","referencecode":"string","returnurl":"https://www.google.com","timestamp":1621851652617,"useragent":"string"}'
//   const secretKey = 'KPksB8uuh9ZW2VFg';
  console.log("secretKey", secretKey);
  console.log("lowercaseData", lowercaseData);

  // Step 5: Generate HMAC-SHA256 hash
//   const hmac = crypto.createHmac('sha256', 'KPksB8uuh9ZW2VFg');
const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(lowercaseData);
  const signature = hmac.digest('hex');
  
  return signature;
}


// Export functions for use in other modules
module.exports = {
  generateHMACSignature,
  sortObjectKeys,
};