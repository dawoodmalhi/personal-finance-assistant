-- Enable RLS on all tables
ALTER TABLE users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets       ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomaly_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memory   ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can only see their own row
CREATE POLICY "users: own row only"
  ON users FOR ALL
  USING (id = current_setting('app.current_user_id', true));

-- Transactions
CREATE POLICY "transactions: own only"
  ON transactions FOR ALL
  USING (user_id = current_setting('app.current_user_id', true));

-- Budgets
CREATE POLICY "budgets: own only"
  ON budgets FOR ALL
  USING (user_id = current_setting('app.current_user_id', true));

-- Subscriptions
CREATE POLICY "subscriptions: own only"
  ON subscriptions FOR ALL
  USING (user_id = current_setting('app.current_user_id', true));

-- Anomaly flags
CREATE POLICY "anomaly_flags: own only"
  ON anomaly_flags FOR ALL
  USING (user_id = current_setting('app.current_user_id', true));

-- User memory
CREATE POLICY "user_memory: own only"
  ON user_memory FOR ALL
  USING (user_id = current_setting('app.current_user_id', true));

-- Chat messages
CREATE POLICY "chat_messages: own only"
  ON chat_messages FOR ALL
  USING (user_id = current_setting('app.current_user_id', true));