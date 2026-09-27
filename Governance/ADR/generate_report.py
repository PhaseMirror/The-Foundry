import os, glob, re, json
BASE = '/media/citizen/b361d448-7c51-413a-aa23-9515cb626930/home/citizen/Multiplicity/uor-foundry'
ACCEPTED = os.path.join(BASE, 'Governance/ADR/accepted')
COMPLETED = os.path.join(BASE, 'Governance/ADR/completed')

def refs_in_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    refs = re.findall(r'`([^`]+\.[a-zA-Z0-9]+)`', content)
    refs += re.findall(r'\[(?:[^\]]+)\]\(([^)]+)\)', content)
    refs = [r for r in refs if r and not r.startswith('http')]
    return refs

def missing_refs(refs):
    missing = []
    for r in refs:
        cand = os.path.join(BASE, r)
        if not os.path.exists(cand):
            missing.append(r)
    return missing

report = []
for md in glob.glob(os.path.join(ACCEPTED, '*.md')):
    name = os.path.basename(md)
    refs = refs_in_file(md)
    miss = missing_refs(refs)
    status = 'ready' if refs and not miss else ('no_refs' if not refs else 'missing')
    report.append({'adr': name, 'status': status, 'missing_refs': miss})

out_path = os.path.join(BASE, 'Governance/ADR/adr_discrepancy_report.json')
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(report, f, indent=2)
print('Report written to', out_path)
