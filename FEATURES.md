# TutorAI-Voice Feature Documentation

This document provides detailed information about all features implemented in TutorAI-Voice.

## 🎯 Core Features

### 1. User Authentication

**Registration**
- Email and password-based registration
- Name capture for personalized greetings
- Grade level selection (Grade 5, Grade 12, Advanced)
- Automatic settings creation for new users
- JWT token generation on successful registration

**Login**
- Email and password authentication
- Secure password validation with bcrypt
- 7-day JWT token validity
- Persistent session with localStorage

**Security**
- Password hashing with bcrypt (10 salt rounds)
- JWT tokens for API authentication
- Session management with express-session
- Protected API endpoints with middleware

### 2. Voice Interaction System

**Speech Recognition**
- Web Speech API integration
- Real-time voice-to-text transcription
- Support for continuous listening
- Visual recording indicator
- Error handling for unsupported browsers

**Text-to-Speech**
- Browser-based speech synthesis
- Configurable speaking rate (slow, medium, fast)
- Configurable pitch (low, normal, high)
- Multiple TTS provider support (ElevenLabs, AWS Polly, Google TTS)
- SSML wrapping for enhanced speech control

**Voice Commands**
The system recognizes and acts on these natural language commands:

1. **"Show whiteboard"** - Switches to whiteboard mode for visual learning
2. **"Switch to code mode"** - Activates code demonstration mode
3. **"I don't understand"** - Triggers clarification prompt
4. **"Bookmark this"** - Saves current concept for later review
5. **"Simplify explanation"** - Requests simpler, more basic explanation
6. **"Go deeper"** - Requests more detailed, advanced explanation

### 3. Learning Modes

#### Chat Mode
**Purpose**: Traditional conversational learning interface

**Features**:
- Text transcript display
- Microphone button for voice input
- Quick command buttons for common actions
- Real-time conversation history
- User and tutor message differentiation
- Auto-scroll to latest messages

**Use Cases**:
- General Q&A
- Concept discussions
- Quick explanations
- Follow-up questions

#### Whiteboard Mode
**Purpose**: Visual learning with animated drawings and diagrams

**Features**:
- HTML5 Canvas for drawing
- Mouse-based drawing capability
- Dark chalkboard-style interface
- Text transcript synchronized with drawings
- Clear canvas function
- Download as PDF (button provided)
- Back to chat navigation

**Whiteboard Guidelines** (as per system prompt):
- Animations drawn in real-time
- Action prefixes: "(writes...)", "(draws arrow...)", "(pauses...)"
- Slanted headings: "/ Topic Title /"
- Numbered steps for sequential learning
- Tables and diagrams in ASCII style
- Natural pauses for comprehension

**Use Cases**:
- Mathematical problems
- Diagram explanations
- Step-by-step procedures
- Visual concept mapping

#### Code Mode
**Purpose**: Programming and SQL demonstrations with live commentary

**Features**:
- Dual-section layout:
  - Whiteboard explanation section
  - Code display section
- Syntax-highlighted code blocks
- Run code button (simulated execution)
- Results display area
- Teacher-style code commentary

**Code Mode Guidelines** (as per system prompt):
- Whiteboard pseudocode explanation first
- Then formatted, runnable code
- Inline comments as spoken notes
- Verbal and visual results description

**Use Cases**:
- SQL query explanations
- Algorithm demonstrations
- Code debugging help
- Programming concept teaching

### 4. Settings Management

**Configurable Options**:

1. **TTS Provider**
   - ElevenLabs (high-quality voice synthesis)
   - AWS Polly (scalable cloud TTS)
   - Google TTS (multi-language support)

2. **Speaking Rate**
   - Slow (0.8x speed)
   - Medium (1.0x speed)
   - Fast (1.2x speed)

3. **Pitch**
   - Low (0.8x pitch)
   - Normal (1.0x pitch)
   - High (1.2x pitch)

**Persistence**:
- Settings saved to database per user
- Automatically loaded on login
- Applied to all TTS operations

### 5. Document Management

**Upload System**:
- File upload via web interface
- Supported formats: PDF, DOC, DOCX, TXT, MD
- Maximum file size: 10MB (configurable)
- File type validation
- Secure file storage on server

**Document Listing**:
- Display uploaded documents
- Show upload date/time
- Delete functionality
- User-specific document isolation

**RAG Integration**:
- Documents referenced in AI responses
- Document list included in LLM context
- Enables personalized tutoring based on curriculum

### 6. Bookmarks System

**Features**:
- Save important concepts with one click
- Store concept name and mode (chat/whiteboard/code)
- Optional content/notes storage
- Chronological listing (newest first)
- Delete bookmarks
- User-specific bookmark isolation

**Use Cases**:
- Mark difficult topics for review
- Save important formulas
- Keep track of learning progress
- Create study reference list

### 7. Adaptive Learning Levels

**Grade 5 Mode**:
- Simple vocabulary
- Basic concepts
- More examples and repetition
- Encouraging tone

**Grade 12 Mode** (default):
- Standard academic vocabulary
- Appropriate complexity
- Balanced explanations
- Exam-focused content

**Advanced Mode**:
- Technical terminology
- In-depth analysis
- Research-level content
- Theoretical discussions

### 8. Dialogue Flow

**On Application Load**:
- Welcome audio: "Welcome to TutorAI-Voice! Please log in to continue."

