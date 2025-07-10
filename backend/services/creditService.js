const User = require('../models/User');

class CreditService {
  /**
   * Check if user has sufficient credits
   * @param {string} userId 
   * @param {number} requiredCredits
   */
  static async hasSufficientCredits(userId, requiredCredits = 1) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user.credits >= requiredCredits;
    } catch (error) {
      console.error('Error checking credits:', error);
      throw error;
    }
  }

  /**
   * Deduct credits from user account
   * @param {string} userId 
   * @param {number} creditsToDeduct 
   * @returns {Promise<Object>} 
   */
  static async deductCredits(userId, creditsToDeduct = 1) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.credits < creditsToDeduct) {
        throw new Error('Insufficient credits');
      }

      user.credits -= creditsToDeduct;
      await user.save();

      return {
        success: true,
        remainingCredits: user.credits,
        deductedCredits: creditsToDeduct
      };
    } catch (error) {
      console.error('Error deducting credits:', error);
      throw error;
    }
  }

  /**
   * Add credits to user account
   * @param {string} userId 
   * @param {number} creditsToAdd 
   * @returns {Promise<Object>} 
   */
  static async addCredits(userId, creditsToAdd) {
    try {
      if (creditsToAdd <= 0) {
        throw new Error('Credits to add must be positive');
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.credits += creditsToAdd;
      await user.save();

      return {
        success: true,
        newCredits: user.credits,
        addedCredits: creditsToAdd
      };
    } catch (error) {
      console.error('Error adding credits:', error);
      throw error;
    }
  }

  /**
   * Get user's current credit balance
   * @param {string} userId 
   * @returns {Promise<number>} 
   */
  static async getCreditBalance(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user.credits;
    } catch (error) {
      console.error('Error getting credit balance:', error);
      throw error;
    }
  }

  /**
   * Process summarization with credit deduction
   * @param {string} userId 
   * @param {Function} summarizationFunction 
   * @returns {Promise<Object>} 
   */
  static async processWithCredits(userId, summarizationFunction) {
    try {
      // Check if user has sufficient credits
      const hasCredits = await this.hasSufficientCredits(userId);
      if (!hasCredits) {
        throw new Error('Insufficient credits for summarization');
      }

      // Perform summarization
      const result = await summarizationFunction();

      // Deduct credits after successful summarization
      const creditResult = await this.deductCredits(userId);

      return {
        ...result,
        credits: {
          deducted: creditResult.deductedCredits,
          remaining: creditResult.remainingCredits
        }
      };
    } catch (error) {
      console.error('Error processing with credits:', error);
      throw error;
    }
  }
}

module.exports = CreditService; 