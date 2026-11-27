// Synthetic arithmetic probes, run with node CC-C02-K-KR08-A08-S08-v0.2.0-metric-probes.js
const runProbes=function runProbes(){
 const ratio=(a,b)=>b?a/b:null, inter=(a,b)=>Math.max(0,Math.min(a[1],b[1])-Math.max(a[0],b[0])), iou=(a,b)=>inter(a,b)/(a[1]-a[0]+b[1]-b[0]-inter(a,b)), contains=(a,b)=>a[0]<=b[0]&&a[1]>=b[1];
 const ap=(gt,pred)=>{if(!gt.length)return null;const seen=new Set();let n=0,s=0;pred.forEach((x,i)=>{if(gt.includes(x)&&!seen.has(x)){seen.add(x);n++;s+=n/(i+1)}});return s/gt.length};
 const naiveAP=(gt,pred)=>{let n=0,s=0;pred.forEach((x,i)=>{if(gt.includes(x)){n++;s+=n/(i+1)}});return s/gt.length};
 const groups=(clip,alternatives)=>alternatives.some(g=>g.every(x=>contains(clip,x)));
 const pairOK=(clip,pairs)=>pairs.some(p=>p[0][0]<=clip[0]&&clip[0]<=p[0][1]&&p[1][0]<=clip[1]&&clip[1]<=p[1][1]);
 const empty=(gold,complete,status,coverage,selected)=>complete&&gold===0?status==="success"&&coverage&&selected===0:null;
 const results=[];
 const check=(name,actual,expected)=>{if(JSON.stringify(actual)!==JSON.stringify(expected))throw Error(name+": "+JSON.stringify(actual));results.push({name,actual,expected,pass:true})};
 check("undefined empty precision",ratio(0,0),null);
 check("duplicate AP upstream arithmetic",naiveAP([1],[1,1]),2);
 check("duplicate-safe AP",ap([1],[1,1]),1);
 check("failed negative is not correct abstention",empty(0,true,"failure",false,0),false);
 check("partial negative is not correct abstention",empty(0,true,"success",false,0),false);
 check("true empty",empty(0,true,"success",true,0),true);
 check("unknown negative",empty(0,false,"success",true,0),null);
 check("critical qualification omitted despite IoU",iou([0,9900],[0,10000]),.99);
 check("closure rejects omitted qualification",groups([0,9900],[[[0,1000],[9900,10000]]]),false);
 check("alternative explanation sufficient",groups([4000,10000],[[[0,1000],[8000,9000]],[[4000,5000],[8000,9000]]]),true);
 check("cross-pair invalid",pairOK([2000,6000],[[[0,0],[6000,6000]],[[2000,2000],[9000,9000]]]),false);
 check("event coverage vs clip coverage",[ratio(1,1),ratio(1,2)], [1,.5]);
 check("missing run must stay in assigned roster",ratio(1,2),.5);
 check("unknown selected reviews bounds",[ratio(1,3),ratio(2,3)],[1/3,2/3]);
 return {origin:"synthetic",method:"authored deterministic arithmetic checks; not upstream execution or real-media evidence",count:results.length,results};
};
console.log(JSON.stringify(runProbes(),null,2));
