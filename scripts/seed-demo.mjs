#!/usr/bin/env node
import { spawnSync } from "node:child_process";
const args=process.argv.slice(2);
if(args.includes("--remote")||args.includes("--production")){console.error("Refusé : le seed de démonstration ne peut pas écrire dans une base distante ou de production.");process.exit(2);}
const result=spawnSync("bunx",["wrangler","d1","execute","asbl-las-staging","--local","--file=migrations/0002_demo_seed.sql"],{stdio:"inherit",shell:process.platform==="win32"});
process.exit(result.status??1);
