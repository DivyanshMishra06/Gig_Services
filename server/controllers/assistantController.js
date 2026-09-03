const { runAssistant } = require('../services/assistantService');

exports.chat = async (req, res) => {
  try {
    const raw = req.body?.message;
    if (!raw || !String(raw).trim()) {
      return res.status(400).json({ message: 'Please type a message.' });
    }

    const result = await runAssistant({
      message: String(raw).trim().slice(0, 2000),
      history: req.body?.history,
      user: req.user || null
    });

    res.json(result);
  } catch (error) {
    if (error.code === 'AI_NOT_CONFIGURED') {
      return res.status(503).json({
        message: 'The AI assistant is not available right now. Please try again later.'
      });
    }
    console.error('Assistant error:', error.code || error.message);
    res.status(502).json({
      message: 'I had trouble responding just now. Please try again in a moment.'
    });
  }
};
