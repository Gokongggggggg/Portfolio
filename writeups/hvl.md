## Summary

The page source and the rendered output display completely different text. After inspecting the JavaScript, there was no decoding logic involved. The actual trick was a custom font disguised as `NotoSans-Regular.ttf`, whose internal metadata revealed its real name: `Emoji To AZ Regular`.

- **Vector:** Custom font
- **Table:** CMAP
- **Payload:** Emoji
- **Result:** Glyph mapping

## Reading The Source

The first step was inspecting the page source and opening DevTools. The challenge uses a lyric visualizer, with the entire lyric already embedded in the client as a string. Since the payload was already available, the focus shifted from retrieving data to understanding how the browser rendered it.

![[source-entry.png]]
Started by inspecting the page source and loaded assets.

![[sources-panel.png]]
The Sources panel helped identify the relevant scripts and assets.

## Dynamic Analysis

While inspecting the DOM, I noticed that the HTML content did not match the text rendered on the page. At first, I expected the JavaScript to contain some sort of decoding routine. After tracing the relevant functions, however, nothing modified the original string. That shifted my attention away from JavaScript and toward the browser's rendering layer, specifically CSS and custom fonts.

![[dynamic-analysis.png]]
The HTML and rendered output do not match, pointing to the rendering layer rather than the source itself.

## Finding The Payload

The complete lyric could be extracted directly from the client-side data. The interesting part appeared near the end, where several cues consisted entirely of emoji. Once rendered, those emoji began to resemble a typical CTF flag format.

![[lyric-search.png]]
The full lyric was already available in the client-side data.

![[emoji-render.png]]
The emoji sequence became the primary payload once its rendered output resembled a flag.

## Custom Font

The stylesheet loads a local font named `NotoSans-Regular.ttf`. The filename is intentionally misleading: its internal metadata identifies it as `Emoji To AZ Regular`. Inspecting the font's CMAP table reveals that emoji code points are mapped to readable glyph names such as `v`, `one`, `braceleft`, and `underscore`.

![[font-face.png]]
The `@font-face` rule provides the key clue: extract the custom font and inspect its mapping.

Example glyph mappings:

- `U+1F600` → `v`
- `U+1F603` → `one`
- `U+1F601` → `braceleft`
- `U+1F60D` → `braceright`

## Tooling

Since this technique is fairly repetitive, I built a small utility that lets me upload a font, paste the encoded text, and immediately inspect both the rendered output and the CMAP mapping. It is useful for CTF challenges that hide messages through custom font glyph substitution.

Simple web tool: https://gokongggggggg.github.io/ctf-font-decode/

![[final-flag.png]]
Combining the custom font with the emoji payload reveals the flag through glyph-name mapping.

## Flag

> `v1t{g04t_mck_hvl}`
