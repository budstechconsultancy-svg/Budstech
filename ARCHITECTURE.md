# TutorAI-Voice Architecture

This document provides an overview of the TutorAI-Voice application architecture.

## System Overview

TutorAI-Voice is a full-stack web application that provides an AI-powered tutoring experience with voice interaction capabilities. The system consists of a Node.js backend server and a vanilla JavaScript frontend.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
├─────────────────────────────────────────────────────────────┤
│  • HTML/CSS/JavaScript Frontend                              │
│  • Web Speech API (Speech Recognition)                       │
│  • Speech Synthesis API (Text-to-Speech)                     │
│  • Canvas API (Whiteboard)                                   │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST API
                     │
┌────────────────────▼────────────────────────────────────────┐
│                     Server Layer                             │
├─────────────────────────────────────────────────────────────┤
│  Express.js Application                                      │
│  ├─ Authentication Routes (JWT)                              │
│  ├─ Voice Processing Routes                                  │
│  ├─ Settings Routes                                          │
│  ├─ Documents Routes (Multer)                                │
│  └─ Bookmarks Routes                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──────┐ ┌──▼──────┐ ┌──▼──────────┐
│   Database   │ │ OpenAI  │ │ TTS APIs    │
│   (SQLite)   │ │   API   │ │ (Optional)  │
└──────────────┘ └─────────┘ └─────────────┘
```

## Component Architecture

### Frontend Components

#### 1. Authentication Module
- **Login Page**: Email/password authentication
- **Register Page**: New user registration
- **Session Management**: Token storage and validation

#### 2. Voice Interaction Module
- **Speech Recognition**: Web Speech API for voice input
- **Speech Synthesis**: Browser-based TTS
- **Command Processing**: Voice command detection and routing

#### 3. Learning Modes
- **Chat Mode**: Text-based conversation interface
- **Whiteboard Mode**: Canvas-based drawing and annotation
- **Code Mode**: Code demonstration and execution

#### 4. Settings Module
- TTS provider selection
- Speaking rate adjustment
- Pitch adjustment

#### 5. Document Management
- File upload interface
- Document listing
- Document deletion

#### 6. Bookmarks Module
- Concept saving
- Bookmark listing
- Bookmark management

### Backend Components

#### 1. Server Core (`server/index.js`)
- Express application setup
- Middleware configuration
- Route mounting
- Static file serving
- Database initialization

#### 2. Authentication System
- **Middleware** (`server/middleware/auth.js`)
  - JWT token validation
  - Request authentication
  
- **Routes** (`server/routes/auth.js`)
  - User registration
  - User login
  - Password hashing with bcrypt

#### 3. Voice Processing
- **Routes** (`server/routes/voice.js`)
  - Query processing
  - Voice command detection
  - OpenAI API integration
  - SSML generation
  - TTS placeholder

#### 4. Settings Management
- **Routes** (`server/routes/settings.js`)
  - Get user settings
  - Update settings

#### 5. Document Management
- **Routes** (`server/routes/documents.js`)
  - Multer file upload
  - Document storage
  - Document retrieval
  - Document deletion

#### 6. Bookmarks
- **Routes** (`server/routes/bookmarks.js`)
  - Create bookmarks
  - List bookmarks
  - Delete bookmarks

#### 7. Database Layer
- **Model** (`server/models/database.js`)
  - SQLite connection
  - Schema initialization
  - Table creation

## Data Flow

### User Authentication Flow

```
User → Frontend Form → POST /api/auth/login
                           ↓
                    Validate Credentials
                           ↓
                    Generate JWT Token
                           ↓
                    Return Token + User
                           ↓
Frontend ← Store Token in localStorage
```

### Voice Query Flow

```
User Speech → Web Speech API → Transcript
                                    ↓
                          POST /api/voice/query
                                    ↓
                          Load System Prompt
                                    ↓
                          Format User Prompt
                                    ↓
                          Detect Voice Commands
                                    ↓
                          OpenAI API Request
                                    ↓
                          Process LLM Response
                                    ↓
                          Wrap in SSML
                                    ↓
Frontend ← JSON Response ← Return Response
      ↓
Display Text + Play Audio
```

### Document Upload Flow

```
User → Select File → POST /api/documents/upload
                           ↓
                    Multer Middleware
                           ↓
                    Save to Filesystem
                           ↓
                    Store Metadata in DB
                           ↓
