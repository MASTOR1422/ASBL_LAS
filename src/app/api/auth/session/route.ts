import {NextResponse} from "next/server";import {getSession} from "@/lib/session";export const runtime="edge";export async function GET(){return NextResponse.json({user:await getSession()});}
