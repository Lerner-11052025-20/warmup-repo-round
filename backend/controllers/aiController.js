const axios = require('axios');
const User = require('../models/User');
const Expense = require('../models/Expense');

/**
 * @desc Get AI chat completions from OpenRouter
 * @route POST /api/ai/chat
 * @access Private
 */
exports.getAIChatResponse = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!process.env.OPENROUTER_API_KEY) {
      console.error('CRITICAL: OPENROUTER_API_KEY is missing from .env');
    } else {
      console.log(`SmartFlow AI: API Key loaded (starts with: ${process.env.OPENROUTER_API_KEY.substring(0, 8)}...)`);
    }

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Context Gathering: Fetching some stats to provide more intelligent responses
    const expenseCount = await Expense.countDocuments({ userId });
    const pendingApprovals = userRole !== 'employee' ? await Expense.countDocuments({
      companyId: req.user.companyId,
      status: 'pending'
    }) : 0;

    const systemPrompt = `You are "SmartFlow AI", a high-end financial assistant for the SmartFlow Reimburse AI platform. 
    A user with role "${userRole}" is asking a question.
    Context:
    - User Role: ${userRole}
    - Total Expenses created by this user: ${expenseCount}
    ${userRole !== 'employee' ? `- Total Pending Approvals for their department/company: ${pendingApprovals}` : ''}
    
    Instructions:
    1. Be professional, concise, and helpful.
    2. Focus on expense management, reimbursement policies, and dashboard analytics.
    3. Use markdown for formatting (bold, lists, etc.) to ensure a premium UI experience.
    4. If the user asks for actions you can't perform (like deleting a user), kindly explain that you are an analysis and guidance assistant.
    5. Always refer to yourself as "SmartFlow Intelligence" or simply "SmartFlow AI".`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-5), // Keep last 5 messages for context
      { role: "user", content: message }
    ];

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: "openai/gpt-4o-mini",
      messages: messages,
      temperature: 0.7,
      max_tokens: 500
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'SmartFlow AI Assistant'
      }
    });

    const aiMessage = response.data.choices[0].message.content;

    res.status(200).json({
      success: true,
      data: {
        message: aiMessage,
        role: 'assistant'
      }
    });

  } catch (error) {
    // Log the FULL error for backend diagnostics
    console.error('--- OPENROUTER PROVIDER ERROR ---');
    console.error(error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: 'SmartFlow AI service is temporarily unavailable. Please try again later.'
    });
  }
};
