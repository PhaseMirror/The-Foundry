import json, os, re
BASE = '/media/citizen/b361d448-7c51-413a-aa23-9515cb626930/home/citizen/Multiplicity/uor-foundry'
REPORT = os.path.join(BASE, 'Governance/ADR/adr_discrepancy_report.json')

with open(REPORT, 'r', encoding='utf-8') as f:
    data = json.load(f)

created = []
skipped = []

for entry in data:
    for ref in entry.get('missing_refs', []):
        # Reject absolute paths, URLs, or malformed schemes
        if os.path.isabs(ref) or '://' in ref or ref.startswith('file:'):
            skipped.append(ref)
            continue
        # Clean potential leading './' or '../'
        clean_ref = os.path.normpath(ref)
        # Resolve within repo
        path = os.path.normpath(os.path.join(BASE, clean_ref))
        # Ensure still inside repo after normalization
        if not path.startswith(BASE):
            skipped.append(ref)
            continue
        # Create placeholder if missing
        if not os.path.exists(path):
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, 'w', encoding='utf-8') as f:
                f.write('')
            created.append(path)

print('Created', len(created), 'placeholder files')
for p in created:
    print(p)
print('Skipped', len(skipped), 'references')
for s in skipped:
    print(s)
