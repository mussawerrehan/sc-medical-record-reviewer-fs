const fs = require('fs').promises;
const path = require('path');
const NodeCache = require('node-cache');

// Cache configuration (1 hour TTL)
const cache = new NodeCache({
  stdTTL: 3600,
  checkperiod: 120
});

class CPTService {
  constructor() {
    this.dataPath = process.env.CPT_MOCK_DATA_PATH;
    this.cptData = null;
  }

  /**
   * Initialize CPT data from JSON file
   */
  async init() {
    try {
      if (this.cptData) return;

      const cachedData = cache.get('cptData');
      if (cachedData) {
        this.cptData = cachedData;
        return;
      }

      const data = await fs.readFile(this.dataPath, 'utf8');
      this.cptData = JSON.parse(data);
      cache.set('cptData', this.cptData);
    } catch (error) {
      throw new Error(`Failed to initialize CPT data: ${error.message}`);
    }
  }

  /**
   * Search for CPT codes
   * @param {string} query - Search term (code or description)
   * @param {number} maxResults - Maximum number of results to return
   * @returns {Promise<Array>} Array of matching CPT codes with descriptions
   */
  async searchCodes(query, maxResults = 10) {
    try {
      await this.init();

      const searchTerm = query.toLowerCase();
      const results = Object.entries(this.cptData)
        .filter(([code, data]) => 
          code.toLowerCase().includes(searchTerm) ||
          data.description.toLowerCase().includes(searchTerm)
        )
        .map(([code, data]) => ({
          code,
          description: data.description,
          category: data.category,
          fee: data.fee
        }))
        .slice(0, maxResults);

      return results;
    } catch (error) {
      throw new Error(`CPT search failed: ${error.message}`);
    }
  }

  /**
   * Validate a specific CPT code
   * @param {string} code - CPT code to validate
   * @returns {Promise<Object>} Validation result with code and description
   */
  async validateCode(code) {
    try {
      await this.init();

      const codeData = this.cptData[code];

      if (!codeData) {
        return {
          isValid: false,
          message: 'Invalid CPT code'
        };
      }

      return {
        isValid: true,
        code,
        description: codeData.description,
        category: codeData.category,
        fee: codeData.fee
      };
    } catch (error) {
      throw new Error(`CPT validation failed: ${error.message}`);
    }
  }

  /**
   * Get description for a specific CPT code
   * @param {string} code - CPT code
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
      throw new Error(`Failed to get CPT description: ${error.message}`);
    }
  }

  /**
   * Validate multiple CPT codes
   * @param {Array<string>} codes - Array of CPT codes
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
      throw new Error(`Batch CPT validation failed: ${error.message}`);
    }
  }

  /**
   * Get fee for a specific CPT code
   * @param {string} code - CPT code
   * @returns {Promise<number>} Fee amount
   */
  async getFee(code) {
    try {
      const validation = await this.validateCode(code);

      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      return validation.fee;
    } catch (error) {
      throw new Error(`Failed to get CPT fee: ${error.message}`);
    }
  }

  /**
   * Reload CPT data from file
   * @returns {Promise<void>}
   */
  async reloadData() {
    try {
      this.cptData = null;
      cache.del('cptData');
      await this.init();
    } catch (error) {
      throw new Error(`Failed to reload CPT data: ${error.message}`);
    }
  }
}

module.exports = new CPTService(); 