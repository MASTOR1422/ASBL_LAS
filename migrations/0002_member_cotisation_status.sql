-- Preserve the original status vocabulary from the member register.
-- Values include OUI, NON, PARTIEL, OCCASIONNEL, PARFOIS, SOUVENT and EXEMPTÉ.
ALTER TABLE Member ADD COLUMN cotisationStatus TEXT;
