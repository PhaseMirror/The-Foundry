import json, os
BASE = '/media/citizen/b361d448-7c51-413a-aa23-9515cb626930/home/citizen/Multiplicity/uor-foundry'
REPORT = os.path.join(BASE, 'Governance/ADR/adr_discrepancy_report.json')

with open(REPORT, 'r', encoding='utf-8') as f:
    data = json.load(f)

created = []
skipped = []

for entry in data:
    for ref in entry.get('missing_refs', []):
        # Clean reference: remove surrounding quotes, whitespace
        ref = ref.strip()
        # Skip URLs, absolute paths, and schemes
        if ref.startswith('http') or ref.startswith('https') or os.path.isabs(ref) or '://' in ref or ref.startswith('file:'):
            skipped.append(ref)
            continue
        # Resolve relative to repo base
        # If reference starts with '../' or './', normpath handles it
        path = os.path.normpath(os.path.join(BASE, ref))
        # Ensure path stays inside repo
        if not path.startswith(BASE):
            skipped.append(ref)
            continue
        # Create placeholder file if not exists
        if not os.path.exists(path):
            os.makedirs(os.path.dirname(path), exist_ok=True)
            # Write empty placeholder (could add a comment indicating auto‑generated)
            with open(path, 'w', encoding='utf-8') as pf:
                pf.write('# Placeholder created by deployment integration script\n')
            created.append(path)

print('Created', len(created), 'placeholder files')
for p in created:
    print(p)
print('Skipped', len(skipped), 'references (outside repo or non‑file)')
for s in skipped:
    print(s)
