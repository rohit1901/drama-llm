-- Drama LLM Database Schema
-- PostgreSQL Database Schema for Conversation Persistence

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    username VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'New Conversation',
    model VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,
    settings JSONB DEFAULT '{}'::jsonb
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Chat settings table (for storing user preferences)
CREATE TABLE IF NOT EXISTS chat_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    settings JSONB NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)
);

-- Session table (for authentication)
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_settings_updated_at BEFORE UPDATE ON chat_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ language 'plpgsql';

-- Function to get conversation with message count
CREATE OR REPLACE FUNCTION get_conversations_with_count(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    title VARCHAR(255),
    model VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    message_count BIGINT,
    last_message TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.user_id,
        c.title,
        c.model,
        c.created_at,
        c.updated_at,
        COUNT(m.id) as message_count,
        (SELECT m2.content FROM messages m2
         WHERE m2.conversation_id = c.id
         ORDER BY m2.created_at DESC
         LIMIT 1) as last_message
    FROM conversations c
    LEFT JOIN messages m ON c.id = m.conversation_id AND m.is_deleted = false
    WHERE c.user_id = p_user_id AND c.is_deleted = false
    GROUP BY c.id
    ORDER BY c.updated_at DESC;
END;
$$ language 'plpgsql';

-- Insert a default admin user (password: admin123)
-- Password hash is bcrypt hash of 'admin123'
INSERT INTO users (email, password_hash, username, is_active)
VALUES (
    'admin@drama-llm.local',
    '$2b$10$rBV2TQJhUmoK7fKLJKLXDugzC8hKZJxLPjwlFHYJYZKdZFvQxWYPy',
    'admin',
    true
) ON CONFLICT (email) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE users IS 'Stores user account information';
COMMENT ON TABLE conversations IS 'Stores conversation metadata and settings';
COMMENT ON TABLE messages IS 'Stores individual messages within conversations';
COMMENT ON TABLE chat_settings IS 'Stores user-specific chat configuration presets';
COMMENT ON TABLE sessions IS 'Stores active user sessions for authentication';

COMMENT ON COLUMN conversations.settings IS 'JSON object containing temperature, topP, topK, and other model settings';
COMMENT ON COLUMN messages.metadata IS 'JSON object for storing additional message data like tokens, timing, etc.';
COMMENT ON COLUMN sessions.expires_at IS 'Session expiration timestamp, typically 7 days from creation';
