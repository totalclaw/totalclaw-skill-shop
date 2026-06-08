// 通用：node _select-batch.js <outDirName> <cat1,cat2,...> [target]
// 始终排除 cyber-safeguard 会拦截的攻击性安全分类。
const fs=require('fs'),path=require('path');
const {MongoClient}=require('mongodb');const {loadEnv}=require('../roles/lib/env');
const OUT=process.argv[2]||'agent-batch3';
const PRIORITY=(process.argv[3]||'生物与制药,餐饮,能源与电力,影视与传媒,现代农业与种业,制造与工艺,建筑与工程,金融与保险,教育与培训,医疗与健康').split(',');
const TARGET=Number(process.argv[4])||1000;
const EXCLUDE=['安全与风控','网络安全攻防'];
const PER_AGENT=6,APR=16;
(async()=>{loadEnv();const c=new MongoClient(process.env.MONGODB_URI||'mongodb://127.0.0.1:27018/totalclaw');await c.connect();const s=c.db().collection('skills');
const proj={projection:{_id:0,name:1,category:1,slug:1}};const picked=[],seen=new Set();
// 已 done 的角色名：这些名字已有技能，重名的未done文档属冗余，跳过——只挑「名字全新」的真缺口角色。
const doneNames=new Set(await s.distinct('name',{kind:'role',skillsDone:true}));
const ok=(d)=>!seen.has(d.name)&&!doneNames.has(d.name);
for(const cat of PRIORITY){if(picked.length>=TARGET)break;if(EXCLUDE.includes(cat))continue;const docs=await s.find({kind:'role',skillsDone:{$ne:true},category:cat},proj).toArray();for(const d of docs){if(picked.length>=TARGET)break;if(!ok(d))continue;seen.add(d.name);picked.push(d);}}
if(picked.length<TARGET){const more=await s.find({kind:'role',skillsDone:{$ne:true},category:{$nin:EXCLUDE}},proj).toArray();for(const d of more){if(picked.length>=TARGET)break;if(!ok(d))continue;seen.add(d.name);picked.push(d);}}
const outDir=path.resolve(__dirname,'../../data/skills/'+OUT);const inDir=path.join(outDir,'inputs');fs.mkdirSync(inDir,{recursive:true});
const chunks=[];for(let i=0;i<picked.length;i+=PER_AGENT)chunks.push(picked.slice(i,i+PER_AGENT));
fs.writeFileSync(path.join(outDir,'manifest.json'),JSON.stringify({total:picked.length,perAgent:PER_AGENT,agentsPerRound:APR,picked},null,2));
chunks.forEach((chunk,ci)=>{const round=Math.floor(ci/APR)+1,a=(ci%APR)+1;const tag='r'+String(round).padStart(2,'0')+'-a'+String(a).padStart(2,'0');fs.writeFileSync(path.join(inDir,tag+'.json'),JSON.stringify(chunk.map(r=>({role:r.name,category:r.category})),null,2));});
const dist={};for(const d of picked)dist[d.category]=(dist[d.category]||0)+1;
console.log('OUT='+OUT+' selected='+picked.length+' chunks='+chunks.length+' rounds='+Math.ceil(chunks.length/APR));
console.log('dist:',JSON.stringify(dist));
await c.close();})().catch(e=>{console.error(e);process.exit(1);});
