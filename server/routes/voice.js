const express = require('express');
const axios = require('axios');
const fs = require('fs');
const yaml = require('yaml');
const path = require('path');
const { getDb } = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Load system prompt
const systemPromptPath = path.join(__dirname, '../../system_prompt.yaml');
const systemPromptData = yaml.parse(fs.readFileSync(systemPromptPath, 'utf8'));

// Load user prompt template
const userPromptPath = path.join(__dirname, '../../user_prompt_template.yaml');
const userPromptTemplate = yaml.parse(fs.readFileSync(userPromptPath, 'utf8'));

// Process voice query
router.post('/query', authenticateToken, async (req, res) => {
  const { transcript, mode, gradeLevel } = req.body;

  if (!transcript) {
    return res.status(400).json({ error: 'Transcript is required' });
  }

  try {
    const db = getDb();

    // Get user's documents
    const documents = await new Promise((resolve, reject) => {
      db.all(
        'SELECT filename FROM documents WHERE user_id = ?',
        [req.user.userId],
        (err, docs) => {
          if (err) reject(err);
          else resolve(docs);
        }
      );
    });

    const docList = documents.map(d => d.filename).join(', ') || 'None';

    // Build user prompt from template
    let userPrompt = userPromptTemplate.user
      .replace('{{uploaded_doc_list}}', docList)
      .replace('{{grade5|grade12|advanced}}', gradeLevel || 'grade12')
      .replace('{{"chat"|"whiteboard"|"code"}}', mode || 'chat')
      .replace("{{student's spoken or typed question}}", transcript);

    // Detect voice commands
    const lowerTranscript = transcript.toLowerCase();
    if (lowerTranscript.includes('show whiteboard')) {
      return res.json({
        action: 'switch_mode',
        mode: 'whiteboard',
        message: 'Switching to whiteboard mode...'
      });
    } else if (lowerTranscript.includes('switch to code mode') || lowerTranscript.includes('code mode')) {
      return res.json({
        action: 'switch_mode',
        mode: 'code',
        message: 'Switching to code mode...'
      });
    } else if (lowerTranscript.includes("i don't understand")) {
      userPrompt = "The student said they don't understand. Ask 'Which part should I clarify?' and prepare to re-explain the concept.";
    } else if (lowerTranscript.includes('bookmark this')) {
      return res.json({
        action: 'bookmark',
        message: 'Concept bookmarked for later review.'
      });
    } else if (lowerTranscript.includes('simplify')) {
      userPrompt += "\n\nPlease simplify the explanation further.";
    } else if (lowerTranscript.includes('go deeper')) {
      userPrompt += "\n\nPlease provide a more in-depth explanation.";
    }

    // Call OpenAI API
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: systemPromptData.llm_settings.model,
        messages: [
          { role: 'system', content: systemPromptData.system },
          { role: 'user', content: userPrompt }
        ],
        temperature: systemPromptData.llm_settings.temperature,
        max_tokens: systemPromptData.llm_settings.max_tokens,
        top_p: systemPromptData.llm_settings.top_p,
        frequency_penalty: systemPromptData.llm_settings.frequency_penalty,
        presence_penalty: systemPromptData.llm_settings.presence_penalty
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const llmReply = openaiResponse.data.choices[0].message.content;

    // Wrap in SSML
    const ssmlContent = `<speak>${llmReply}</speak>`;

    // Save session
    db.run(
      'INSERT INTO sessions (user_id, transcript, mode) VALUES (?, ?, ?)',
      [req.user.userId, transcript + '\n\nResponse: ' + llmReply, mode || 'chat']
    );

    res.json({
      action: 'respond',
      text: llmReply,
      ssml: ssmlContent,
      mode: mode || 'chat'
    });

  } catch (error) {
    console.error('Error processing voice query:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to process query',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// Get TTS audio (placeholder for actual TTS integration)
router.post('/tts', authenticateToken, async (req, res) => {
  const { text, provider, rate, pitch } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  // This is a placeholder - actual TTS integration would vary by provider
  // For ElevenLabs, AWS Polly, or Google TTS
  
  try {
    let audioUrl = null;

    switch (provider) {
      case 'ElevenLabs':
        // Placeholder for ElevenLabs integration
        audioUrl = '/api/voice/tts-placeholder';
        break;
      case 'AWS Polly':
        // Placeholder for AWS Polly integration
        audioUrl = '/api/voice/tts-placeholder';
        break;
      case 'Google TTS':
        // Placeholder for Google TTS integration
        audioUrl = '/api/voice/tts-placeholder';
        break;
      default:
        audioUrl = '/api/voice/tts-placeholder';
    }

    res.json({
      audioUrl,
      message: 'TTS audio generated (placeholder)'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate TTS audio' });
  }
});

module.exports = router;
