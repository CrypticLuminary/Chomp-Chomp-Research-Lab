// Node.js >=18; no packages; run: node <script> <fixture.json>
function run(fixture){
 const stop=new Set("a an the i he she it they we you my our his her to of for and or is was were are am be had has have with in on at from this that can could will would um uh".split(" "));
 const tokens=t=>t.toLowerCase().match(/[a-z]+/g)?.filter(w=>!stop.has(w))||[];
 const add=(a,b)=>{for(const [k,v] of Object.entries(b))a[k]=(a[k]||0)+v;return a;};
 const bow=t=>tokens(t).reduce((a,w)=>add(a,{[w]:1}),{});
 const dot=(a,b)=>Object.entries(a).reduce((s,[k,v])=>s+v*(b[k]||0),0);
 const norm=a=>Math.sqrt(dot(a,a));
 const unit=a=>Object.fromEntries(Object.entries(a).map(([k,v])=>[k,v/(norm(a)||1)]));
 const cos=(a,b)=>norm(a)&&norm(b)?dot(a,b)/(norm(a)*norm(b)):0;
 // Unsupervised co-occurrence vectors fit only on dev utterances, with OOV identity fallback.
 const co={};for(const doc of fixture.fixtures.filter(x=>x.split==="dev"))for(const t of doc.utterances){const words=[...new Set(tokens(t))];for(const w of words){co[w]??={};for(const q of words)if(q!==w)add(co[w],{[q]:1});}}
 const embed=t=>unit(tokens(t).reduce((a,w)=>add(a,add({["self:"+w]:1},Object.fromEntries(Object.entries(unit(co[w]||{})).map(([k,v])=>["context:"+k,v])))),{}));
 const spans=(n,b)=>[0,...b,n].slice(0,-1).map((x,i)=>[x,[...b,n][i]]);
 const fixed=(n,w,stride)=>{const x=[];for(let a=0;a<n;a+=stride){x.push([a,Math.min(a+w,n)]);if(a+w>=n)break;}return x;};
 const gap=(vec,k=2)=>vec.slice(1).map((_,j)=>{const i=j+1;return 1-cos(vec.slice(Math.max(0,i-k),i).reduce(add,{}),vec.slice(i,i+k).reduce(add,{}));});
 const peaks=(g,threshold)=>{const a=[];for(let i=0;i<g.length;i++)if(g[i]>=threshold&&g[i]>(g[i-1]??-1)&&g[i]>=(g[i+1]??-1))a.push(i+1);return a;};
 const dp=(v,penalty)=>{const n=v.length, costs=Array(n+1).fill(Infinity),last=Array(n+1).fill(0);costs[0]=-penalty;for(let j=1;j<=n;j++){let sum={},sq=0;for(let i=j-1;i>=Math.max(0,j-12);i--){sum=add(sum,v[i]);sq+=dot(v[i],v[i]);if(j-i<2&&n>1)continue;let c=costs[i]+sq-dot(sum,sum)/(j-i)+penalty;if(c<costs[j]){costs[j]=c;last[j]=i;}}}const out=[];for(let j=n;last[j]>0;j=last[j])out.unshift(last[j]);return out;};
 const docs=fixture.fixtures.map(x=>({...x,lex:x.utterances.map(bow),emb:x.utterances.map(embed)}));
 const methods={
 fixed:(x)=>fixed(x.utterances.length,4,4),
 overlap:(x)=>fixed(x.utterances.length,4,2),
 lexical:(x,t)=>spans(x.utterances.length,peaks(gap(x.lex),t)),
 embedding:(x,t)=>spans(x.utterances.length,peaks(gap(x.emb),t)),
 dp:(x,t)=>spans(x.utterances.length,dp(x.emb,t)),
 structured_proxy:(x,t)=>{let g=gap(x.emb);const breaks=peaks(g,t).filter(i=>!/^(but|because|then|for everyone|that is why|however)\b/i.test(x.utterances[i]));for(let i=1;i<x.utterances.length;i++)if(/^(anyway|let.s talk about|right back to)\b/i.test(x.utterances[i])&&!breaks.includes(i))breaks.push(i);return spans(x.utterances.length,breaks.sort((a,b)=>a-b));}
 };
 const evaluate=(x,p)=>{let n=x.utterances.length;let boundaries=[...new Set(p.flat().filter(v=>v>0&&v<n))].sort((a,b)=>a-b);let g=x.gold;const match=tol=>{let i=0,j=0,tp=0;while(i<boundaries.length&&j<g.length){if(Math.abs(boundaries[i]-g[j])<=tol){tp++;i++;j++;}else if(boundaries[i]<g[j])i++;else j++;}return tp;};const goldSpans=spans(n,g);let full=goldSpans.filter(([a,b])=>p.some(([s,e])=>s<=a&&e>=b)).length;return {id:x.id,gold:g,predicted_spans:p,edge_predictions:boundaries.length,gold_boundaries:g.length,exact:match(0),tolerant:match(1),gold_units:goldSpans.length,contained:full,windows:p.length,footage_units:p.reduce((s,[a,b])=>s+b-a,0),source_units:n};};
 const total=rs=>{let a={};for(const x of rs)for(const k of ["edge_predictions","gold_boundaries","exact","tolerant","gold_units","contained","windows","footage_units","source_units"])a[k]=(a[k]||0)+x[k];for(const k of ["exact","tolerant"])a[k+"_f1"]=2*a[k]/(a.edge_predictions+a.gold_boundaries);a.containment=a.contained/a.gold_units;return a;};
 const grids={fixed:[null],overlap:[null],lexical:[.45,.6,.75,.9,1],embedding:[.45,.6,.75,.9,1],dp:[.25,.5,.75,1,1.5,2,3],structured_proxy:[.45,.6,.75,.9,1]};
 const results={};for(const [m,fn] of Object.entries(methods)){const candidates=grids[m].map(t=>({parameter:t,dev:total(docs.filter(x=>x.split==="dev").map(x=>evaluate(x,fn(x,t))))}));candidates.sort((a,b)=>b.dev.exact_f1-a.dev.exact_f1||a.dev.edge_predictions-b.dev.edge_predictions);let chosen=candidates[0];let test=docs.filter(x=>x.split==="test").map(x=>evaluate(x,fn(x,chosen.parameter)));results[m]={chosen_parameter:chosen.parameter,dev_search:candidates,test_aggregate:total(test),test};}
 return {experiment:"CC-C02-K-KR01-A01-E002-v0.2.0",scope:"synthetic L3 only; no learned pretrained model, no audiovisual inference; structured_proxy is rule-based not LLM",metrics:"Micro F1 on unique interior edges, exact and ±1 utterance (10s). Overlap edges are proposal edges not partition boundaries. Full gold topic containment is not thought completeness; footage sums overlapping spans. Dev exact F1 tuned, tie fewer edges, then grid order. No statistical inference.",results};
}
const fs=require('node:fs');
console.log(JSON.stringify(run(JSON.parse(fs.readFileSync(process.argv[2],'utf8'))),null,2));
