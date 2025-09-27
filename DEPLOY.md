# Deployment Guide

## Prerequisites

1. **Twilio Account Setup**
   - Sign up at [twilio.com](https://www.twilio.com/)
   - Purchase a phone number with SMS capabilities
   - Note down your Account SID, Auth Token, and Phone Number

2. **Environment Variables**
   ```bash
   TWILIO_ACCOUNT_SID=your_account_sid_here
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
   PORT=3001
   NODE_ENV=production
   CLIENT_URL=https://your-domain.com
   ```

## Deployment Options

### 1. Heroku Deployment

```bash
# Install Heroku CLI and login
heroku login

# Create a new Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set TWILIO_ACCOUNT_SID=your_account_sid
heroku config:set TWILIO_AUTH_TOKEN=your_auth_token
heroku config:set TWILIO_PHONE_NUMBER=your_phone_number
heroku config:set CLIENT_URL=https://your-app-name.herokuapp.com

# Deploy
git push heroku main
```

### 2. Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (vercel.json is included)
vercel

# Set environment variables in Vercel dashboard
```

### 3. Railway Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway deploy
```

### 4. DigitalOcean App Platform

1. Connect your GitHub repository
2. Set environment variables in the dashboard
3. Deploy with one click

### 5. Docker Deployment

```bash
# Build and run with Docker
docker build -t budstech-app .
docker run -p 3001:3001 --env-file .env budstech-app
```

## Environment Configuration

### Development
```env
NODE_ENV=development
CLIENT_URL=http://localhost:3000
PORT=3001
```

### Production
```env
NODE_ENV=production
CLIENT_URL=https://your-production-domain.com
PORT=3001
```

## Security Considerations

1. **HTTPS**: Always use HTTPS in production
2. **Environment Variables**: Never commit `.env` files
3. **CORS**: Update CORS settings for your domain
4. **Rate Limiting**: Consider adding rate limiting for API endpoints
5. **Input Validation**: Phone number validation is included

## Monitoring

- Server logs are available via `console.log`
- Monitor Twilio usage in Twilio dashboard
- Track location sharing success rates via `/api/sessions`

## Scaling

- Use a database (MongoDB, PostgreSQL) instead of in-memory storage
- Implement Redis for session management
- Add load balancing for multiple server instances
- Use CDN for static assets

## Troubleshooting

### Common Issues

1. **SMS not sending**
   - Verify Twilio credentials
   - Check phone number format
   - Ensure sufficient Twilio balance

2. **Location not working**
   - HTTPS required for geolocation
   - Check browser permissions
   - Verify session exists

3. **CORS errors**
   - Update CLIENT_URL environment variable
   - Check CORS configuration

### Debug Mode

Set `NODE_ENV=development` to enable detailed error messages.