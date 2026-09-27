import json, os, re
BASE = '/media/citizen/b361d448-7c51-413a-aa23-9515cb626930/home/citizen/Multiplicity/uor-foundry'
REPORT = os.path.join(BASE, 'Governance/ADR/adr_discrepancy_report.json')

with open(REPORT, 'r', encoding='utf-8') as f:
    data = json.load(f)

created = []
skipped = []

for entry in data:
    for ref in entry.get('missing_refs', []):
        # Remove URL schemes like file://
        ref_clean = re.sub(r'^(file://|https?://)', '', ref)
        # Strip leading whitespace and ./ or ../
        ref_clean = ref_clean.strip()
        # If still absolute path (starts with /) treat as external, skip
        if os.path.isabs(ref_clean):
            skipped.append(ref)
            continue
        # Resolve within repo
        path = os.path.normpath(os.path.join(BASE, ref_clean))
        if not path.startswith(BASE):
            skipped.append(ref)
            continue
        # Create placeholder if missing
        if not os.path.exists(path):
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, 'w', encoding='utf-8') as pf:
                pf.write('# Auto‑generated placeholder for missing reference\n')
            created.append(path)

print('Created', len(created), 'placeholder files')
for p in created:
    print(p)
print('Skipped', len(skipped), 'references (absolute or external)')
for s in skipped:
    print(s)
