-- DEMO ONLY. Apply only to a fresh local D1 database.
-- Passwords: admin/admin123, secretaire/secretaire123, tresorier/tresorier123, membre/membre123.
-- PBKDF2-SHA256 hashes; never enable these demo accounts in production.
INSERT OR IGNORE INTO User(id,username,email,passwordHash,displayName,role,active,memberId) VALUES
('demo-admin','admin','admin@example.invalid','pbkdf2$100000$las-demo-admin-salt-01$0740b757a6d9fa566430892e9db27cf2f26e803d1ab30087caa270179778b57d','Administrateur démo','ADMIN',1,NULL),
('demo-secretary','secretaire','secretaire@example.invalid','pbkdf2$100000$las-demo-secretary-salt$edb43e2ef6297ad5d2fd677b6674969b3c7e3754ec7176daac86e9fb9e83b2df','Secrétaire démo','SECRETAIRE',1,'demo-member-2'),
('demo-treasurer','tresorier','tresorier@example.invalid','pbkdf2$100000$las-demo-treasury-salt$521e437b96ff518a4bfe0eed5e694e2997191a952f9f665a4cd8e539a6603a9a','Trésorier démo','TRESORIER',1,'demo-member-3'),
('demo-member-user','membre','membre@example.invalid','pbkdf2$100000$las-demo-member-salt-01$3ed9744f19a6a357706562913534f95f440c9b9b4290f64e8c4c4ab80351cbf1','Membre démo','MEMBRE',1,'demo-member-1');
INSERT OR IGNORE INTO Member(id,memberNumber,name,phone,email,profession,position,joinedOn,status) VALUES
('demo-member-1','LAS-0001','Aline Mbuyi','+243 800 000 101','aline@example.invalid','Enseignante','Membre','2024-01-15','active'),
('demo-member-2','LAS-0002','Jean Kalala','+243 800 000 102','jean@example.invalid','Comptable','Secrétaire','2024-02-10','active'),
('demo-member-3','LAS-0003','Esther Ilunga','+243 800 000 103','esther@example.invalid','Commerçante','Trésorière','2024-03-20','active'),
('demo-member-4','LAS-0004','David Nsimba','+243 800 000 104','david@example.invalid','Technicien','Membre','2024-04-05','active');
INSERT OR IGNORE INTO MonthlyContribution(id,memberId,contributionYear,contributionMonth,amount,currency,note,paidAt,recordedBy) VALUES
('demo-contrib-1','demo-member-1',2026,1,10000,'CDF','Cotisation de démonstration','2026-01-10','demo-treasurer'),
('demo-contrib-2','demo-member-2',2026,1,10000,'CDF','Cotisation de démonstration','2026-01-12','demo-treasurer'),
('demo-contrib-3','demo-member-3',2026,1,10,'USD','Cotisation de démonstration','2026-01-15','demo-treasurer');
INSERT OR IGNORE INTO TontinePeriod(id,title,startsOn,endsOn,contributionAmount,currency,status,createdById) VALUES
('demo-tontine-1','Tontine de démonstration 2026','2026-01-01','2026-12-31',5000,'CDF','open','demo-admin');
INSERT OR IGNORE INTO TontineEntry(id,periodId,memberId,amount,currency,status,recordedBy) VALUES
('demo-entry-1','demo-tontine-1','demo-member-1',5000,'CDF','paid','demo-treasurer'),
('demo-entry-2','demo-tontine-1','demo-member-2',5000,'CDF','due','demo-treasurer');
INSERT OR IGNORE INTO AidRequest(id,memberId,subject,description,status) VALUES
('demo-aid-1','demo-member-4','Demande d’entraide fictive','Exemple de demande pour tester le flux d’entraide. Aucune donnée réelle.','submitted');
INSERT OR IGNORE INTO Post(id,authorId,title,body,category,status) VALUES
('demo-post-1','demo-admin','Bienvenue sur la plateforme LAS','Cette annonce fictive sert à vérifier l’affichage des actualités.','annonce','published'),
('demo-post-2','demo-admin','Réunion mensuelle — exemple','Contenu de démonstration : la date réelle sera publiée par le secrétariat.','evenement','published');
