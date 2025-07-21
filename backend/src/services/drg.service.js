const fs = require('fs').promises;
const path = require('path');
const NodeCache = require('node-cache');

// Cache configuration (1 hour TTL)
const cache = new NodeCache({
  stdTTL: 3600,
  checkperiod: 120
});

class DRGService {
  constructor() {
    this.dataPath = process.env.CMS_DRG_DATA_PATH;
    this.drgData = null;
  }

  /**
   * Initialize DRG data from JSON file
   */
  async init() {
    try {
      if (this.drgData) return;

      const cachedData = cache.get('drgData');
      if (cachedData) {
        this.drgData = cachedData;
        return;
      }

      const data = await fs.readFile(this.dataPath, 'utf8');
      this.drgData = JSON.parse(data);
      cache.set('drgData', this.drgData);
    } catch (error) {
      throw new Error(`Failed to initialize DRG data: ${error.message}`);
    }
  }

  /**
   * Search for DRG codes
   * @param {string} query - Search term (code or description)
   * @param {number} maxResults - Maximum number of results to return
   * @returns {Promise<Array>} Array of matching DRG codes with descriptions
   */
  async searchCodes(query, maxResults = 10) {
    try {
      await this.init();

      const searchTerm = query.toLowerCase();
      const results = Object.entries(this.drgData)
        .filter(([code, description]) => 
          code.toLowerCase().includes(searchTerm) ||
          description.toLowerCase().includes(searchTerm)
        )
        .map(([code, description]) => ({
          code,
          description
        }))
        .slice(0, maxResults);

      return results;
    } catch (error) {
      throw new Error(`DRG search failed: ${error.message}`);
    }
  }

  /**
   * Validate a specific DRG code
   * @param {string} code - DRG code to validate
   * @returns {Promise<Object>} Validation result with code and description
   */
  async validateCode(code) {
    try {
      await this.init();

      const description = this.drgData[code];

      if (!description) {
        return {
          isValid: false,
          message: 'Invalid DRG code'
        };
      }

      return {
        isValid: true,
        code,
        description
      };
    } catch (error) {
      throw new Error(`DRG validation failed: ${error.message}`);
    }
  }

  /**
   * Get description for a specific DRG code
   * @param {string} code - DRG code
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
      throw new Error(`Failed to get DRG description: ${error.message}`);
    }
  }

  /**
   * Validate multiple DRG codes
   * @param {Array<string>} codes - Array of DRG codes
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
      throw new Error(`Batch DRG validation failed: ${error.message}`);
    }
  }

  /**
   * Reload DRG data from file
   * @returns {Promise<void>}
   */
  async reloadData() {
    try {
      this.drgData = null;
      cache.del('drgData');
      await this.init();
    } catch (error) {
      throw new Error(`Failed to reload DRG data: ${error.message}`);
    }
  }
}

module.exports = new DRGService(); 