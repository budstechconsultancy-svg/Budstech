# Budstech SMS Location Sharing App

A full-stack Node.js/Express/React application that allows users to send SMS messages with location sharing links using Twilio. Recipients can click the link to share their current location, which is then available to the sender.

## Features

- 🚀 **Send SMS with Location Links**: Send customizable SMS messages with embedded location sharing links
- 📍 **Real-time Location Sharing**: Recipients can share their GPS coordinates through a web interface
- 🔒 **Secure & Private**: Location data is temporarily stored and only accessible via unique session IDs
- 📱 **Mobile-Friendly**: Responsive design that works on all devices
- ⚡ **Real-time Updates**: Track when locations are shared
- 🌐 **Cross-Platform**: Works on any device with a web browser and GPS capabilities

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Twilio** - SMS service provider
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger
- **dotenv** - Environment variable management

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Styling with gradients and modern design
- **HTML5 Geolocation API** - Location services

### Development
- **Nodemon** - Development server with auto-reload
- **React Scripts** - Build tools and development server
- **GitHub Codespaces** - Cloud development environment

## Quick Start

### Prerequisites

1. **Node.js 16+** installed on your machine
2. **Twilio Account** with:
   - Account SID
   - Auth Token
   - Phone Number (SMS-capable)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/budstechconsultancy-svg/Budstech.git
   cd Budstech
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**
   ```bash
   cd ../server
   cp .env.example .env
   ```
   
   Edit `.env` with your Twilio credentials:
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid_here
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
   PORT=3001
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

5. **Start the development servers**
   
   **Terminal 1 - Start the backend server:**
   ```bash
   cd server
   npm run dev
   ```
   
   **Terminal 2 - Start the React client:**
   ```bash
   cd client
   npm start
   ```

6. **Open your browser**
   - Client: http://localhost:3000
   - Server API: http://localhost:3001

## Using GitHub Codespaces

This project includes a complete Codespaces configuration for instant development:

1. Click **"Code" > "Create codespace on main"** in GitHub
2. Wait for the environment to build (2-3 minutes)
3. Both servers will start automatically
4. Configure your `.env` file with Twilio credentials
5. Start coding immediately!

## Usage

### Sending Location Requests

1. Open the application at http://localhost:3000
2. Enter the recipient's phone number (with country code)
3. Customize the message (optional)
4. Click "Send Location Request"
5. The recipient will receive an SMS with a location sharing link

### Sharing Location

1. Recipients click the link in the SMS
2. Their browser will open the location sharing page
3. Click "Share My Location"
4. Grant location permissions when prompted
5. Location is automatically shared and displayed

### Tracking Responses

- Use the session ID provided after sending SMS
- Access `http://localhost:3001/api/location/{sessionId}` to check status
- View all sessions at `http://localhost:3001/api/sessions`

## API Documentation

### Send SMS
```http
POST /api/send-sms
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "message": "Your custom message"
}
```

### Share Location
```http
POST /api/location/{sessionId}
Content-Type: application/json

{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "accuracy": 10,
  "timestamp": "2023-12-07T10:30:00.000Z"
}
```

### Get Location Data
```http
GET /api/location/{sessionId}
```

### Get All Sessions
```http
GET /api/sessions
```

## Project Structure

```
Budstech/
├── server/                 # Express.js backend
│   ├── server.js          # Main server file
│   ├── package.json       # Server dependencies
│   └── .env.example       # Environment template
├── client/                 # React frontend
│   ├── public/
│   │   └── index.html     # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── SendLink.js    # SMS sending component
│   │   │   └── Locate.js      # Location sharing component
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Application styles
│   │   └── index.js       # React entry point
│   └── package.json       # Client dependencies
├── .devcontainer/         # Codespaces configuration
│   └── devcontainer.json
└── README.md              # This file
```

## Security Features

- **CORS Protection**: Configured to only allow requests from the client URL
- **Helmet Security**: HTTP security headers
- **Environment Variables**: Sensitive data stored in environment variables
- **Session-based Access**: Location data only accessible via unique session IDs
- **Request Validation**: Input validation on all endpoints
- **HTTPS Ready**: Easily deployable with SSL/TLS

## Deployment

### Heroku Deployment

1. **Prepare for deployment**
   ```bash
   # Create a root package.json for Heroku
   cat > package.json << EOF
   {
     "name": "budstech-app",
     "version": "1.0.0",
     "scripts": {
       "start": "cd server && npm start",
       "postinstall": "cd server && npm install && cd ../client && npm install && npm run build"
     }
   }
   EOF
   ```

2. **Deploy to Heroku**
   ```bash
   heroku create your-app-name
   heroku config:set TWILIO_ACCOUNT_SID=your_account_sid
   heroku config:set TWILIO_AUTH_TOKEN=your_auth_token
   heroku config:set TWILIO_PHONE_NUMBER=your_phone_number
   heroku config:set CLIENT_URL=https://your-app-name.herokuapp.com
   git push heroku main
   ```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: support@budstech.com
- 🐛 Issues: [GitHub Issues](https://github.com/budstechconsultancy-svg/Budstech/issues)
- 📖 Documentation: This README

## Acknowledgments

- [Twilio](https://www.twilio.com/) for SMS services
- [React](https://reactjs.org/) for the amazing UI library
- [Express.js](https://expressjs.com/) for the web framework
- The open-source community for inspiration and tools