const HttpService = require('./http.service');

class ICD10Service {
  constructor() {
    this.httpService = new HttpService(process.env.NLM_API_URL);
  }

  /**
   * Search for ICD-10 codes
   * @param {string} query - Search term (code or description)
   * @param {number} maxResults - Maximum number of results to return
   * @returns {Promise<Array>} Array of matching ICD-10 codes with descriptions
   */
  async searchCodes(query, maxResults = 10) {
    try {
      const params = {
        terms: query,
        maxList: maxResults
      };

      const response = await this.httpService.get('', params);

      // NLM API returns an array with 4 elements:
      // [0] = status (success/error)
      // [1] = error message or undefined
      // [2] = array of codes
      // [3] = array of descriptions
      if (!response || !Array.isArray(response) || response.length !== 4) {
        throw new Error('Invalid API response format');
      }

      const [status, error, codes, descriptions] = response;

      if (error) {
        throw new Error(`API Error: ${error}`);
      }

      // Format the response
      return codes.map((code, index) => ({
        code,
        description: descriptions[index]
      }));
    } catch (error) {
      throw new Error(`ICD-10 search failed: ${error.message}`);
    }
  }

  /**
   * Validate a specific ICD-10 code
   * @param {string} code - ICD-10 code to validate
   * @returns {Promise<Object>} Validation result with code and description
   */
  async validateCode(code) {
    try {
      const results = await this.searchCodes(code, 1);

      if (!results.length) {
        return {
          isValid: false,
          message: 'Invalid ICD-10 code'
        };
      }

      const exactMatch = results.find(result => 
        result.code.toLowerCase() === code.toLowerCase()
      );

      if (!exactMatch) {
        return {
          isValid: false,
          message: 'No exact match found for ICD-10 code'
        };
      }

      return {
        isValid: true,
        code: exactMatch.code,
        description: exactMatch.description
      };
    } catch (error) {
      throw new Error(`ICD-10 validation failed: ${error.message}`);
    }
  }

  /**
   * Get description for a specific ICD-10 code
   * @param {string} code - ICD-10 code
   * @returns {Promise<string>} Code description
   */
  async getDescription(code) {
    try {
      const validation = await this.validateCode(code);

      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      return validation.description;
    } catch (error) {
      throw new Error(`Failed to get ICD-10 description: ${error.message}`);
    }
  }

  /**
   * Validate multiple ICD-10 codes
   * @param {Array<string>} codes - Array of ICD-10 codes
   * @returns {Promise<Array>} Array of validation results
   */
  async validateCodes(codes) {
    try {
      const validations = await Promise.all(
        codes.map(code => this.validateCode(code))
      );

      return validations.map((validation, index) => ({
        code: codes[index],
        ...validation
      }));
    } catch (error) {
      throw new Error(`Batch ICD-10 validation failed: ${error.message}`);
    }
  }
}

module.exports = new ICD10Service(); 