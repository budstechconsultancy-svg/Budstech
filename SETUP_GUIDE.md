# TutorAI-Voice Setup Guide

This guide will walk you through setting up and running the TutorAI-Voice application.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- A modern web browser (Chrome recommended)
- OpenAI API key

## Step-by-Step Setup

### 1. Install Node.js and npm

If you don't have Node.js installed, download it from [nodejs.org](https://nodejs.org/).

Verify installation:
```bash
node --version
npm --version
```

### 2. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/budstechconsultancy-svg/Budstech.git
cd Budstech

# Install dependencies
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Required
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional (for enhanced TTS)
ELEVENLABS_API_KEY=your-elevenlabs-key
AWS_POLLY_KEY=your-aws-polly-key
GOOGLE_TTS_KEY=your-google-tts-key

# Server Configuration
PORT=3000
NODE_ENV=development
SESSION_SECRET=change-this-to-a-random-secret
JWT_SECRET=change-this-to-a-random-jwt-secret
```

### 4. Getting API Keys

#### OpenAI API Key (Required)

1. Go to [platform.openai.com](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

#### ElevenLabs API Key (Optional)

1. Go to [elevenlabs.io](https://elevenlabs.io/)
2. Sign up for an account
3. Navigate to your profile settings
4. Copy your API key

#### AWS Polly (Optional)

1. Create an AWS account
2. Enable AWS Polly service
3. Create IAM credentials with Polly access
4. Add credentials to `.env`

#### Google TTS (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Text-to-Speech API
3. Create service account and download credentials
4. Add API key to `.env`

### 5. Run the Application

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

### 6. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## First Time User Setup

1. **Register an Account**
   - Click "Register" on the login page
   - Enter your name, email, and password
   - Select your grade level
   - Click "Register"

2. **Configure Settings**
   - Click "Settings" in the navigation
   - Select your preferred TTS provider
   - Adjust speaking rate and pitch
   - Click "Save Settings"

3. **Upload Documents** (Optional)
   - Click "Documents" in the navigation
   - Choose a document (PDF, DOC, DOCX, TXT, or MD)
   - Click "Upload Document"
   - The tutor will reference these documents in responses

4. **Start Learning**
   - Click "Chat" to return to the main interface
   - Click the microphone button to start speaking
   - Or use the quick command buttons

## Troubleshooting

### Microphone Not Working

1. **Check Browser Permissions**
   - Ensure your browser has microphone access
   - Look for the microphone icon in the address bar
   - Click it and allow microphone access

2. **Browser Compatibility**
   - Chrome and Edge have the best Web Speech API support
   - Firefox and Safari have limited support
   - Try using Chrome if you experience issues

### OpenAI API Errors

1. **Invalid API Key**
   - Verify your API key is correct in `.env`
   - Ensure there are no extra spaces or quotes

2. **Rate Limit Exceeded**
   - Check your OpenAI usage dashboard
   - You may need to upgrade your plan

3. **Insufficient Credits**
   - Add billing information to your OpenAI account
   - Ensure you have available credits

### Database Issues

If you encounter database errors:

```bash
# Remove the database file and restart
rm database.sqlite
npm start
```

This will create a fresh database with all required tables.

### Port Already in Use

If port 3000 is already in use:

```bash
# Change the port in .env
PORT=3001

# Or use a different port temporarily
PORT=3001 npm start
```

## Security Considerations

### For Production Deployment

1. **Change Default Secrets**
   - Update `SESSION_SECRET` in `.env`
   - Update `JWT_SECRET` in `.env`
   - Use long, random strings

2. **Use HTTPS**
   - Deploy behind a reverse proxy (nginx, Apache)
   - Use Let's Encrypt for free SSL certificates

3. **Secure API Keys**
   - Never commit `.env` file to version control
   - Use environment variables in production
   - Consider using a secrets management service

4. **Database Security**
   - Use a production database (PostgreSQL, MySQL)
   - Implement regular backups
   - Use database encryption

5. **Rate Limiting**
   - Implement rate limiting on API endpoints
   - Consider using Redis for session storage

## Advanced Configuration

### Custom System Prompt

Edit `system_prompt.yaml` to customize the AI tutor's behavior:

```yaml
llm_settings:
  model: gpt-4o  # Or gpt-3.5-turbo for lower costs
  temperature: 0.7  # Creativity level (0-1)
  max_tokens: 1500  # Maximum response length
```

### Custom User Prompt Template

Edit `user_prompt_template.yaml` to change how queries are formatted.

## Performance Optimization

### Reduce OpenAI Costs

1. Use `gpt-3.5-turbo` instead of `gpt-4o`
2. Reduce `max_tokens` in system prompt
3. Implement caching for common queries

### Improve Response Time

1. Use a CDN for static files
2. Enable gzip compression
3. Implement Redis caching
4. Use a faster TTS provider

## Support

For issues and questions:
- GitHub Issues: [github.com/budstechconsultancy-svg/Budstech/issues](https://github.com/budstechconsultancy-svg/Budstech/issues)
- Email: support@budstech.com (update with actual email)

## Next Steps

- Explore different learning modes (Chat, Whiteboard, Code)
- Try voice commands for hands-free interaction
- Upload subject documents for personalized tutoring
- Bookmark important concepts for review
- Adjust grade level in settings for age-appropriate explanations
