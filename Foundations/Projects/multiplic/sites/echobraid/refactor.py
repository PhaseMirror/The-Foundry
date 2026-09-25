import os
import glob
import re

pages_dir = 'pages'

for filepath in glob.glob(os.path.join(pages_dir, '*Page.tsx')):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Replace ComponentView with ComponentPage
    basename = os.path.basename(filepath)
    component_name = basename.replace('.tsx', '')
    old_component_name = component_name.replace('Page', 'View')
    
    content = content.replace(old_component_name, component_name)
    
    with open(filepath, 'w') as f:
        f.write(content)
