import json, os
BASE = '/media/citizen/b361d448-7c51-413a-aa23-9515cb626930/home/citizen/Multiplicity/uor-foundry'
REPORT = os.path.join(BASE, 'Governance/ADR/adr_discrepancy_report.json')

with open(REPORT, 'r', encoding='utf-8') as f:
    data = json.load(f)

created = []
for entry in data:
    missing = entry.get('missing_refs', [])
    for ref in missing:
        # Resolve relative to BASE
        path = os.path.join(BASE, ref)
        # Normalize path
        path = os.path.normpath(path)
        if not os.path.exists(path):
            os.makedirs(os.path.dirname(path), exist_ok=True)
            # Create empty file
            with open(path, 'w', encoding='utf-8') as f:
                f.write('')
            created.append(path)

print('Created', len(created), 'missing reference files')
print('\n'.join(created))
