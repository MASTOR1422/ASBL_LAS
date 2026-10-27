import {NextResponse} from "next/server";
import {getDB,makeId} from "@/lib/cloudflare";
import {getSession,hasRole} from "@/lib/session";

export async function GET(){
 const u=await getSession();
 if(!hasRole(u,["ADMIN"]))return NextResponse.json({error:"Consultation de la caisse réservée à l'administrateur."},{status:403});
 const db=getDB();
 const totals=await db.prepare("SELECT currency, SUM(CASE WHEN movementType='ENTREE' THEN amount WHEN movementType='SORTIE' THEN -amount ELSE 0 END) AS balance FROM CashMovement GROUP BY currency").all();
 const movements=await db.prepare("SELECT c.id,c.movementDate,c.movementType,c.amount,c.currency,c.category,c.description,c.memberId,m.name AS memberName,c.source,c.createdAt,u.displayName AS recordedByName FROM CashMovement c LEFT JOIN Member m ON m.id=c.memberId LEFT JOIN User u ON u.id=c.recordedBy ORDER BY c.movementDate DESC,c.createdAt DESC LIMIT 500").all();
 const contributions=await db.prepare("SELECT currency, SUM(amount) AS total FROM MonthlyContribution GROUP BY currency").all();
 return NextResponse.json({balances:totals.results??[],movements:movements.results??[],contributions:contributions.results??[]});
}
export async function POST(req:Request){
 const u=await getSession();
 if(!hasRole(u,["ADMIN"]))return NextResponse.json({error:"Seul un administrateur peut modifier la caisse."},{status:403});
 const d=await req.json() as {movementDate?:string;movementType?:string;amount?:number;currency?:string;category?:string;description?:string;memberId?:string|null};
 const amount=Number(d.amount),type=d.movementType,currency=d.currency??"CDF";
 if(!d.movementDate||!/^\d{4}-\d{2}-\d{2}$/.test(d.movementDate)||!["ENTREE","SORTIE","AJUSTEMENT"].includes(type??"")||!Number.isFinite(amount)||amount<=0||amount>1e12||!["CDF","USD"].includes(currency)||!d.category?.trim())return NextResponse.json({error:"Vérifiez la date, le type, le montant, la devise et la catégorie."},{status:400});
 const id=makeId(),db=getDB();
 try{
  await db.prepare("INSERT INTO CashMovement(id,movementDate,movementType,amount,currency,category,description,memberId,source,recordedBy) VALUES(?,?,?,?,?,?,?,?,?,?)").bind(id,d.movementDate,type,amount,currency,d.category.trim().slice(0,80),String(d.description??"").slice(0,500),d.memberId||null,"MANUEL",u!.id).run();
  await db.prepare("INSERT INTO AuditLog(id,actorId,actorName,action,entity,entityId,details) VALUES(?,?,?,?,?,?,?)").bind(makeId(),u!.id,u!.displayName,"CREATE","cash_movement",id,type+" "+amount+" "+currency+" - "+d.category).run();
  return NextResponse.json({ok:true,id},{status:201});
 }catch{return NextResponse.json({error:"Écriture impossible : vérifiez le membre associé et la migration de la caisse."},{status:409});}
}