Frontend ← Success Response ← Return Document Info
```

## Database Schema

### Tables

1. **users**
   - Primary user account information
   - Stores authentication credentials
   - Links to all user-specific data

2. **settings**
   - User preferences for TTS and voice
   - One-to-one relationship with users

3. **documents**
   - Uploaded document metadata
   - References to files on filesystem
   - Used for RAG context

4. **bookmarks**
   - Saved concepts and explanations
   - Tagged with learning mode
   - User-specific saved items

5. **sessions**
   - Conversation history
   - Used for analytics and review

### Relationships

```
users (1) ←→ (1) settings
users (1) ←→ (*) documents
users (1) ←→ (*) bookmarks
users (1) ←→ (*) sessions
```

## API Architecture

### RESTful Endpoints

#### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Authenticate user

#### Voice Processing
- `POST /api/voice/query` - Process voice input
- `POST /api/voice/tts` - Generate TTS audio

#### Settings
- `GET /api/settings` - Retrieve user settings
- `PUT /api/settings` - Update user settings

#### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - List user documents
- `DELETE /api/documents/:id` - Remove document

#### Bookmarks
- `POST /api/bookmarks` - Save bookmark
- `GET /api/bookmarks` - List user bookmarks
- `DELETE /api/bookmarks/:id` - Remove bookmark

### Authentication Flow

All protected endpoints require JWT token:
```
Authorization: Bearer <token>
```

Token is validated by `authenticateToken` middleware before processing requests.

## Configuration Files

### `system_prompt.yaml`
- Defines AI tutor behavior
- LLM model settings
- Voice integration configuration
- Mode-specific guidelines
- Dialogue flow rules

### `user_prompt_template.yaml`
- Template for formatting user queries
- Includes document context
- Grade level specification
- Mode selection

### `.env`
- Environment variables
- API keys (OpenAI, TTS providers)
- Server configuration
- Database path
- Session secrets

## Security Architecture

### Authentication & Authorization
1. **Password Security**
   - Bcrypt hashing with salt rounds
   - No plaintext password storage

2. **JWT Tokens**
   - Signed with secret key
   - 7-day expiration
   - Stateless authentication

3. **Session Management**
   - Express sessions for additional security
   - HTTP-only cookies in production

### API Security
1. **CORS Configuration**
   - Configured for specific origins
   - Prevents unauthorized access

2. **Input Validation**
   - File type restrictions
   - File size limits
   - SQL injection prevention

3. **Rate Limiting** (recommended)
   - Should be implemented for production
   - Prevents abuse of API endpoints

## Scalability Considerations

### Current Architecture
- Single server deployment
- SQLite database (suitable for development/small scale)
- File-based document storage

### Recommended Production Changes

1. **Database**
   - Migrate to PostgreSQL or MySQL
   - Implement connection pooling
   - Add read replicas for scaling

2. **File Storage**
   - Use cloud storage (S3, Google Cloud Storage)
   - Implement CDN for static assets

3. **Caching**
   - Add Redis for session storage
   - Cache frequent OpenAI responses
   - Implement API response caching

4. **Load Balancing**
   - Deploy multiple server instances
   - Use nginx or HAProxy
   - Implement sticky sessions

5. **Message Queue**
   - Add RabbitMQ or Redis for async tasks
   - Process document uploads asynchronously
   - Queue TTS generation

## Integration Points

### OpenAI API
- Chat Completions endpoint
- Model: GPT-4o (configurable)
- Handles all LLM processing

### TTS Providers (Optional)
- **ElevenLabs**: High-quality voice synthesis
- **AWS Polly**: Scalable cloud TTS
- **Google TTS**: Multi-language support

### Web Speech API
- Browser-based speech recognition
- Browser-based speech synthesis
- No server-side processing required

## Monitoring & Logging

### Current Implementation
- Console logging for debugging
- Error logging to console

### Recommended Additions
1. **Application Monitoring**
   - Winston or Bunyan for structured logging
   - Log rotation and archival

2. **Error Tracking**
   - Sentry or Rollbar integration
   - Real-time error alerts

3. **Performance Monitoring**
   - New Relic or Datadog
   - API response time tracking
   - Database query performance

4. **Analytics**
   - User activity tracking
   - Learning mode usage statistics
   - Voice command analytics

## Future Enhancements

### Planned Features
1. **Enhanced RAG**
   - Vector database integration (Pinecone, Weaviate)
   - Semantic search for documents
   - Better context retrieval

2. **Real-time Collaboration**
   - WebSocket integration
   - Multi-user whiteboard
   - Shared sessions

3. **Mobile Apps**
   - React Native mobile app
   - Native speech recognition
   - Offline mode

4. **Advanced Analytics**
   - Learning progress tracking
   - Personalized study plans
   - Parent/teacher dashboards

5. **Enhanced TTS**
   - Direct integration with TTS APIs
   - Voice cloning options
   - Emotion-aware speech

## Development Workflow

### Local Development
```bash
npm run dev  # Start with nodemon for auto-reload
```

### Production Build
```bash
npm start  # Start production server
```

### Testing
```bash
npm test  # Run test suite (to be implemented)
```

## Deployment Architecture

### Recommended Stack
```
Internet
    ↓
[Load Balancer / CDN]
    ↓
[Reverse Proxy - nginx]
    ↓
[Node.js Application Servers] (multiple instances)
    ↓
[Database Cluster] + [Redis Cache] + [Cloud Storage]
```

### Environment Setup
1. Production
2. Staging
3. Development

Each with separate:
- Environment variables
- Database instances
- API keys
- Domain/subdomains
