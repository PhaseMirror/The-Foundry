import os, glob, re, shutil

BASE = '/media/citizen/b361d448-7c51-413a-aa23-9515cb626930/home/citizen/Multiplicity/uor-foundry/Governance/ADR'
ACCEPTED = os.path.join(BASE, 'accepted')
COMPLETED = os.path.join(BASE, 'completed')

os.makedirs(COMPLETED, exist_ok=True)

def is_ready(adr_path):
    """Determine if ADR references only existing repository files.
    Returns True if all referenced paths exist, False otherwise.
    """
    with open(adr_path, 'r', encoding='utf-8') as f:
        content = f.read()
    # Capture backtick code references and markdown links.
    refs = re.findall(r'`([^`]+\.[a-zA-Z0-9]+)`', content)
    refs += re.findall(r'\[(?:[^\]]+)\]\(([^)]+)\)', content)
    # Filter out URLs and empty strings.
    refs = [r for r in refs if r and not r.startswith('http')]
    if not refs:
        return False
    for r in refs:
        # Resolve relative to repo root.
        cand = os.path.join('/media/citizen/b361d448-7c51-413a-aa23-9515cb626930/home/citizen/Multiplicity/uor-foundry', r)
        if not os.path.exists(cand):
            return False
    return True

moved = []
skipped = []
for md in glob.glob(os.path.join(ACCEPTED, '*.md')):
    name = os.path.basename(md)
    dest = os.path.join(COMPLETED, name)
    if os.path.exists(dest):
        # Already present – consider it completed.
        skipped.append(name + ' (already in completed)')
        continue
    if is_ready(md):
        shutil.move(md, dest)
        moved.append(name)
    else:
        skipped.append(name + ' (not ready)')

print('Moved:', moved)
print('Skipped:', skipped)
