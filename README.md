# Drama LLM - Full Stack LLM Chat Application

**Version**: 2.1.0  
**Status**: Production Ready  
**Stack**: React + TypeScript + Vercel AI SDK + Express + PostgreSQL

---

## 🎯 Overview

Drama LLM is a complete full-stack application for interacting with Ollama language models. It features a modern React frontend, robust Express.js backend, and PostgreSQL database for conversation persistence.

### Key Features

✅ **Real-time Streaming** - Live AI responses with proper abort support  
✅ **Chat Interface** - Clean, responsive UI for LLM interactions  
✅ **Model Management** - 160+ Ollama models with advanced search and filtering  
✅ **Message Management** - Edit, delete, and regenerate messages  
✅ **Conversation Persistence** - All chats saved to PostgreSQL database  
✅ **Search & Export** - Search conversations and export as Markdown  
✅ **User Authentication** - JWT-based secure login system  
✅ **Session Management** - Track and manage active sessions  
✅ **Dark/Light Mode** - Theme support with system preference detection  
✅ **Error Handling** - Graceful error recovery with user-friendly messages  
✅ **RESTful API** - 22 endpoints for complete backend integration

---

## 🏗️ Architecture

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Full type safety
- **Vite** - Lightning-fast build tool
- **Zustand** - Lightweight state management
- **TailwindCSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Vercel AI SDK** - Streaming AI responses with abort support
- **Ollama** - Local LLM runtime integration

### Backend
- **Express.js** - Web server framework
- **PostgreSQL** - Relational database
- **JWT** - Token-based authentication
- **bcrypt** - Secure password hashing
- **Winston** - Logging system
- **TypeScript** - End-to-end type safety

### Database Schema
- **users** - User accounts and authentication
- **conversations** - Chat conversations with metadata
- **messages** - Individual messages with role tracking
- **sessions** - Active user sessions with expiration
- **chat_settings** - User preference presets

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- PostgreSQL running (Docker container available)
- Ollama installed and running on `localhost:11434`

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rohit1901/drama-llm.git
   cd drama-llm
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Set up backend**
   ```bash
   cd server
   npm install
   mkdir -p logs
   ```

4. **Configure environment variables**
   
   Frontend `.env`:
   ```env
   DRAMA_LLM_SECURITY=disable
   VITE_API_URL=http://localhost:3001/api
   ```
   
   Backend `server/.env`:
   ```env
   DATABASE_URL=postgres://admin:PASSWORD@localhost:5432/drama_llm
   PORT=3001
   JWT_SECRET=your-super-secret-jwt-key
   CORS_ORIGIN=http://localhost:5173
   ```

5. **Set up database**
   ```bash
   # Create database
   docker exec nt-keystone-cms-db-1 psql -U admin -d postgres -c "CREATE DATABASE drama_llm;"
   
   # Apply schema
   docker exec -i nt-keystone-cms-db-1 psql -U admin -d drama_llm < database/schema.sql
   ```

6. **Start the application**
   
   Terminal 1 - Backend:
   ```bash
   cd server
   npm run dev
   ```
   
   Terminal 2 - Frontend:
   ```bash
   npm run dev
   ```

7. **Open your browser**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3001/api`
   - Health Check: `http://localhost:3001/health`

8. **Login with default credentials**
   - Email: `admin@drama-llm.local`
   - Password: `admin123`
   - ⚠️ **Change immediately in production!**

---

## 📡 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "username": "username"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Conversation Endpoints

#### List Conversations
```http
GET /api/conversations?page=1&limit=20&search=query
Authorization: Bearer <token>
```

#### Create Conversation
```http
POST /api/conversations
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New Chat",
  "model": "llama3.2:latest",
  "settings": {
    "temperature": 0.7
  }
}
```

#### Get Conversation with Messages
```http
GET /api/conversations/:id
Authorization: Bearer <token>
```

#### Add Message
```http
POST /api/conversations/:id/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "user",
  "content": "Hello!"
}
```

For complete API documentation, see [BACKEND_SETUP.md](./BACKEND_SETUP.md)

---

## 🎨 Features in Detail

### Model Management
- Browse 160+ pre-configured Ollama models
- **Debounced search** with keyboard shortcuts (press `/` to focus)
- **Advanced filtering** by status (pulled/available)
- **Sort options** by name, status, or size (ascending/descending)
- Pull models directly from the UI
- Delete unused models
- Clear all filters button
- Real-time results count

### Conversation Management
- Create unlimited conversations
- **Search conversations** with real-time filtering
- **Export as Markdown** with one click
- Filter by model or date
- Soft delete (recoverable)
- Duplicate conversations
- Auto-save on every message

### Chat Features
- **Real-time streaming responses** - See AI responses as they're generated
- **Stop generation button** - Cancel requests instantly (properly cancels HTTP)
- **Edit messages** - Fix mistakes without restarting conversation
- **Delete messages** - Remove unwanted messages with confirmation
- **Regenerate responses** - Get new AI responses for any question
- Adjustable model parameters (temperature, top-p)
- Custom system prompts
- Markdown rendering in responses
- Code syntax highlighting
- Copy code to clipboard
- Message context menu (three-dot menu on hover)

### User Features
- Secure authentication with JWT
- Profile management
- Password change
- Session management (view/delete active sessions)
- Preference settings

---

## 🔧 Configuration

### Frontend Environment Variables

