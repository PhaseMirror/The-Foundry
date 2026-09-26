import os
import zipfile
import xml.etree.ElementTree as ET
import subprocess
import glob
import sys
import shutil

PROPOSED_DIR = "/media/citizen/b361d448-7c51-413a-aa23-9515cb626930/home/citizen/Multiplicity/packages/uor-foundry-main/docs/adr/proposed"
ACCEPTED_DIR = "/media/citizen/b361d448-7c51-413a-aa23-9515cb626930/home/citizen/Multiplicity/packages/uor-foundry-main/docs/adr/accepted"

def extract_text_from_docx(docx_path):
    try:
        with zipfile.ZipFile(docx_path) as docx:
            xml_content = docx.read('word/document.xml')
        tree = ET.XML(xml_content)
        namespace = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        text = []
        for paragraph in tree.iterfind('.//w:p', namespace):
            texts = [node.text for node in paragraph.iterfind('.//w:t', namespace) if node.text]
            if texts:
                text.append(''.join(texts))
        return '\n'.join(text)
    except Exception as e:
        return f"Error extracting DOCX: {e}"

def extract_text_from_pdf(pdf_path):
    try:
        result = subprocess.run(['pdftotext', pdf_path, '-'], capture_output=True, text=True, check=True)
        return result.stdout
    except Exception as e:
        return f"Error extracting PDF: {e}"

def process_file(file_path):
    filename = os.path.basename(file_path)
    print(f"Processing {filename}...")
    
    if filename.endswith('.docx'):
        content = extract_text_from_docx(file_path)
    elif filename.endswith('.pdf'):
        content = extract_text_from_pdf(file_path)
    else:
        print(f"Skipping {filename}: unsupported format.")
        return
    
    prompt = f"""You are an expert software architect. Convert the following text into an Architecture Decision Record (ADR) using the strictly following inhouse format:

# ADR-[Appropriate Identifier]: [Title]

**Status:** Proposed

## Context
[Context from text]

## Decision
[Decision from text]

## Consequences
* [Consequence 1]
* [Consequence 2]

## Traceability & Artifact Links
* **[Source Document]** `{filename}` — Original proposed document

Here is the document text:
==========================
{content}
==========================
"""
    
    try:
        # call agy to process
        print(f"Calling LLM for {filename}...")
        result = subprocess.run(
            ['agy', '--dangerously-skip-permissions', '--print', prompt],
            capture_output=True,
            text=True,
            check=True
        )
        
        output_filename = "ADR-" + os.path.splitext(filename)[0][:30] + ".md"
        output_path = os.path.join(ACCEPTED_DIR, output_filename)
        
        with open(output_path, "w") as f:
            f.write(result.stdout)
            
        print(f"Saved {output_path}")
    except subprocess.CalledProcessError as e:
        print(f"Error calling agy for {filename}: {e.stderr}")

def main():
    files = glob.glob(os.path.join(PROPOSED_DIR, "*"))
    for f in files:
        if os.path.isfile(f):
            process_file(f)

if __name__ == "__main__":
    main()
