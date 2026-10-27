-- Caisse movements are separate from member contributions so the balance is auditable.
CREATE TABLE IF NOT EXISTS CashMovement (
  id TEXT PRIMARY KEY,
  movementDate TEXT NOT NULL,
  movementType TEXT NOT NULL CHECK(movementType IN ('ENTREE','SORTIE','AJUSTEMENT')),
  amount REAL NOT NULL CHECK(amount >= 0),
  currency TEXT NOT NULL CHECK(currency IN ('CDF','USD')),
  category TEXT NOT NULL,
  description TEXT,
  memberId TEXT REFERENCES Member(id) ON DELETE SET NULL,
  source TEXT NOT NULL DEFAULT 'MANUEL',
  recordedBy TEXT NOT NULL REFERENCES User(id),
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_cash_movement_date ON CashMovement(movementDate, currency);
CREATE INDEX IF NOT EXISTS idx_cash_movement_member ON CashMovement(memberId, movementDate);
-- Status values are preserved as written in the original register.
ALTER TABLE Member ADD COLUMN tontineStatus TEXT;
