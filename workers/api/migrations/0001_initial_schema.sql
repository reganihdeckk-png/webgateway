PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  phone TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','suspended','closed')),
  email_verified_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
  refresh_token_hash TEXT NOT NULL UNIQUE, expires_at TEXT NOT NULL,
  revoked_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
  device_label TEXT, last_seen_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS wallets (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
  currency TEXT NOT NULL DEFAULT 'IDR' CHECK (currency = 'IDR'),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','frozen','closed')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS wallet_accounts (
  id TEXT PRIMARY KEY, wallet_id TEXT REFERENCES wallets(id),
  account_code TEXT NOT NULL UNIQUE,
  account_type TEXT NOT NULL CHECK (account_type IN ('asset','liability','income','expense','equity')),
  currency TEXT NOT NULL DEFAULT 'IDR' CHECK (currency = 'IDR'),
  normal_balance TEXT NOT NULL CHECK (normal_balance IN ('debit','credit')),
  balance_minor INTEGER NOT NULL DEFAULT 0 CHECK (typeof(balance_minor) = 'integer'),
  allow_negative INTEGER NOT NULL DEFAULT 0 CHECK (allow_negative IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS ledger_transactions (
  id TEXT PRIMARY KEY, reference TEXT NOT NULL UNIQUE, idempotency_key TEXT NOT NULL UNIQUE,
  transaction_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'posted' CHECK (status IN ('pending','posted','reversed','failed')),
  description TEXT, metadata_json TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS ledger_entries (
  id TEXT PRIMARY KEY, ledger_transaction_id TEXT NOT NULL REFERENCES ledger_transactions(id),
  account_id TEXT NOT NULL REFERENCES wallet_accounts(id),
  side TEXT NOT NULL CHECK (side IN ('debit','credit')),
  amount_minor INTEGER NOT NULL CHECK (typeof(amount_minor) = 'integer' AND amount_minor > 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_tx ON ledger_entries(ledger_transaction_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_account ON ledger_entries(account_id, created_at);
CREATE TRIGGER IF NOT EXISTS ledger_entries_no_update BEFORE UPDATE ON ledger_entries
BEGIN SELECT RAISE(ABORT, 'ledger entries are immutable'); END;
CREATE TRIGGER IF NOT EXISTS ledger_entries_no_delete BEFORE DELETE ON ledger_entries
BEGIN SELECT RAISE(ABORT, 'ledger entries are immutable'); END;
CREATE TABLE IF NOT EXISTS deposits (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
  ledger_transaction_id TEXT REFERENCES ledger_transactions(id),
  amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
  status TEXT NOT NULL CHECK (status IN ('created','pending','paid','failed','expired','cancelled')),
  provider TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS withdrawals (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
  ledger_transaction_id TEXT REFERENCES ledger_transactions(id),
  amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
  status TEXT NOT NULL CHECK (status IN ('requested','reviewing','approved','rejected','processing','paid','failed')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS transfers (
  id TEXT PRIMARY KEY, sender_user_id TEXT NOT NULL REFERENCES users(id),
  recipient_user_id TEXT NOT NULL REFERENCES users(id),
  ledger_transaction_id TEXT REFERENCES ledger_transactions(id),
  amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
  status TEXT NOT NULL CHECK (status IN ('pending','completed','failed','reversed')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id), merchant_id TEXT,
  ledger_transaction_id TEXT REFERENCES ledger_transactions(id),
  amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
  currency TEXT NOT NULL DEFAULT 'IDR',
  status TEXT NOT NULL CHECK (status IN ('created','pending','paid','failed','expired','cancelled','refunded')),
  provider TEXT, provider_reference TEXT, expires_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status, created_at);
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY, merchant_id TEXT NOT NULL, external_reference TEXT,
  amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
  status TEXT NOT NULL CHECK (status IN ('draft','open','paid','expired','cancelled')),
  due_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS merchants (
  id TEXT PRIMARY KEY, owner_user_id TEXT NOT NULL REFERENCES users(id),
  business_name TEXT NOT NULL, legal_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verified','rejected','suspended')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS merchant_users (
  merchant_id TEXT NOT NULL REFERENCES merchants(id), user_id TEXT NOT NULL REFERENCES users(id),
  role TEXT NOT NULL, PRIMARY KEY (merchant_id, user_id)
);
CREATE TABLE IF NOT EXISTS merchant_api_keys (
  id TEXT PRIMARY KEY, merchant_id TEXT NOT NULL REFERENCES merchants(id),
  key_hash TEXT NOT NULL UNIQUE, label TEXT NOT NULL, last_used_at TEXT, revoked_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS payment_providers (
  id TEXT PRIMARY KEY, code TEXT NOT NULL UNIQUE, display_name TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 0 CHECK (enabled IN (0,1)),
  priority INTEGER NOT NULL DEFAULT 100,
  environment TEXT NOT NULL DEFAULT 'sandbox' CHECK (environment IN ('sandbox','production'))
);
CREATE TABLE IF NOT EXISTS provider_credentials (
  id TEXT PRIMARY KEY, provider_id TEXT NOT NULL REFERENCES payment_providers(id),
  credential_reference TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS provider_transactions (
  id TEXT PRIMARY KEY, payment_id TEXT NOT NULL REFERENCES payments(id),
  provider_id TEXT NOT NULL REFERENCES payment_providers(id), provider_reference TEXT,
  status TEXT NOT NULL, request_id TEXT, response_code TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY, provider_code TEXT NOT NULL, provider_event_id TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  verification_status TEXT NOT NULL CHECK (verification_status IN ('verified','rejected','pending')),
  processed_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider_code, provider_event_id)
);
CREATE TABLE IF NOT EXISTS webhook_logs (
  id TEXT PRIMARY KEY, webhook_event_id TEXT REFERENCES webhook_events(id),
  outcome TEXT NOT NULL, detail TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL, body TEXT NOT NULL, type TEXT NOT NULL, read_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS admin_roles (id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE);
CREATE TABLE IF NOT EXISTS admin_permissions (id TEXT PRIMARY KEY, permission_code TEXT NOT NULL UNIQUE);
CREATE TABLE IF NOT EXISTS admin_role_permissions (
  role_id TEXT NOT NULL REFERENCES admin_roles(id),
  permission_id TEXT NOT NULL REFERENCES admin_permissions(id),
  PRIMARY KEY(role_id, permission_id)
);
CREATE TABLE IF NOT EXISTS admin_user_roles (
  admin_user_id TEXT NOT NULL REFERENCES admin_users(id),
  role_id TEXT NOT NULL REFERENCES admin_roles(id),
  PRIMARY KEY(admin_user_id, role_id)
);
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id TEXT PRIMARY KEY, admin_user_id TEXT REFERENCES admin_users(id), action TEXT NOT NULL,
  target_type TEXT, target_id TEXT, request_id TEXT, metadata_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS system_settings (
  setting_key TEXT PRIMARY KEY, setting_value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT OR IGNORE INTO payment_providers(id,code,display_name,enabled,priority,environment)
VALUES ('provider-midtrans','midtrans','Midtrans',0,10,'sandbox'),
       ('provider-xendit','xendit','Xendit',0,20,'sandbox'),
       ('provider-tripay','tripay','Tripay',0,30,'sandbox');
