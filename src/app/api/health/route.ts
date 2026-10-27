import { NextResponse } from "next/server";
import { getDB } from "@/lib/cloudflare";
export const runtime="edge";
export async function GET(){
 try{const row=await getDB().prepare("SELECT 1 AS ok").first<{ok:number}>();return NextResponse.json({ok:row?.ok===1,service:"asbl-las",database:"connected",environment:process.env.APP_ENV??"cloudflare"});}
 catch{return NextResponse.json({ok:false,service:"asbl-las",database:"not_configured"},{status:503});}
}
