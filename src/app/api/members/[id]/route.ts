import {NextResponse} from "next/server";
import {getDB,makeId} from "@/lib/cloudflare";
import {getSession,hasRole} from "@/lib/session";

type Context={params:Promise<{id:string}>};
export async function GET(_req:Request,ctx:Context){
 const u=await getSession();if(!u)return NextResponse.json({error:"Authentification requise."},{status:401});
 const {id}=await ctx.params;
 if(u.memberId!==id&&!hasRole(u,["ADMIN","SECRETAIRE","TRESORIER"]))return NextResponse.json({error:"Accès refusé."},{status:403});
 const db=getDB();
 const member=await db.prepare("SELECT id,memberNumber,name,phone,email,address,profession,position,status,joinedOn,forumStatus,asblStatus,meetingStatus,cotisationStatus,tontineStatus FROM Member WHERE id=?").bind(id).first<any>();
 if(!member)return NextResponse.json({error:"Membre introuvable."},{status:404});
 const contributions=await db.prepare("SELECT contributionYear,contributionMonth,amount,currency,paidAt,note FROM MonthlyContribution WHERE memberId=? ORDER BY contributionYear DESC,contributionMonth DESC").bind(id).all();
 const tontine=await db.prepare("SELECT p.title,p.startsOn,p.endsOn,e.amount,e.currency,e.status,e.paidAt FROM TontineEntry e JOIN TontinePeriod p ON p.id=e.periodId WHERE e.memberId=? ORDER BY p.startsOn DESC").bind(id).all();
 return NextResponse.json({member,contributions:contributions.results??[],tontine:tontine.results??[]});
}
export async function PATCH(req:Request,ctx:Context){
 const u=await getSession();if(!hasRole(u,["ADMIN"]))return NextResponse.json({error:"Seul un administrateur peut modifier la fiche financière ou associative."},{status:403});
 const {id}=await ctx.params;const d=await req.json() as {position?:string;asblStatus?:string;forumStatus?:string;meetingStatus?:string;cotisationStatus?:string;tontineStatus?:string;phone?:string;name?:string};
 const allowed=new Set(["OUI","NON","PARTIEL","OCCASIONNEL","PARFOIS","SOUVENT","EXEMPTÉ","EXEMPTE"]);
 for(const k of ["asblStatus","forumStatus","meetingStatus","cotisationStatus","tontineStatus"] as const){const v=d[k];if(v!==undefined&&v!==""&&!allowed.has(v.normalize("NFC").toLocaleUpperCase("fr-FR")))return NextResponse.json({error:"Valeur de statut invalide : "+k},{status:400});}
 const db=getDB(),existing=await db.prepare("SELECT id FROM Member WHERE id=?").bind(id).first();if(!existing)return NextResponse.json({error:"Membre introuvable."},{status:404});
 const updates:Array<[string,unknown]>=[];
 for(const k of ["position","asblStatus","forumStatus","meetingStatus","cotisationStatus","tontineStatus","phone","name"] as const){if(d[k]!==undefined)updates.push([k,d[k]===null?null:String(d[k]).trim().slice(0,k==="name"?140:300)]);}
 if(!updates.length)return NextResponse.json({error:"Aucune modification reçue."},{status:400});
 const set=updates.map(([k])=>k+"=?").join(",");
 await db.prepare("UPDATE Member SET "+set+",updatedAt=CURRENT_TIMESTAMP WHERE id=?").bind(...updates.map(x=>x[1]),id).run();
 await db.prepare("INSERT INTO AuditLog(id,actorId,actorName,action,entity,entityId,details) VALUES(?,?,?,?,?,?,?)").bind(makeId(),u!.id,u!.displayName,"UPDATE","member",id,updates.map(([k,v])=>k+"="+String(v)).join("; ")).run();
 return NextResponse.json({ok:true,id,updated:updates.map(x=>x[0])});
}
