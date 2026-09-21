# Wisely's Writeups Portfolio

A curated portfolio and archive of technical CTF writeups, vulnerability research, and security challenge breakdowns, with a primary focus on **Web Exploitation**.

## Published Writeups

### Web Security
- **[Macrohard Azuer](writeups/macrohard-azuer.html)** (K17 CTF) — Whitebox analysis, `urljoin()` control, and NaN-based bypass to reach internal flags.
- **[GaslightCTF Series](writeups/gaslightctf.html)** (5 Web Challenges) — Comprehensive breakdowns for *JSON Warehouse*, *MessageBoard*, *Corridors*, *Biscuit*, and *Crawl*.
- **[HVL](writeups/hvl.html)** (V1T 2026) — Reverse engineering custom font glyph mapping disguised in the DOM.

### Misc & OSINT
- **[QR Reconstruction](writeups/bronco-qr-reconstruction.html)** (BroncoCTF) — Manual spatial alignment and fragmented QR code recovery.
- **[Admin Fury](writeups/admin-fury.html)** (FIT Competition) — Floor plan analysis and booth coordinate discovery.

## Local Development

Open `index.html` directly in any modern browser, or serve locally:

```bash
# Using python
python -m http.server 8000

# Or using npx serve
npx serve .
```
