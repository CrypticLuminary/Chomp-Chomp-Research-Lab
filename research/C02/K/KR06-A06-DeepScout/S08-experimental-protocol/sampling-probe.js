// node sampling-probe.js; analytic synthetic mechanics only, no model inference.
// Uniform lattice phase grid and fixed, synthetic event durations; no oracle-driven sampler.
const ds=[0.1,0.2,0.5,1,2,4,8], gaps=[1,2,4,8], N=10000;
const out=gaps.map(g=>({gap_s:g,rows:ds.map(d=>{let hits=0;for(let i=0;i<N;i++){let phase=(i+0.5)*g/N;if(phase<d)hits++;}return {duration_s:d,hits,trials:N,recall:hits/N,analytic:Math.min(1,d/g)};})}));
console.log(JSON.stringify(out,null,2));
