-- Insert sample data for development and testing

-- Sample users
INSERT INTO users (id, email, password_hash) VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'demo@wallettrace.com', '$2b$10$example_hash_here'),
    ('550e8400-e29b-41d4-a716-446655440001', 'analyst@wallettrace.com', '$2b$10$example_hash_here')
ON CONFLICT (email) DO NOTHING;

-- Sample tracked wallets
INSERT INTO tracked_wallets (id, user_id, address, label, platform, balance_usd) VALUES 
    ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '0x742d35Cc6634C0532925a3b8D4C9db4C4C4C4C4C', 'Main Wallet', 'Ethereum', 125430.50),
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '0x8ba1f109551bD432803012645Hac136c22C4C4C4', 'Trading Wallet', 'Polygon', 89234.20),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', 'DeFi Wallet', 'Avalanche', 234567.80),
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD', 'Exchange Wallet', 'Ethereum', 45678.90),
    ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', 'Cold Storage', 'Bitcoin', 567890.12)
ON CONFLICT (user_id, address) DO NOTHING;

-- Sample wallet connections
INSERT INTO wallet_connections (from_wallet_id, to_address, connection_strength, transaction_count, total_value_usd) VALUES 
    ('660e8400-e29b-41d4-a716-446655440000', '0x8ba1f109551bD432803012645Hac136c22C4C4C4', 0.85, 45, 125000.00),
    ('660e8400-e29b-41d4-a716-446655440000', '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', 0.65, 23, 89000.00),
    ('660e8400-e29b-41d4-a716-446655440000', '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD', 0.92, 67, 234000.00),
    ('660e8400-e29b-41d4-a716-446655440001', '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD', 0.45, 12, 34000.00),
    ('660e8400-e29b-41d4-a716-446655440002', '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', 0.73, 8, 156000.00)
ON CONFLICT DO NOTHING;

-- Sample wallet clusters
INSERT INTO wallet_clusters (id, user_id, name, description, total_value_usd, risk_level) VALUES 
    ('770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Main Trading Cluster', 'Primary trading and DeFi activities', 459232.50, 'medium'),
    ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Cold Storage Cluster', 'Long-term storage wallets', 567890.12, 'low'),
    ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Exchange Cluster', 'Centralized exchange interactions', 134913.10, 'high')
ON CONFLICT DO NOTHING;

-- Sample cluster members
INSERT INTO cluster_members (cluster_id, wallet_address) VALUES 
    ('770e8400-e29b-41d4-a716-446655440000', '0x742d35Cc6634C0532925a3b8D4C9db4C4C4C4C4C'),
    ('770e8400-e29b-41d4-a716-446655440000', '0x8ba1f109551bD432803012645Hac136c22C4C4C4'),
    ('770e8400-e29b-41d4-a716-446655440000', '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'),
    ('770e8400-e29b-41d4-a716-446655440001', '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'),
    ('770e8400-e29b-41d4-a716-446655440002', '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD')
ON CONFLICT (cluster_id, wallet_address) DO NOTHING;

-- Sample transactions
INSERT INTO transactions (hash, from_address, to_address, value_usd, block_number, timestamp, platform) VALUES 
    ('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12', '0x742d35Cc6634C0532925a3b8D4C9db4C4C4C4C4C', '0x8ba1f109551bD432803012645Hac136c22C4C4C4', 25000.00, 18500000, '2024-01-15 10:30:00+00', 'Ethereum'),
    ('0x2345678901bcdef12345678901bcdef12345678901bcdef12345678901bcdef123', '0x8ba1f109551bD432803012645Hac136c22C4C4C4', '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', 15000.00, 18500100, '2024-01-15 11:45:00+00', 'Ethereum'),
    ('0x3456789012cdef123456789012cdef123456789012cdef123456789012cdef1234', '0x742d35Cc6634C0532925a3b8D4C9db4C4C4C4C4C', '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD', 50000.00, 18500200, '2024-01-15 14:20:00+00', 'Ethereum')
ON CONFLICT (hash) DO NOTHING;