```env
# Security mode (disable for development)
DRAMA_LLM_SECURITY=disable

# Backend API URL
VITE_API_URL=http://localhost:3001/api

# Ollama URL (optional, defaults to localhost:11434)
VITE_OLLAMA_URL=http://localhost:11434
```

### Backend Environment Variables

```env
# Database Configuration
DATABASE_URL=postgres://admin:PASSWORD@localhost:5432/drama_llm
DB_HOST=localhost
DB_PORT=5432
DB_NAME=drama_llm
DB_USER=admin
DB_PASSWORD=YOUR_PASSWORD

# Server Configuration
PORT=3001
NODE_ENV=development
HOST=localhost

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
SESSION_EXPIRES_IN=604800

# Security
BCRYPT_ROUNDS=10

# Features
ENABLE_REGISTRATION=true
```

---

## 📚 Documentation

Comprehensive documentation is available in the following files:

- **[BACKEND_SETUP.md](./BACKEND_SETUP.md)** - Complete backend setup and API reference
- **[FRONTEND_BACKEND_INTEGRATION.md](./FRONTEND_BACKEND_INTEGRATION.md)** - Integration guide
- **[FEATURES_IMPLEMENTATION_SUMMARY.md](./FEATURES_IMPLEMENTATION_SUMMARY.md)** - Latest features (Jan 2025)
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Comprehensive testing procedures
- **[AI_SDK_MIGRATION.md](./AI_SDK_MIGRATION.md)** - Migration to Vercel AI SDK
- **[LIBRARY_USAGE.md](./LIBRARY_USAGE.md)** - Which library to use when
- **[TODO.md](./TODO.md)** - Updated project roadmap
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick feature reference

---

## 🧪 Testing

### Run Frontend Tests
```bash
npm run lint
npm run build
```

### Test Backend API
```bash
# Health check
curl http://localhost:3001/health

# API info
curl http://localhost:3001/api

# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234"}'
```

---

## 🐛 Troubleshooting

### Backend won't start
1. Check if PostgreSQL is running: `docker ps | grep postgres`
2. Verify `.env` configuration
3. Check logs: `cat server/logs/error.log`

### Frontend errors
1. Clear browser cache and localStorage
2. Run `npm install` to ensure dependencies are up to date
3. Check if backend is running: `curl http://localhost:3001/health`

### Database connection errors
1. Verify PostgreSQL container is running
2. Check database exists: `docker exec nt-keystone-cms-db-1 psql -U admin -d postgres -c "\l"`
3. Reapply schema if needed: `docker exec -i nt-keystone-cms-db-1 psql -U admin -d drama_llm < database/schema.sql`

### Authentication errors
1. Clear localStorage: Open browser console and run `localStorage.clear()`
2. Login again to get a fresh token
3. Verify JWT_SECRET is set in backend `.env`

---

## 🔒 Security

### Best Practices Implemented
- Password hashing with bcrypt (10 rounds)
- JWT token authentication with expiration
- Session tracking and management
- SQL injection prevention (parameterized queries)
- XSS protection (input validation)
- CORS configuration
- Security headers (Helmet)
- Error message sanitization

### Production Recommendations
- Change default admin password immediately
- Use HTTPS/TLS encryption
- Enable database SSL
- Implement rate limiting
- Set up firewall rules
- Regular security audits
- Keep dependencies updated
- Use environment-specific secrets

---

## 🚢 Deployment

### Production Build

Frontend:
```bash
npm run build
```

Backend:
```bash
cd server
npm run build
npm start
```

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start backend
cd server
pm2 start dist/index.js --name drama-llm-api

# Monitor
pm2 monit

# Logs
pm2 logs drama-llm-api
```

### Docker Deployment

```bash
# Build frontend
docker build -t drama-llm-frontend .

# Build backend
cd server
docker build -t drama-llm-backend .

# Run with docker-compose
docker-compose up -d
```

---

## 📈 Roadmap

### Completed ✅ (January 2025)
- **Real-time streaming responses** with proper abort support
- **Message management** (edit, delete, regenerate)
- **Advanced search & filtering** for models and conversations
- **Export conversations** as Markdown
- **Stop generation button** that actually cancels HTTP requests
- Frontend bug fixes and improvements
- Complete backend API with PostgreSQL
- User authentication and session management
- Conversation persistence with auto-save
- Error handling and logging
- Comprehensive documentation

### In Progress 🔄
- Advanced chat settings and presets
- Performance optimizations (virtual scrolling)
- Better Docker setup

### Planned 📋
- File attachment support
- Voice input integration
- Conversation sharing
- Export to PDF
- Real-time updates with WebSockets
- Mobile responsive improvements
- PWA support
- Multi-language support (i18n)
- Testing infrastructure (Vitest, E2E)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Write TypeScript with proper types
- Follow existing code style
- Add JSDoc comments for functions
- Update documentation for new features
- Test thoroughly before submitting PR

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

## 🙏 Acknowledgments

- [Ollama](https://ollama.ai/) - Local LLM runtime
- [React](https://react.dev/) - UI framework
- [Express.js](https://expressjs.com/) - Backend framework
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Radix UI](https://www.radix-ui.com/) - Component primitives
- [TailwindCSS](https://tailwindcss.com/) - Styling framework

---

## 📞 Support

- **Documentation**: See files in the project root
- **Issues**: [GitHub Issues](https://github.com/rohit1901/drama-llm/issues)
- **Discussions**: [GitHub Discussions](https://github.com/rohit1901/drama-llm/discussions)

**Built with ❤️ using React, TypeScript, Express, and PostgreSQL**
