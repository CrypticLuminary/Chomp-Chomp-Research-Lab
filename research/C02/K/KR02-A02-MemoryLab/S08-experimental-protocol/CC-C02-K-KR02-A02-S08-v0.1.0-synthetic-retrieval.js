function experiment(){
 const cases=[
 ["callback",2700,"blue penguin promise",["a"],[[20,"a","Mira promised to call her lost vehicle the blue penguin."],[2660,"b","Blue team won a penguin themed match."],[2730,"c","The penguin skin is expensive."],[2690,"d","Mira talks about dinner."],[2900,"e","Blue penguin is a new cosmetic."]]],
 ["pronoun",2400,"Who did it again? Niko crash bridge",["a"],[[360,"a","Niko drove the truck into the bridge and apologized."],[2380,"b","Bridge repairs are expensive."],[2410,"c","Tariq crashed a different car."],[2300,"d","Niko discusses the menu."],[2600,"e","Someone repaired the bridge."]]],
 ["qualification",900,"Mira claim developer ban qualification",["a"],[[1020,"a","Mira clarifies the developer ban was temporary and only for cheating."],[870,"b","Mira praises the developer."],[920,"c","Mira discusses a ban on chat spam."],[720,"d","Developer update released."],[1440,"e","Mira dislikes the menu."]]],
 ["correction",1800,"Jules correction controller price",["a"],[[2160,"a","Jules corrects the controller price: forty not eighty."],[1790,"b","Controller price varies."],[1810,"c","Jules changes controller settings."],[1600,"d","Jules corrects camera alignment."],[2200,"e","The price of a keyboard changed."]]],
 ["emotional_payoff",3000,"Mira sister tournament promise",["a","b"],[[120,"a","Mira promised her sister she would finish the tournament."],[2200,"b","Her sister sent a message that she was watching."],[2980,"c","Tournament schedule is delayed."],[3010,"d","Mira discusses another tournament."],[2820,"e","A different player makes a promise."]]],
 ["visual",2400,"red key inventory locked vault",["a"],[[540,"a","Visual: red key placed into inventory after opening the vault."],[2390,"b","Red car drives past a locked door."],[2410,"c","Inventory contains an unrelated tool."],[2100,"d","Chat talks about a key binding."],[2700,"e","Vault is shown empty."]]],
 ["interleaved",2100,"Jules teammate hospital story",["a"],[[180,"a","Jules says teammate Niko missed practice because of a hospital visit."],[2090,"b","Game character visits hospital."],[2120,"c","Jules discusses a teammate in another game."],[1980,"d","Hospital mission unlocked."],[2200,"e","Niko chooses a weapon."]]],
 ["false_similarity",1700,"Mira trust Tariq leaked draft",["a"],[[100,"a","Tariq leaked Mira's private draft and apologized."],[1680,"b","Mira trusts the new save system."],[1720,"c","Tariq discusses a leaked trailer."],[1500,"d","Mira drafts a shopping list."],[1800,"e","Tariq trusts a different teammate."]]],
 ["multi_hop",3500,"Why did Mira refuse the Phoenix invite?",["a","b"],[[340,"a","Mira said she would refuse Phoenix because Jules advised against it."],[120,"b","Jules explained that Tariq had copied the team's strategy."],[3490,"c","Phoenix invite appeared on screen."],[3520,"d","Mira accepted another invite."],[3200,"e","Phoenix is a different game's name."]]],
 ["rare_detail",2800,"cobalt wrench",["a"],[[140,"a","Niko spent time talking about mundane equipment and then hid the cobalt wrench under the stair."],[2790,"b","Cobalt color is unpopular."],[2810,"c","Wrench icon changed."],[1000,"d","Niko fixed a vehicle."],[2900,"e","The team repaired a stair."]]],
 ["outside_source",2000,"unseen childhood incident",[],[[1970,"b","Mira talks about tomorrow."],[2020,"c","Childhood game released."],[100,"d","A fictional incident in the game."],[500,"e","The menu changed."],[2600,"f","An old song played."]]],
 ["complete",1000,"",[],[[980,"b","A player explains game settings."],[1020,"c","The game continues."],[200,"d","Chat says hello."],[600,"e","Music begins."],[1500,"f","A menu closes."]]]
 ];
 const stop=new Set("the a an and is was are to of it in he she her him who did why that about on into after would".split(" "));
 const tokenize=s=>(s.toLowerCase().match(/[a-z0-9]+/g)||[]).filter(t=>!stop.has(t));
 const count=ts=>Object.fromEntries([...new Set(ts)].map(x=>[x,ts.filter(y=>y===x).length]));
 const ent=s=>(s.match(/\b(?:Mira|Niko|Jules|Tariq|Phoenix)\b/g)||[]);
 const methods=["nearby","bm25","cosine","rrf","entity","graph","hierarchy","hierarchy_raw_rescue"];
 const rows=[]; const K=3;
 for(const [name,anchor,query,gold,docs] of cases){
  const tokens=docs.map(d=>tokenize(d[2])), qt=tokenize(query), qf=count(qt), n=docs.length, avg=tokens.reduce((a,x)=>a+x.length,0)/n;
  const bm=tokens.map(ts=>{let f=count(ts);return [...new Set(qt)].reduce((a,t)=>{let df=tokens.filter(x=>x.includes(t)).length,tf=f[t]||0;return a+Math.log(1+(n-df+.5)/(df+.5))*tf*2.2/(tf+1.2*(.25+.75*ts.length/avg));},0)});
  const co=tokens.map(ts=>{let f=count(ts),dot=Object.keys(qf).reduce((a,t)=>a+qf[t]*(f[t]||0),0), norm=x=>Math.sqrt(Object.values(x).reduce((a,v)=>a+v*v,0));return norm(qf)*norm(f)?dot/(norm(qf)*norm(f)):0});
  const rank=(scores,positive=true)=>scores.map((s,i)=>({s,i})).filter(x=>!positive||x.s>0).sort((a,b)=>b.s-a.s||a.i-b.i).map(x=>x.i);
  const br=rank(bm),cr=rank(co); const rr=docs.map((_,i)=>(br.includes(i)?1/(60+br.indexOf(i)+1):0)+(cr.includes(i)?1/(60+cr.indexOf(i)+1):0));
  const er=docs.map((d,i)=>bm[i]+ent(d[2]).filter(e=>ent(query).includes(e)).length*.75);
  const edges=docs.map((d,i)=>docs.map((e,j)=>i!==j&&ent(d[2]).some(x=>ent(e[2]).includes(x))?j:-1).filter(j=>j>=0));
  const sum=er.reduce((a,x)=>a+x,0);let pr=er.map(s=>sum?s/sum:0); const seed=pr.slice();
  for(let t=0;t<30;t++){let next=seed.map(s=>.15*s);pr.forEach((s,i)=>{if(edges[i].length)edges[i].forEach(j=>next[j]+=.85*s/edges[i].length);else seed.forEach((v,j)=>next[j]+=.85*s*v)});pr=next}
  const groups={};docs.forEach((d,i)=>(groups[Math.floor(d[0]/300)]??=[]).push(i));
  const gRank=Object.entries(groups).map(([g,ix])=>({g,ix,score:ix.reduce((a,i)=>a+tokenize(docs[i][2]).slice(0,5).filter(t=>qt.includes(t)).length,0)})).filter(g=>g.score>0).sort((a,b)=>b.score-a.score||Number(a.g)-Number(b.g));
  const h=gRank.flatMap(g=>g.ix.sort((a,b)=>bm[b]-bm[a]||a-b));
  // A two-slot coarse-first + one raw rescue allocation; deduplicate, backfill raw if coarse has no hits.
  const rescue=[...new Set([...h.slice(0,2),...br])];
  const outputs={nearby:docs.map((d,i)=>({i,dist:Math.abs(d[0]-anchor)})).filter(x=>x.dist<=90).sort((a,b)=>a.dist-b.dist||a.i-b.i).map(x=>x.i),bm25:br,cosine:cr,rrf:rank(rr),entity:rank(er),graph:rank(pr),hierarchy:h,hierarchy_raw_rescue:rescue};
  for(const m of methods){const got=outputs[m].slice(0,K).map(i=>docs[i][1]);const hits=got.filter(id=>gold.includes(id)).length;rows.push({case:name,method:m,gold,got,hits,recall:gold.length?hits/gold.length:null,precision:got.length?hits/got.length:null,all:gold.length?hits===gold.length:null})}
 }
 const metrics=methods.map(m=>{const a=rows.filter(r=>r.method===m&&r.gold.length), neg=rows.filter(r=>r.method===m&&!r.gold.length);return {method:m,positive_cases:a.length,essential_hits:a.reduce((s,r)=>s+r.hits,0),essential_total:a.reduce((s,r)=>s+r.gold.length,0),macro_recall:a.reduce((s,r)=>s+r.recall,0)/a.length,all_essential:a.filter(r=>r.all).length,retrieved_positive:a.reduce((s,r)=>s+r.got.length,0),negative_empty:neg.filter(r=>!r.got.length).length,negative_total:neg.length}});
 return {experiment_id:"CC-C02-K-KR02-A02-E001-v0.1.0",description:"Author-generated isolated cases; queries supplied, fixed K=3 evidence units, no equal token/compute or independent annotations. Not an autonomous system or real-world acceptance test.",K,cases,rows,metrics};
}
console.log(JSON.stringify(experiment(),null,2));
