import { NextRequest,NextResponse } from "next/server";
import { getDB } from "@/lib/cloudflare";
import { issueSession } from "@/lib/session";
async function verifyPassword(password:string,stored:string):Promise<boolean>{
 const p=stored.split("$");if(p.length!==4||p[0]!=="pbkdf2")return false;
 const iterations=Number(p[1]);if(!Number.isInteger(iterations)||iterations<100000||iterations>600000)return false;
 const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(password),"PBKDF2",false,["deriveBits"]);
 const bits=new Uint8Array(await crypto.subtle.deriveBits({name:"PBKDF2",salt:new TextEncoder().encode(p[2]),iterations,hash:"SHA-256"},key,256));
 const hash=[...bits].map(b=>b.toString(16).padStart(2,"0")).join("");
 if(hash.length!==p[3].length)return false;let diff=0;for(let i=0;i<hash.length;i++)diff|=hash.charCodeAt(i)^p[3].charCodeAt(i);return diff===0;
}
export async function POST(req:NextRequest){
 try{
  const d=await req.json() as {username?:string;password?:string};const username=String(d.username??"").trim().toLowerCase(),password=String(d.password??"");
  if(!username||!password||username.length>80||password.length>200)return NextResponse.json({error:"Identifiant et mot de passe requis."},{status:400});
  const db=getDB(),ip=(req.headers.get("cf-connecting-ip")??"unknown").slice(0,80);
  const attempts=await db.prepare("SELECT COUNT(*) AS n FROM LoginAttempt WHERE username=? AND ip=? AND createdAt >= datetime('now','-15 minutes')").bind(username,ip).first<{n:number}>();
  if((attempts?.n??0)>=8)return NextResponse.json({error:"Trop de tentatives. Réessayez dans 15 minutes."},{status:429,headers:{"Retry-After":"900"}});
  const u=await db.prepare("SELECT id,username,displayName,role,active,memberId,passwordHash FROM User WHERE username=?").bind(username).first<any>();
  if(!u||!u.active||!(await verifyPassword(password,u.passwordHash))){
   await db.prepare("INSERT INTO LoginAttempt(id,username,ip) VALUES(?,?,?)").bind(crypto.randomUUID(),username,ip).run();
   return NextResponse.json({error:"Identifiants incorrects ou compte désactivé."},{status:401});
  }
  await db.prepare("DELETE FROM LoginAttempt WHERE username=? AND ip=?").bind(username,ip).run();
  await db.prepare("UPDATE User SET lastLoginAt=CURRENT_TIMESTAMP,updatedAt=CURRENT_TIMESTAMP WHERE id=?").bind(u.id).run();
  await issueSession({id:u.id,username:u.username,displayName:u.displayName,role:u.role,memberId:u.memberId??null});
  return NextResponse.json({ok:true,user:{id:u.id,username:u.username,displayName:u.displayName,role:u.role,memberId:u.memberId??null}});
 }catch{return NextResponse.json({error:"Connexion indisponible. Vérifiez la configuration D1 et SESSION_SECRET."},{status:503});}
}
