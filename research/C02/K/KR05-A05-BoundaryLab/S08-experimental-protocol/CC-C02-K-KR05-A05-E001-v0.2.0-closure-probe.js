function run(){
 const cases=[
 {id:"motivation",core:[38,44],req:[[5,9],[45,49]],unit:[0,53]},
 {id:"controversy",core:[20,27],req:[[28,33]],unit:[12,37]},
 {id:"roast",core:[20,24],req:[[10,15]],unit:[8,27]},
 {id:"callback",core:[2400,2405],req:[[20,24]],unit:[2395,2410]},
 {id:"quiet_emotion",core:[24,29],req:[[6,13],[30,34]],unit:[0,40]},
 {id:"silent_comedy",core:[20,24],req:[[11,15],[25,28]],unit:[10,31]},
 {id:"gameplay",core:[25,30],req:[[12,18]],unit:[11,32]},
 {id:"nested",core:[20,26],req:[[18,20]],unit:[0,55]},
 {id:"interleaved",core:[40,44],req:[[36,39],[44,46]],unit:[35,50]},
 {id:"delayed_correction",core:[40,46],req:[[180,185]],unit:[32,49]},
 {id:"ambiguous_reference",core:[18,23],req:[[5,10]],unit:[0,28]},
 {id:"no_feasible",core:[50,55],req:[[10,15],[70,75]],unit:[0,80]},
 {id:"correlated_pairs",core:[20,24],req:[],unit:[10,30],conditions:true},
 {id:"technical_conflict",core:[20,27],req:[[28,32]],unit:[18,33],safeEnd:33},
 {id:"simple",core:[20,24],req:[],unit:[19,25]}
 ];
 const MAX=30, contains=(p,r)=>p[0]<=r[0]&&p[1]>=r[1],dur=p=>p[1]-p[0];
 function geometry(p,c){return !!p&&p[0]>=0&&p[1]>p[0]&&dur(p)<=MAX&&contains(p,c.core)}
 function closure(p,c,req=c.req,conditional=true){if(!geometry(p,c)||!req.every(r=>contains(p,r)))return false;if(conditional&&c.conditions){if(p[0]<15&&p[1]<30)return false;if(p[1]>25&&p[0]>10)return false;}if(c.safeEnd&&p[1]!==c.safeEnd)return false;return true}
 function fixed(c){let p=[Math.max(0,c.core[0]-5),c.core[1]+5];return geometry(p,c)?p:null}
 function unit(c){return geometry(c.unit,c)?c.unit:null}
 function hull(c){let p=[Math.min(c.core[0],...c.req.map(r=>r[0])),Math.max(c.core[1],...c.req.map(r=>r[1]))];return geometry(p,c)?p:null}
 function search(c,mode){const req=mode==="drop-last"?c.req.slice(0,-1):c.req, starts=[c.core[0],c.unit[0],...c.req.map(r=>r[0]),...(c.conditions?[10,20]:[])],ends=[c.core[1],c.unit[1],...c.req.map(r=>r[1]),...(c.conditions?[24,30]:[]),...(c.safeEnd?[c.safeEnd]:[])];let pairs=[];for(let s of new Set(starts))for(let e of new Set(ends)){let p=[s,e];if(closure(p,c,req,mode!=="ignore-conditions"))pairs.push(p)}return pairs.sort((a,b)=>dur(a)-dur(b)||a[0]-b[0])[0]||null}
 const methods={fixed,unit,hull,closure:c=>search(c,"oracle"),missing:c=>search(c,"drop-last"),uncorrelated:c=>search(c,"ignore-conditions")};
 const rows=cases.map(c=>{let gold=search(c,"oracle");let outcomes={};for(let [k,m] of Object.entries(methods)){let p=m(c);outcomes[k]={interval_ms:p&&p.map(t=>1000*t),faithful_by_fixture:!!p&&closure(p,c),correct_abstain:!p&&!gold,false_abstain:!p&&!!gold};}return {id:c.id,feasible:!!gold,outcomes}});
 const summary=Object.keys(methods).map(m=>{let o=rows.map(r=>r.outcomes[m]);let accepted=o.filter(x=>x.interval_ms),good=accepted.filter(x=>x.faithful_by_fixture);return {method:m,accepted:accepted.length,faithful:good.length,invalid:accepted.length-good.length,correct_abstain:o.filter(x=>x.correct_abstain).length,false_abstain:o.filter(x=>x.false_abstain).length,mean_faithful_duration_ms:good.length?good.reduce((a,x)=>a+x.interval_ms[1]-x.interval_ms[0],0)/good.length:null}});
 const c=cases.find(c=>c.conditions), pairs=[[10,30],[20,24],[10,24],[20,30]].map(p=>({interval_ms:p.map(t=>t*1000),accepted:closure(p,c)}));
 const iou=(a,b)=>Math.max(0,Math.min(a[1],b[1])-Math.max(a[0],b[0]))/(Math.max(a[1],b[1])-Math.min(a[0],b[0]));
 const highIoU={gold_ms:[10000,40000],cut_ms:[10000,39000],essential_qualification_ms:[39000,40000],iou:iou([10,40],[10,39]),covers_qualification:contains([10,39],[39,40])};
 const q=cases.find(c=>c.id==="technical_conflict"),snap={original:[18000,33000],snapped:[18000,30000],original_valid:closure([18,33],q),snapped_valid:closure([18,30],q)};
 const test=summary.find(x=>x.method==="closure");if(test.invalid!==0||test.false_abstain!==0||pairs.filter(x=>x.accepted).length!==2||highIoU.covers_qualification||!snap.original_valid||snap.snapped_valid)throw Error("fixture invariant failed");
 return {fixture_count:cases.length,feasible:rows.filter(r=>r.feasible).length,summary,correlated_pairs:pairs,highIoU,snap,rows};
}
console.log(JSON.stringify(run(), null, 2));
