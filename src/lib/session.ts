import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDB } from "@/lib/cloudflare";
export type LasUser = {id:string;username:string;displayName:string;role:string;memberId:string|null};
const COOKIE="las_session", TTL=604800;
function secret():string {
 const env=getCloudflareContext().env as {SESSION_SECRET?:string};
 if(!env.SESSION_SECRET||env.SESSION_SECRET.length<32) throw new Error("SESSION_SECRET absent ou trop court (32 caractères minimum).");
 return env.SESSION_SECRET;
}
function encode(bytes:Uint8Array):string { let s=""; for(const b of bytes)s+=String.fromCharCode(b); return btoa(s).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_"); }
function decode(value:string):Uint8Array { const raw=atob(value.replace(/-/g,"+").replace(/_/g,"/")+"=".repeat((4-value.length%4)%4)); return Uint8Array.from(raw,c=>c.charCodeAt(0)); }
async function sign(body:string):Promise<string> {
 const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret()),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 return encode(new Uint8Array(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(body))));
}
export async function issueSession(user:LasUser) {
 const body=encode(new TextEncoder().encode(JSON.stringify({...user,exp:Math.floor(Date.now()/1000)+TTL})));
 const store=await cookies(); store.set(COOKIE,body+"."+await sign(body),{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:TTL});
}
export async function clearSession(){const store=await cookies();store.set(COOKIE,"",{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:0});}
export async function getSession():Promise<LasUser|null>{
 const store=await cookies(),token=store.get(COOKIE)?.value;if(!token)return null;
 const parts=token.split(".");if(parts.length!==2)return null;
 try{
  const expected=await sign(parts[0]);if(expected.length!==parts[1].length)return null;
  let diff=0;for(let i=0;i<expected.length;i++)diff|=expected.charCodeAt(i)^parts[1].charCodeAt(i);if(diff!==0)return null;
  const p=JSON.parse(new TextDecoder().decode(decode(parts[0]))) as LasUser&{exp:number};
  if(!p.id||!p.exp||p.exp<Math.floor(Date.now()/1000))return null;
  const current=await getDB().prepare("SELECT id,username,displayName,role,active,memberId FROM User WHERE id=?").bind(p.id).first<any>();
  if(!current||!current.active)return null;
  return {id:current.id,username:current.username,displayName:current.displayName,role:current.role,memberId:current.memberId??null};
 }catch{return null;}
}
export function hasRole(user:LasUser|null,roles:string[]){return !!user&&roles.includes(user.role);}
