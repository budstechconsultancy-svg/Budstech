# TutorAI-Voice

An empathetic, human-like AI tutor web application with voice interaction capabilities.

## Features

- **User Authentication**: Secure email/password login and registration
- **Voice Interaction**: Real-time speech recognition and text-to-speech
- **Multiple Learning Modes**:
  - Chat Mode: Conversational learning interface
  - Whiteboard Mode: Real-time animated whiteboard with teacher-style annotations
  - Code Mode: Live SQL and code demonstrations with commentary
- **Settings Management**: Customize TTS provider, speaking rate, and pitch
- **Document Upload**: Upload and manage subject documents for RAG (Retrieval-Augmented Generation)
- **Bookmarks**: Save important concepts for later review
- **Adaptive Learning**: Adjusts explanation depth for Grade 5, Grade 12, or Advanced levels

## Voice Commands

The application recognizes the following voice commands:

- "Show whiteboard" → Switch to Animated Whiteboard Mode
- "Switch to code mode" → Switch to Code/Demo Mode
- "I don't understand" → Request clarification
- "Bookmark this" → Save current concept
- "Simplify explanation" → Get a simpler explanation
- "Go deeper" → Get more in-depth explanation

## Technology Stack

### Backend
- **Node.js** with Express
- **SQLite** database
- **JWT** authentication
- **OpenAI API** for LLM responses
- **YAML** configuration

### Frontend
- Vanilla JavaScript
- Web Speech API for voice recognition
- Speech Synthesis API for TTS
- HTML5 Canvas for whiteboard

## Installation

1. Clone the repository:
```bash
git clone https://github.com/budstechconsultancy-svg/Budstech.git
cd Budstech
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Configure your `.env` file with required API keys:
```
OPENAI_API_KEY=your-openai-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key (optional)
AWS_POLLY_KEY=your-aws-polly-key (optional)
GOOGLE_TTS_KEY=your-google-tts-key (optional)
```

5. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

6. Open your browser and navigate to:
```
http://localhost:3000
```

## Configuration

### System Prompt

The AI tutor's behavior is configured in `system_prompt.yaml`. This file contains:
- Core behavior instructions
- LLM settings (model, temperature, tokens, etc.)
- Voice integration settings
- Whiteboard and code mode guidelines
- Dialogue flow rules

### User Prompt Template

The `user_prompt_template.yaml` file defines how user queries are formatted before being sent to the LLM.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login

### Voice
- `POST /api/voice/query` - Process voice query
- `POST /api/voice/tts` - Generate TTS audio (placeholder)

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update settings

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - Get user documents
- `DELETE /api/documents/:id` - Delete document

### Bookmarks
- `POST /api/bookmarks` - Create bookmark
- `GET /api/bookmarks` - Get user bookmarks
- `DELETE /api/bookmarks/:id` - Delete bookmark

## Database Schema

### Users
- id, email, password_hash, name, grade_level, created_at

### Settings
- id, user_id, tts_provider, speaking_rate, pitch

### Documents
- id, user_id, filename, filepath, uploaded_at

### Bookmarks
- id, user_id, concept, mode, content, created_at

### Sessions
- id, user_id, transcript, mode, created_at

## Usage

### First Time Setup

1. Register a new account with your email and password
2. Select your grade level (Grade 5, Grade 12, or Advanced)
3. Configure your TTS preferences in Settings
4. Upload any subject documents you want the tutor to reference

### Chat Mode

1. Click the microphone button or use quick command buttons
2. Speak your question or type a command
3. The AI tutor will respond with both text and audio
4. View the conversation transcript in the display area

### Whiteboard Mode

1. Say "Show whiteboard" or click the Whiteboard button
2. The tutor will provide visual explanations with animations
3. Draw on the whiteboard to work through problems
4. Download whiteboard notes as PDF

### Code Mode

1. Say "Switch to code mode" or click the Code Mode button
2. The tutor will explain concepts with code examples
3. View pseudocode explanations and runnable code
4. Execute code to see results

## Browser Support

- Chrome/Edge (recommended for full Web Speech API support)
- Firefox (limited speech recognition)
- Safari (limited speech recognition)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.

## Acknowledgments

- OpenAI for GPT-4o LLM
- ElevenLabs, AWS Polly, and Google TTS for voice synthesis options
- Web Speech API for browser-based voice recognition