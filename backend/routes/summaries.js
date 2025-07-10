const express = require('express');
const multer = require('multer');
const Summary = require('../models/Summary');
const User = require('../models/User');
const aiService = require('../services/aiService');
const fileService = require('../services/fileService');
const CreditService = require('../services/creditService');
const { 
  authenticateToken, 
  requireAdmin, 
  requireEditor, 
  requireReviewer,
  authorizeOwnership 
} = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.txt', '.docx'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type. Allowed types: ${allowedTypes.join(', ')}`));
    }
  }
});

// Apply authentication to all routes
router.use(authenticateToken);

// GET /api/summaries - Get summaries (user-specific or all for reviewers)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    let summaries;
    let totalCount;

    // Always return all summaries, regardless of user role
    const query = {};
    if (search) {
      query.$or = [
        { originalText: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } }
      ];
    }
    totalCount = await Summary.countDocuments(query);
    summaries = await Summary.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('userId', 'name email');

    res.json({
      summaries,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
        hasNext: pageNum * limitNum < totalCount,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get summaries error:', error);
    res.status(500).json({ error: 'Failed to get summaries' });
  }
});

// POST /api/summaries - Create new summary from text
router.post('/', async (req, res) => {
  try {
    const { text, prompt, model } = req.body;

    // Validate input
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Validate text using AI service
    const textValidation = aiService.validateText(text);
    if (!textValidation.valid) {
      return res.status(400).json({ error: textValidation.error });
    }

    // Check if user has sufficient credits
    const hasCredits = await CreditService.hasSufficientCredits(req.user._id);
    if (!hasCredits) {
      return res.status(400).json({ 
        error: 'Insufficient credits. Please recharge your account.' 
      });
    }

    // Generate summary using AI service (Gemini only)
    const aiResult = await aiService.generateSummary(text, prompt, model);

    // Create summary record
    const wordCount = {
      original: aiService.validateText(text).wordCount,
      summary: aiService.validateText(aiResult.summary).wordCount
    };
    const summary = new Summary({
      userId: req.user._id,
      originalText: text,
      summary: aiResult.summary,
      wordCount,
      prompt: prompt || 'Summarize the following text in a clear and concise manner:',
      aiProvider: 'gemini',
      model: model || 'gemini-1.5-flash-latest',
      status: 'completed',
      processingTime: aiResult.processingTime,
      creditsUsed: 1
    });

    await summary.save();

    // Deduct credits
    await CreditService.deductCredits(req.user._id);

    res.status(201).json({
      message: 'Summary created successfully',
      summary,
      aiInfo: {
        provider: aiResult.provider,
        model: aiResult.model,
        processingTime: aiResult.processingTime,
        usage: aiResult.usage
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to create summary' });
  }
});

// POST /api/summaries/upload - Create summary from file upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { prompt, model } = req.body;

    // Validate file
    const fileValidation = fileService.validateFile(req.file);
    if (!fileValidation.valid) {
      return res.status(400).json({ error: fileValidation.error });
    }

    // Extract text from file
    const fileResult = await fileService.extractTextFromFile(req.file);

    // Check if user has sufficient credits
    const hasCredits = await CreditService.hasSufficientCredits(req.user._id);
    if (!hasCredits) {
      return res.status(400).json({ 
        error: 'Insufficient credits. Please recharge your account.' 
      });
    }

    // Generate summary using AI service (Gemini only)
    const aiResult = await aiService.generateSummary(
      fileResult.text, 
      prompt, 
      model
    );

    // Create summary record (file upload)
    const wordCountFile = {
      original: aiService.validateText(fileResult.text).wordCount,
      summary: aiService.validateText(aiResult.summary).wordCount
    };
    const summary = new Summary({
      userId: req.user._id,
      originalText: fileResult.text,
      summary: aiResult.summary,
      wordCount: wordCountFile,
      prompt: prompt || 'Summarize the following text in a clear and concise manner:',
      aiProvider: 'gemini',
      model: model || 'gemini-1.5-flash-latest',
      status: 'completed',
      processingTime: aiResult.processingTime,
      creditsUsed: 1
    });

    await summary.save();

    // Deduct credits
    await CreditService.deductCredits(req.user._id);

    res.status(201).json({
      message: 'Summary created successfully',
      summary,
      aiInfo: {
        provider: aiResult.provider,
        model: aiResult.model,
        processingTime: aiResult.processingTime,
        usage: aiResult.usage
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to create summary from file' });
  }
});

// PUT /api/summaries/:id - Update summary (regenerate with new prompt)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { prompt, model } = req.body;

    // Find summary and check ownership
    const summary = await Summary.findById(id);
    if (!summary) {
      return res.status(404).json({ error: 'Summary not found' });
    }

    // Check if user owns the summary or is admin/editor
    if (summary.userId.toString() !== req.user._id.toString() && 
        !['admin', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied. You can only edit your own summaries.' 
      });
    }

    // Check if user has sufficient credits for regeneration
    const hasCredits = await CreditService.hasSufficientCredits(req.user._id);
    if (!hasCredits) {
      return res.status(400).json({ 
        error: 'Insufficient credits. Please recharge your account.' 
      });
    }

    // Generate new summary (Gemini only)
    const aiResult = await aiService.generateSummary(
      summary.originalText,
      prompt || summary.prompt,
      model || summary.model
    );

    // Update summary
    summary.summary = aiResult.summary;
    summary.prompt = prompt || summary.prompt;
    summary.aiProvider = 'gemini';
    summary.model = model || summary.model;
    summary.processingTime = aiResult.processingTime;
    summary.creditsUsed += 1;
    summary.updatedAt = new Date();

    await summary.save();

    // Deduct credits
    await CreditService.deductCredits(req.user._id);

    res.json({
      message: 'Summary updated successfully',
      summary,
      aiInfo: {
        provider: aiResult.provider,
        model: aiResult.model,
        processingTime: aiResult.processingTime,
        usage: aiResult.usage
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update summary' });
  }
});

// DELETE /api/summaries/:id - Delete summary
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const summary = await Summary.findById(id);
    if (!summary) {
      return res.status(404).json({ error: 'Summary not found' });
    }

    // Check if user owns the summary or is admin/editor
    if (summary.userId.toString() !== req.user._id.toString() && 
        !['admin', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied. You can only delete your own summaries.' 
      });
    }

    await Summary.findByIdAndDelete(id);

    res.json({ message: 'Summary deleted successfully' });

  } catch (error) {
    console.error('Delete summary error:', error);
    res.status(500).json({ error: 'Failed to delete summary' });
  }
});

// GET /api/summaries/:id - Get specific summary
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const summary = await Summary.findById(id).populate('userId', 'name email');
    if (!summary) {
      return res.status(404).json({ error: 'Summary not found' });
    }

    // Check if user owns the summary or has review access
    if (summary.userId._id.toString() !== req.user._id.toString() && 
        !['admin', 'editor', 'reviewer'].includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied. You can only view your own summaries.' 
      });
    }

    res.json({ summary });

  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Failed to get summary' });
  }
});

// GET /api/summaries/ai/models - Get available AI models
router.get('/ai/models', (req, res) => {
  try {
    const models = aiService.getAvailableModels();
    const config = aiService.checkConfiguration();
    
    res.json({
      models,
      configuration: config
    });
  } catch (error) {
    console.error('Get AI models error:', error);
    res.status(500).json({ error: 'Failed to get AI models' });
  }
});

// GET /api/summaries/file/types - Get supported file types
router.get('/file/types', (req, res) => {
  try {
    const supportedTypes = fileService.getSupportedFileTypes();
    res.json({ supportedTypes });
  } catch (error) {
    console.error('Get file types error:', error);
    res.status(500).json({ error: 'Failed to get file types' });
  }
});

module.exports = router; 