# PMD Badge Specification: Certification Insignia & Deployment

**Multiplicity Foundation | Meta-Relativity v1.0**  
**Provenance:** MultiplicityFoundation/Meta-Relativity  
**Badge Standard:** SVG + metadata  
**Version:** 1.0  
**Date:** March 2026  
**Related:** [TRANSPARENCY_CLAUSE.md](TRANSPARENCY_CLAUSE.md), [TUNING_FORK_MODULES.md](TUNING_FORK_MODULES.md)

---

## Table of Contents

1. Badge Identity & Visual Design
2. SVG Template (Production)
3. PNG Fallback Specification
4. Metadata Embedding
5. Deployment Sites & Rules
6. Revocation Rendering (Grayed Badge)
7. Usage Policy & Attribution
8. Link-Back Requirements
9. Version History & Changelog

---

## 1. Badge Identity & Visual Design

### 1.1 Official Badge

**Name:** PMD-Certified: Ξ(t)-Core  
**Full name:** Multiplicity Prime Determinacy Certified  
**Visual identifier:** Greek letter Ξ (Xi) + checkmark  
**Colors:** Green (#22C055) for active, Gray (#A0A0A0) for revoked  
**Aspect ratio:** 4:1 (landscape) or 1:1 (square)

### 1.2 Design System

**Logo:** Ξ (Xi) symbol with mathematical precision  
- Font: TeX Gyre Termes (mathematical-grade serif)
- Size: scales 24–256 pixels
- Color: #22C055 (active), #A0A0A0 (revoked)

**Text:**
- Label 1: "PMD-Certified"
- Label 2: "Ξ(t)-Core"
- Optional: "v1.0" (specification version)
- Optional: "Since [date]" (certification date)

**Checkmark:** Green ✓ overlaid on Xi  
- Symbolizes: "mathematically verified"
- Must appear on active badges only

---

## 2. SVG Template (Production)

### 2.1 Landscape Badge (4:1 aspect ratio)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" width="400" height="100">
  <defs>
    <style>
      .pmd-background { fill: #fff; stroke: #22C055; stroke-width: 2; }
      .pmd-text-primary { font-family: "TeX Gyre Termes", serif; font-size: 28px; fill: #22C055; font-weight: bold; }
      .pmd-text-secondary { font-family: "TeX Gyre Termes", serif; font-size: 20px; fill: #1a8d3f; }
      .pmd-xi-symbol { font-family: "DejaVu Serif", serif; font-size: 48px; fill: #22C055; }
      .pmd-checkmark { font-family: Arial, sans-serif; font-size: 32px; fill: #22C055; }
    </style>
  </defs>

  <!-- Background -->
  <rect x="2" y="2" width="396" height="96" class="pmd-background" rx="8" ry="8"/>

  <!-- Xi Symbol (left) -->
  <text x="25" y="60" class="pmd-xi-symbol">Ξ</text>

  <!-- Checkmark over Xi (optional overlay for active status) -->
  <circle cx="40" cy="45" r="12" fill="none" stroke="#22C055" stroke-width="1" opacity="0.3"/>
  <text x="32" y="60" class="pmd-checkmark">✓</text>

  <!-- Text: "PMD-Certified" -->
  <text x="65" y="35" class="pmd-text-primary">PMD-Certified</text>

  <!-- Text: "Ξ(t)-Core" -->
  <text x="65" y="60" class="pmd-text-secondary">Ξ(t)-Core</text>

  <!-- Version: "v1.0" (optional) -->
  <text x="340" y="85" style="font-family: Arial, sans-serif; font-size: 10px; fill: #999;">v1.0</text>
</svg>
```

### 2.2 Square Badge (1:1 aspect ratio)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <style>
      .pmd-bg { fill: #fff; stroke: #22C055; stroke-width: 2; }
      .pmd-xi { font-family: "TeX Gyre Termes", serif; font-size: 60px; fill: #22C055; font-weight: bold; }
      .pmd-check { font-family: Arial, sans-serif; font-size: 24px; fill: #22C055; }
    </style>
  </defs>

  <!-- Background -->
  <rect x="2" y="2" width="96" height="96" class="pmd-bg" rx="8" ry="8"/>

  <!-- Xi Symbol (centered) -->
  <text x="30" y="65" class="pmd-xi">Ξ</text>

  <!-- Checkmark overlay -->
  <circle cx="65" cy="35" r="14" fill="none" stroke="#22C055" stroke-width="1" opacity="0.4"/>
  <text x="57" y="48" class="pmd-check">✓</text>

  <!-- Tiny text at bottom: optional version or certified date -->
  <text x="50" y="95" style="font-family: Arial, sans-serif; font-size: 7px; text-anchor: middle; fill: #999;">v1.0</text>
</svg>
```

---

## 3. PNG Fallback Specification

For environments that don't support SVG (outdated tools, legacy systems):

### 3.1 PNG Image Specs

| Property | Value |
|----------|-------|
| Format | PNG (RGBA) |
| Dimensions | 400×100 px (landscape) or 100×100 px (square) |
| Color depth | 32-bit (8-bit per channel) |
| Transparent background | Yes (#fff @ 100% opaque for badge area) |
| DPI | 96 (web standard) |
| Compression | PNG lossless (level 9) |
| Interlacing | Adam7 (progressive rendering) |

### 3.2 Generating PNG from SVG

```bash
# Using Inkscape
inkscape pmd_badge_landscape.svg --export-filename=pmd_badge_landscape.png --export-width=400 --export-height=100

# Using ImageMagick
convert -density 96 pmd_badge_landscape.svg -background none -resize 400x100 pmd_badge_landscape.png

# Using librsvg (cairo)
rsvg-convert -w 400 -h 100 -f png pmd_badge_landscape.svg > pmd_badge_landscape.png
```

---

## 4. Metadata Embedding

### 4.1 Metadata in SVG

Embed metadata as XML comments in SVG for programmatic parsing:

```svg
<svg ...>
  <!-- PMD-Badge Metadata
    {
      "pmd_version": "1.0",
      "module_name": "gft_melonic",
      "prime_index": 13,
      "certification_date": "2026-03-17",
      "certificate_id": "CC20260317_001",
      "tuning_fork_url": "https://github.com/MultiplicityFoundation/Meta-Relativity/blob/main/pirtm/docs/PRIME_FREQUENCY_INTEGRITY_SUITE.md#registry",
      "status": "ACTIVE",  // or "REVOKED"
      "revocation_reason": null,  // set if REVOKED
      "expiration_date": null    // optional, null = no expiration
    }
  -->
  ...
</svg>
```

### 4.2 HTML Data Attributes

When embedded in HTML, include metadata as data attributes:

```html
<img 
  src="pmd_badge.svg" 
  alt="PMD-Certified: Ξ(t)-Core" 
  title="Multiplicity Prime Determinacy Certified"
  data-pmd-version="1.0"
  data-module-name="gft_melonic"
  data-prime-index="13"
  data-certification-date="2026-03-17"
  data-tuning-fork-url="https://..."
  data-status="ACTIVE"
/>
```

### 4.3 JSON Sidecar File

For environments that need machine-readable metadata, include sidecar `.json`:

```json
{
  "badge_file": "pmd_badge_gft_melonic.svg",
  "module_name": "gft_melonic",
  "prime_index": 13,
  "pmd_version": "1.0",
  "certification_timestamp": "2026-03-17T10:00:00Z",
  "certificate_id": "CC20260317_001",
  "clone_check_id": "CC20260317_001",
  "valid_until": null,
  "status": "ACTIVE",
  "tuning_fork_entry": "https://...",
  "transparency_clause_link": "https://...",
  "contact": "alice@exampleorg.io"
}
```

---

## 5. Deployment Sites & Rules

### 5.1 Mandatory Deployment Sites

Every PMD-Certified module MUST display the badge at:

1. **README.md (top of file)**
   ```markdown
   # My Module Name
   
   [![PMD-Certified: Ξ(t)-Core](pmd_badge.svg)](https://github.com/MultiplicityFoundation/Meta-Relativity/blob/main/pirtm/docs/PRIME_FREQUENCY_INTEGRITY_SUITE.md)
   
   This module is certified as prime-contractive.
   ```

2. **Project landing page / website**
   - Include badge in hero section or trust indicators
   - Make badge clickable (link to registry entry)

3. **API documentation (if applicable)**
   ```python
   """
   gft_melonic: GFT Melonic Graph Module
   
   Status: [![PMD-Certified](badge.svg)](registry_url)
   Prime Index: 13
   Certification: 2026-03-17
   """
   ```

4. **Package metadata (if distributed via PyPI, npm, etc.)**
   ```json
   {
     "name": "gft_melonic",
     "version": "1.0.0",
     "badges": [
       {"url": "https://...", "alt": "PMD-Certified: Ξ(t)-Core"}
     ]
   }
   ```

### 5.2 Optional Deployment Sites

- Academic papers (acknowledgments section)
- Security audit reports
- Product whitepapers
- Press releases

---

## 6. Revocation Rendering (Grayed Badge)

### 6.1 Revoking a Badge

When a module is revoked, the badge **must** be grayed out and marked "REVOKED":

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" width="400" height="100">
  <defs>
    <style>
      .pmd-bg-revoked { fill: #f5f5f5; stroke: #a0a0a0; stroke-width: 2; }
      .pmd-text-revoked { font-family: "TeX Gyre Termes", serif; font-size: 28px; fill: #a0a0a0; }
      .pmd-xi-revoked { font-family: "TeX Gyre Termes", serif; font-size: 48px; fill: #a0a0a0; opacity: 0.6; }
      .pmd-revoked-label { font-family: Arial, sans-serif; font-size: 14px; fill: #d32f2f; font-weight: bold; }
    </style>
  </defs>

  <!-- Grayed background -->
  <rect x="2" y="2" width="396" height="96" class="pmd-bg-revoked" rx="8" ry="8"/>

  <!-- Faded Xi -->
  <text x="25" y="60" class="pmd-xi-revoked">Ξ</text>

  <!-- Grayed text -->
  <text x="65" y="35" class="pmd-text-revoked">PMD-Certified (REVOKED)</text>
  <text x="65" y="60" style="font-family: TeX Gyre Termes, serif; font-size: 16px; fill: #d32f2f;">Certification revoked on 2026-03-18</text>

  <!-- Strikethrough or X overlay (optional) -->
  <line x1="30" y1="80" x2="350" y2="20" stroke="#d32f2f" stroke-width="3" opacity="0.3"/>
</svg>
```

### 6.2 Revocation Notification

When a badge is revoked, the HTML must include:

```html
<div class="pmd-revoked-notice">
  <img src="pmd_badge_revoked.svg" alt="PMD-Certified (REVOKED)">
  <p>
    <strong>Certification Revoked:</strong> This module's PMD-Certified status 
    was revoked on <time datetime="2026-03-18">March 18, 2026</time>.
  </p>
  <p><strong>Reason:</strong> Clone detection failure. Module violates Transparency Clause.</p>
  <p><strong>Next steps:</strong> 
    <a href="https://registry.url/appeal">File appeal</a> or 
    <a href="https://contact">contact governance</a>
  </p>
</div>
```

---

## 7. Usage Policy & Attribution

### 7.1 Official Use (Allowed)

✓ Display badge on your module's public README  
✓ Include badge in academic papers (with citation)  
✓ Use badge in security/audit reports  
✓ Link badge to official Tuning Fork registry entry  

### 7.2 Misuse (Prohibited)

✗ Modify badge colors or design  
✗ Display badge on unregistered modules  
✗ Crop or watermark the badge  
✗ Link badge to a different URL than official registry  
✗ Use revoked badge as though it were active  

**Misuse penalty:** Audit escalation + possible legal action (if malicious).

---

## 8. Link-Back Requirements

### 8.1 Registry Link (Mandatory)

Every badge MUST be a hyperlink to the official Tuning Fork registry entry:

```html
<a href="https://github.com/MultiplicityFoundation/Meta-Relativity/blob/main/pirtm/docs/PRIME_FREQUENCY_INTEGRITY_SUITE.md#registry">
  <img src="pmd_badge.svg" alt="PMD-Certified: Ξ(t)-Core">
</a>
```

**Why:** Users clicking badge get full transparency: certification status, date, prime index, audit logs.

### 8.2 Link Format

**Standard URL:**
```
https://github.com/MultiplicityFoundation/Meta-Relativity/blob/main/pirtm/docs/PRIME_FREQUENCY_INTEGRITY_SUITE.md?module=[module_name]&prime=[prime_index]
```

**Example:**
```
https://github.com/MultiplicityFoundation/Meta-Relativity/blob/main/pirtm/docs/PRIME_FREQUENCY_INTEGRITY_SUITE.md?module=gft_melonic&prime=13
```

**Registry system (future):** Will support direct link to module entry:
```
https://registry.pirtm.io/modules/gft_melonic
```

---

## 9. Version History & Changelog

### 9.1 Badge Versioning

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 0.1 | Jan 2026 | Initial design (internal) | archived |
| 0.5 | Feb 2026 | Added revocation state; improved contrast | archived |
| 1.0 | Mar 2026 | Final spec; SVG + PNG + metadata | **CURRENT** |
| 1.1 (planned) | Q3 2026 | Animated badge variant; time-limited certs | TBD |

### 9.2 Design Evolution

**v0.1:** Simple text "CERTIFIED" with checkmark

**v0.5:** Added Xi symbol, improved readability, added metadata embedding

**v1.0 (current):**
- Professional 4:1 landscape design
- Square 1:1 alternative
- Proper SVG templates for production
- Metadata sidecar support
- Revocation state rendering
- Link-back requirements documented

### 9.3 Future Enhancements (Not in v1.0)

- Animated SVG badge (pulsing checkmark on hover)
- Time-limited certification (expiration date rendering)
- Micro-certificate format (embedded in hash)
- QR code with verifiable link

---

## Closing Guideline

The PMD Badge is your **public proof of integrity**. Display it proudly. Update it immediately if status changes. Link to the registry so users can verify.

The badge encodes a single promise:

> "This module passes all five Ξ(t) invariants and has been verified as an authentic PIRTM implementation."

Keep that promise.

---

**Badge Specification v1.0 Locked:** March 17, 2026  
**Next:** Full integration testing and commit
