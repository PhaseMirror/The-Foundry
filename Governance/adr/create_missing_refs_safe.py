import json, os
BASE = '/media/citizen/b361d448-7c51-413a-aa23-9515cb626930/home/citizen/Multiplicity/uor-foundry'
REPORT = os.path.join(BASE, 'Governance/ADR/adr_discrepancy_report.json')

with open(REPORT, 'r', encoding='utf-8') as f:
    data = json.load(f)

created = []
skipped = []
for entry in data:
    for ref in entry.get('missing_refs', []):
        # Skip absolute paths or paths that would escape BASE
        if os.path.isabs(ref):
            skipped.append(ref)
            continue
        path = os.path.normpath(os.path.join(BASE, ref))
        if not path.startswith(BASE):
            skipped.append(ref)
            continue
        if not os.path.exists(path):
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, 'w', encoding='utf-8') as f:
                f.write('')
            created.append(path)

print('Created', len(created), 'placeholder files')
for p in created:
    print(p)
print('Skipped', len(skipped), 'references (outside repo or absolute)')
for s in skipped:
    print(s)
