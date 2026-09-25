import os
import re

filepath = '/home/multiplicity/Multiplicity/Phase Mirror/packages/multiplic/sites/echobraid/App.tsx'

with open(filepath, 'r') as f:
    content = f.read()

# The list of views to replace
views = [
    'Curriculum', 'Philosophy', 'AboutUs', 'Features', 'Mission', 'FAQ',
    'Teaching', 'PrivacyPolicy', 'TermsAndConditions', 'Disclaimer', 'Copilot', 'Services'
]

for view in views:
    # Replace import
    old_import = f"import {view}View from './components/{view}View';"
    new_import = f"import {view}Page from './pages/{view}Page';"
    content = content.replace(old_import, new_import)
    
    # Replace component usage
    old_tag = f"<{view}View"
    new_tag = f"<{view}Page"
    content = content.replace(old_tag, new_tag)

with open(filepath, 'w') as f:
    f.write(content)
