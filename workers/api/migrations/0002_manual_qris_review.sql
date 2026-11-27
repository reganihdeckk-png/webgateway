-- Manual QRIS submission review. This records evidence and admin decisions only.
-- It does NOT credit wallet balances or prove settlement.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS manual_payment_submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  order_reference TEXT NOT NULL UNIQUE,
  amount_minor INTEGER NOT NULL CHECK (typeof(amount_minor) = 'integer' AND amount_minor > 0),
  currency TEXT NOT NULL DEFAULT 'IDR' CHECK (currency = 'IDR'),
  payment_method TEXT NOT NULL DEFAULT 'qris_static',
  merchant_label TEXT NOT NULL DEFAULT 'GLASSY X PREMKU, Konter',
  merchant_nmid TEXT NOT NULL DEFAULT 'ID1026510716552',
  customer_reference TEXT,
  proof_object_key TEXT,
  status TEXT NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review','approved','rejected','needs_information')),
  admin_note TEXT,
  reviewed_by TEXT REFERENCES admin_users(id),
  reviewed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_manual_submissions_status_created
  ON manual_payment_submissions(status, created_at);
CREATE INDEX IF NOT EXISTS idx_manual_submissions_user
  ON manual_payment_submissions(user_id, created_at);

CREATE TABLE IF NOT EXISTS manual_payment_audit_logs (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL REFERENCES manual_payment_submissions(id),
  actor_admin_id TEXT REFERENCES admin_users(id),
  action TEXT NOT NULL CHECK (action IN ('approved','rejected','needs_information','note_added')),
  note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_manual_payment_audit_submission
  ON manual_payment_audit_logs(submission_id, created_at);
