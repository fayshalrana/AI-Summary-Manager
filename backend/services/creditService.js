const User = require('../models/User');

class CreditService {
  /**
   * Check if user has sufficient credits
   * @param {string} userId - User ID
   * @param {number} requiredCredits - Number of credits required (default: 1)
   * @returns {Promise<boolean>} - True if user has sufficient credits
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
   * @param {string} userId - User ID
   * @param {number} creditsToDeduct - Number of credits to deduct (default: 1)
   * @returns {Promise<Object>} - Updated user object with remaining credits
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
   * @param {string} userId - User ID
   * @param {number} creditsToAdd - Number of credits to add
   * @returns {Promise<Object>} - Updated user object with new credit balance
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
   * @param {string} userId - User ID
   * @returns {Promise<number>} - Current credit balance
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
   * @param {string} userId - User ID
   * @param {Function} summarizationFunction - Function that performs summarization
   * @returns {Promise<Object>} - Result of summarization with credit info
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