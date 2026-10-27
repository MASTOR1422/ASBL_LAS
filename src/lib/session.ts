import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDB } from "@/lib/cloudflare";
export type LasUser={id:string;username:string;displayName:string;role:string;memberId:string|null};
const COOKIE="las_session",TTL=604800;
function secret(){const env=getCloudflareContext().env as {SESSION_SECRET?:string};if(!env.SESSION_SECRET||env.SESSION_SECRET.length<32)throw new Error("SESSION_SECRET absent ou trop court.");return env.SESSION_SECRET;}
function encode(b:Uint8Array){let s="";for(const x of b)s+=String.fromCharCode(x);return btoa(s).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");}
function decode(v:string){return Uint8Array.from(atob(v.replace(/-/g,"+").replace(/_/g,"/")+"=".repeat((4-v.length%4)%4)),c=>c.charCodeAt(0));}
async function sign(body:string){const k=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret()),{name:"HMAC",hash:"SHA-256"},false,["sign"]);return encode(new Uint8Array(await crypto.subtle.sign("HMAC",k,new TextEncoder().encode(body))));}
export async function issueSession(user:LasUser){const body=encode(new TextEncoder().encode(JSON.stringify({...user,exp:Math.floor(Date.now()/1000)+TTL})));(await cookies()).set(COOKIE,body+"."+await sign(body),{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:TTL});}
export async function clearSession(){(await cookies()).set(COOKIE,"",{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:0});}
export async function getSession():Promise<LasUser|null>{const token=(await cookies()).get(COOKIE)?.value;if(!token)return null;const parts=token.split(".");if(parts.length!==2)return null;try{const expected=await sign(parts[0]);if(expected.length!==parts[1].length)return null;let diff=0;for(let i=0;i<expected.length;i++)diff|=expected.charCodeAt(i)^parts[1].charCodeAt(i);if(diff)return null;const p=JSON.parse(new TextDecoder().decode(decode(parts[0]))) as LasUser&{exp:number};if(!p.id||!p.exp||p.exp<Math.floor(Date.now()/1000))return null;const c=await getDB().prepare("SELECT id,username,display_name,role,active,member_id FROM users WHERE id=?").bind(p.id).first<any>();if(!c||!c.active)return null;return {id:c.id,username:c.username??"",displayName:c.display_name??c.username??"Utilisateur",role:String(c.role??"membre").toUpperCase(),memberId:c.member_id==null?null:String(c.member_id)};}catch{return null;}}
export function hasRole(user:LasUser|null,roles:string[]){return !!user&&roles.includes(user.role);}
