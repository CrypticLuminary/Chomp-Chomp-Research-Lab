# Naming convention

Artifact: CC-C02-K-KR01-A01-S03-v0.1.0-source-audit.md
Project CC; cycle C02; phase K (knowledge); task KR01; role A01; substage S03; milestone version v0.1.0; descriptive slug. Stable index files (README.md, manifest.yaml, progress.json, JOURNAL.md, CHANGELOG.md, findings.json) are exceptions.

Branch: research/cc-c02-k-kr01-a01-v0.1.0. Keep the branch name stable through draft revisions; it records the starting version. Do not rename branches at every milestone. Record current version in manifest. Release tag (coordinator only): cc-c02-k-kr01-a01-v1.0.0.

Finding: CC-C02-K-KR01-F001; question: CC-C02-K-KR01-Q001; experiment: CC-C02-K-KR01-A01-E001-v0.1.0; proposed decision: CC-C02-K-KR01-D001; accepted architecture decision: CC-C02-ADR-001. IDs are immutable; mark superseded rather than reuse. Agent IDs denote roles, not models. Record actual execution separately.

Commit: [CC-C02-K-KR01-A01-S03] Trace source code.

Versions: v0.1.0 draft, v0.2.0 substantive expansion, v0.2.1 correction, v0.9.0 review submission, v1.0.0 approved, v1.1.0 compatible extension, v2.0.0 major revision. Use Git history rather than duplicate artifacts at every edit; rename/version at meaningful milestones and retain stable finding IDs.

Substages:
- S00 assignment
- S01 problem-definition
- S02 literature-review
- S03 source-code-audit
- S04 method-reconstruction
- S05 dataset-model-feasibility
- S06 comparative-analysis
- S07 transfer-design
- S08 experimental-protocol
- S09 final-synthesis
- S10 review-handoff