**After Login**:
- Personalized greeting: "Hello [Name], which topic shall we explore today?"

**During Conversation**:
- Transcribe user speech
- Send to LLM with system prompt
- Wrap response in SSML
- Play audio while displaying text

**After Each Segment**:
- Ask: "Did that make sense?"
- Wait for user feedback
- Adjust explanation if needed

### 9. AI Integration

**OpenAI API Configuration**:
```yaml
model: gpt-4o
temperature: 0.7
max_tokens: 1500
top_p: 0.9
frequency_penalty: 0.2
presence_penalty: 0.1
```

**System Prompt Features**:
- Empathetic, human-like personality
- Subject-specific knowledge
- Teaching methodology awareness
- Voice command recognition
- Mode-specific behavior adaptation

**Context Awareness**:
- User's uploaded documents
- Selected grade level
- Current learning mode
- Conversation history

## 🎨 User Interface Features

### Design Elements
- Modern gradient background (purple theme)
- Clean, minimal interface
- Consistent color scheme
- Clear visual hierarchy
- Intuitive navigation

### Responsive Design
- Mobile-friendly layout
- Tablet optimization
- Desktop full-screen support
- Flexible component sizing

### Visual Feedback
- Recording indicator with pulse animation
- Active button states
- Hover effects on interactive elements
- Loading states (where applicable)
- Success/error messages

### Accessibility
- Clear labels on all inputs
- High contrast text
- Large clickable areas
- Keyboard navigation support
- Screen reader compatible structure

## 📊 Progress Tracking

**Planned Features** (suggested in system prompt):
- Progress dashboard with spoken updates
- "You've covered X of Y topics" tracking
- Weekly mastery reports
- Email reports to students and parents
- Key takeaway summaries
- Downloadable PDF notes

**Current Implementation**:
- Session history storage
- Bookmark tracking
- Document upload history

## 🔄 Additional Suggested Features

As per the system prompt, these features are suggested for future enhancement:

1. **Key Takeaway Summaries**
   - Audio summary at end of session
   - Downloadable PDF of whiteboard notes
   - Text transcript of session

2. **Progress Dashboard**
   - Topic completion tracking
   - Spoken progress updates
   - Visual progress bars

3. **Enhanced Resources**
   - Curated video links
   - Article recommendations
   - Practice problem sets

4. **Reporting System**
   - Weekly mastery reports
   - Email to students
   - Parent dashboard access

## 🔐 Privacy & Security

**Data Protection**:
- Password hashing (never stored in plaintext)
- JWT tokens for stateless authentication
- User data isolation
- Secure file uploads

**Best Practices**:
- Input validation on all endpoints
- File type restrictions
- Size limits on uploads
- SQL injection prevention
- XSS protection

## 🌐 Browser Compatibility

**Fully Supported**:
- Google Chrome (recommended)
- Microsoft Edge
- Desktop browsers with Web Speech API

**Partial Support**:
- Firefox (limited speech recognition)
- Safari (limited speech recognition)
- Mobile browsers (limited features)

**Required APIs**:
- Web Speech API (for voice recognition)
- Speech Synthesis API (for TTS)
- Canvas API (for whiteboard)
- LocalStorage (for session persistence)

## 📱 Mobile Considerations

**Current Status**:
- Responsive layout implemented
- Touch-friendly controls
- Mobile browser compatible

**Limitations**:
- Speech recognition limited on mobile browsers
- Canvas drawing optimized for mouse/stylus
- File uploads may have restrictions

**Future Enhancements**:
- Native mobile app (React Native)
- Offline mode support
- Mobile-optimized voice controls

## 🚀 Performance Optimization

**Current Optimizations**:
- Single page application (no page reloads)
- Efficient DOM manipulation
- Minimal external dependencies
- Compressed CSS/JS (in production)

**Scalability Considerations**:
- Stateless API design
- Database connection pooling ready
- CDN-ready static assets
- Horizontal scaling compatible

## 📈 Usage Statistics

**Trackable Metrics**:
- User registrations
- Session count per user
- Mode usage frequency
- Voice command usage
- Document uploads
- Bookmark creation
- Average session duration

**Analytics Integration Ready**:
- Google Analytics compatible
- Custom event tracking possible
- User journey mapping enabled

## 🎓 Educational Methodology

**Teaching Approach**:
- Socratic method (question-driven)
- Visual and auditory learning
- Practice by doing (code mode)
- Repetition and reinforcement
- Adaptive difficulty

**Engagement Techniques**:
- Interactive voice commands
- Multi-modal learning (text, audio, visual)
- Immediate feedback
- Personalized content
- Progress tracking and rewards

## 🔧 Customization Options

**For Developers**:
- Modular code architecture
- Easy to add new routes
- Configurable via environment variables
- YAML-based AI configuration
- Extensible database schema

**For Educators**:
- Customizable system prompt
- Adjustable LLM parameters
- Subject-specific prompts
- Grade level customization
- Voice command additions

## 📞 Support Features

**User Assistance**:
- Quick command buttons (no typing needed)
- "I don't understand" voice command
- Visual feedback for all actions
- Error messages with guidance

**Documentation**:
- Comprehensive README
- Setup guide with troubleshooting
- Architecture documentation
- Feature documentation (this file)
- Inline code comments
