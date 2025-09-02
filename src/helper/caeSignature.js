const crypto = require('crypto');

/**
 * Generate a CAE signature for API authentication
 * Following CAE Warehouse API Integration Guide
 * 
 * @param {Object} data - The request payload
 * @param {String} secretKey - The secret key for signing
 * @param {String} apiUrl - Optional custom API URL
 * @returns {String} - The generated signature
 */
const generateCaeSignature = (data, secretKey, apiUrl) => {
  // For validation, if we're using the exact test data, we'll get the expected result
//   const sampleTestData = {
//     "address1": "string",
//     "address2": "string",
//     "address3": "string",
//     "city": "string",
//     "country": "string",
//     "description": "string",
//     "documenturl": "string",
//     "firstname": "string",
//     "itemlist": [
//       {
//         "productid": 1000,
//         "quantity": 1,
//         "sku": "03400001",
//         "unitprice": 10.00
//       }
//     ],
//     "lastname": "string",
//     "phone": "string",
//     "postcode": "string",
//     "referencecode": "string",
//     "remarks": "string",
//     "shippingprovider": "lalamove",
//     "shopid": 13,
//     "state": "string",
//     "timestamp": 1621851652617,
//     "totalprice": 10.00,
//     "trackingnumber": "string"
//   };

  // 1. Get full URL without query string and ensure end of URL without "/"
//   const url =  'https://cae-warehouse-api-staging.azurewebsites.net/api/Order/MerchantCreateOrder';
//   console.log("1. URL:", url);
  
  // Use the sample test data for consistent results
//   const dataToUse = sampleTestData;
  
  // 3. Sort data object properties in ascending order
  const sortObjectKeys = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(sortObjectKeys);
    }
    
    const sortedObj = {};
    const sortedKeys = Object.keys(obj).sort();
    
    sortedKeys.forEach(key => {
      sortedObj[key] = sortObjectKeys(obj[key]);
    });
    
    return sortedObj;
  };
  
  // Sort the provided data
  const sortedData = sortObjectKeys(data);
  console.log("3. Sorted data:", JSON.stringify(sortedData, null, 2));
  
  // 4. Convert to JSON string with manually fixed decimal places
  let jsonStr = JSON.stringify(sortedData);
  
  // This regex pattern finds numeric values after price-related keys and ensures they have 2 decimal places
  const pricePattern = /("(?:unitprice|totalprice|price|amount|shippingamount)"\s*:\s*)(\d+)([,}])/gi;
  jsonStr = jsonStr.replace(pricePattern, '$1$2.00$3');
  
  // Also fix any existing decimal values to ensure they have exactly 2 decimal places
  const decimalPattern = /("(?:unitprice|totalprice|price|amount|shippingamount)"\s*:\s*)(\d+\.\d+)([,}])/gi;
  jsonStr = jsonStr.replace(decimalPattern, (match, prefix, num, suffix) => {
    const fixedNum = parseFloat(num).toFixed(2);
    return `${prefix}${fixedNum}${suffix}`;
  });
  
  console.log("4. JSON string with fixed decimals:", jsonStr);
  
  // 5. Combine URL + JSON
  const combinedString = apiUrl + jsonStr;
  console.log("5. Combined string:", combinedString);
  
  // 6. Convert to lowercase
  const lowercasedString = combinedString.toLowerCase();
  console.log("6. Lowercase string:", lowercasedString);
  
  // Test if our string exactly matches the expected input string from documentation
//   const expectedString = 'https://cae-warehouse-api-staging.azurewebsites.net/api/order/merchantcreateorder{"address1":"string","address2":"string","address3":"string","city":"string","country":"string","description":"string","documenturl":"string","firstname":"string","itemlist":[{"productid":1000,"quantity":1,"sku":"03400001","unitprice":10.00}],"lastname":"string","phone":"string","postcode":"string","referencecode":"string","remarks":"string","shippingprovider":"lalamove","shopid":13,"state":"string","timestamp":1621851652617,"totalprice":10.00,"trackingnumber":"string"}';
  
//   const stringsMatch = lowercasedString === expectedString;
//   console.log("Strings match?", stringsMatch);
  
  // If strings don't match, and we're in test mode, use the exact string from documentation
//   const useExactString = false; // Set to true to force using the expected string from docs
//   const stringToSign = (useExactString || stringsMatch) ? expectedString : lowercasedString;
  const stringToSign =  lowercasedString;

  
//   if (useExactString) {
//     console.log("USING EXACT STRING FROM DOCUMENTATION");
//   }
  console.log("secretKey", secretKey);
  // 7. Generate HMAC-SHA256
//   const key = "9maM2z9zQIhpQkQar6";
  
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(stringToSign)
    .digest('hex');
  
  console.log("7. Generated signature:", signature);
  console.log("Expected signature: 9a383a7e9a8b5b2fc2170ab7a737e513811b13193e66420b1abc9af7c73b192d");
  
  return signature;
};

module.exports = {
  generateCaeSignature
}; 