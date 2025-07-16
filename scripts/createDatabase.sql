-- Create database schema for wallet tracking app

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tracked wallets table
CREATE TABLE IF NOT EXISTS tracked_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    address VARCHAR(42) NOT NULL,
    label VARCHAR(255),
    platform VARCHAR(50),
    balance DECIMAL(30, 18) DEFAULT 0,
    balance_usd DECIMAL(20, 2) DEFAULT 0,
    risk_score INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, address)
);

-- Wallet connections table (discovered relationships)
CREATE TABLE IF NOT EXISTS wallet_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_wallet_id UUID REFERENCES tracked_wallets(id) ON DELETE CASCADE,
    to_address VARCHAR(42) NOT NULL,
    connection_strength DECIMAL(3, 2) DEFAULT 0.5,
    transaction_count INTEGER DEFAULT 0,
    total_value_usd DECIMAL(20, 2) DEFAULT 0,
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wallet labels (from various sources)
CREATE TABLE IF NOT EXISTS wallet_labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(42) NOT NULL,
    label VARCHAR(255) NOT NULL,
    source VARCHAR(50) NOT NULL, -- 'metasleuth', 'arkham', 'manual', etc.
    confidence DECIMAL(3, 2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(wallet_address, label, source)
);

-- Wallet clusters table
CREATE TABLE IF NOT EXISTS wallet_clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    description TEXT,
    total_value_usd DECIMAL(20, 2) DEFAULT 0,
    risk_level VARCHAR(20) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cluster members table
CREATE TABLE IF NOT EXISTS cluster_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cluster_id UUID REFERENCES wallet_clusters(id) ON DELETE CASCADE,
    wallet_address VARCHAR(42) NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cluster_id, wallet_address)
);

-- Transactions table for caching API responses
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hash VARCHAR(66) UNIQUE NOT NULL,
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42) NOT NULL,
    value DECIMAL(30, 18),
    value_usd DECIMAL(20, 2),
    gas_used BIGINT,
    gas_price BIGINT,
    block_number BIGINT,
    timestamp TIMESTAMP WITH TIME ZONE,
    platform VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Token balances table
CREATE TABLE IF NOT EXISTS token_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(42) NOT NULL,
    token_address VARCHAR(42),
    token_symbol VARCHAR(20),
    balance DECIMAL(30, 18),
    balance_usd DECIMAL(20, 2),
    decimals INTEGER,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(wallet_address, token_address)
);

-- API call logs for monitoring
CREATE TABLE IF NOT EXISTS api_call_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    api_provider VARCHAR(50) NOT NULL,
    endpoint VARCHAR(255),
    request_params JSONB,
    response_status INTEGER,
    response_time_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tracked_wallets_user_id ON tracked_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_tracked_wallets_address ON tracked_wallets(address);
CREATE INDEX IF NOT EXISTS idx_wallet_connections_from_wallet ON wallet_connections(from_wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_connections_to_address ON wallet_connections(to_address);
CREATE INDEX IF NOT EXISTS idx_wallet_labels_address ON wallet_labels(wallet_address);
CREATE INDEX IF NOT EXISTS idx_cluster_members_cluster_id ON cluster_members(cluster_id);
CREATE INDEX IF NOT EXISTS idx_transactions_from_address ON transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_transactions_to_address ON transactions(to_address);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_token_balances_wallet ON token_balances(wallet_address);
CREATE INDEX IF NOT EXISTS idx_api_call_logs_user_id ON api_call_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_call_logs_created_at ON api_call_logs(created_at);
