// Synthetic Boolean oracle mechanics only. node CC-C02-K-KR03-A03-S08-v0.2.0-dependency-probe.js
const cases=[
  {
    "id": "redundant",
    "groups": [
      [
        "a"
      ],
      [
        "b"
      ]
    ],
    "evidence": [
      "a",
      "b",
      "n"
    ]
  },
  {
    "id": "joint",
    "groups": [
      [
        "a",
        "b"
      ]
    ],
    "evidence": [
      "a",
      "b",
      "n"
    ]
  },
  {
    "id": "mixed",
    "groups": [
      [
        "a",
        "b"
      ],
      [
        "c",
        "d"
      ]
    ],
    "evidence": [
      "a",
      "b",
      "c",
      "d",
      "n"
    ]
  },
  {
    "id": "shared",
    "groups": [
      [
        "a",
        "b"
      ],
      [
        "a",
        "c"
      ]
    ],
    "evidence": [
      "a",
      "b",
      "c",
      "n"
    ]
  },
  {
    "id": "single",
    "groups": [
      [
        "a"
      ]
    ],
    "evidence": [
      "a",
      "n"
    ]
  },
  {
    "id": "no_support",
    "groups": [],
    "evidence": [
      "n",
      "m"
    ]
  }
];
function probe(cases){return cases.map(({id,groups,evidence})=>{const ok=(xs)=>groups.some(g=>g.every(x=>xs.includes(x)));const full=ok(evidence),single=evidence.filter(x=>full&&!ok(evidence.filter(y=>y!==x)));let cuts=[];for(let m=1;m<(1<<evidence.length);m++){let drop=evidence.filter((_,i)=>(m>>i)&1);if(full&&!ok(evidence.filter(x=>!drop.includes(x)))&&!cuts.some(c=>c.every(x=>drop.includes(x))))cuts.push(drop)}return {id,full,individual_necessary:single,minimal_removal_groups:cuts,negative_control_preserved:ok(evidence.filter(x=>x!=="n"))===full,restoration:ok(evidence)===full}})}
console.log(JSON.stringify(probe(cases),null,2));
