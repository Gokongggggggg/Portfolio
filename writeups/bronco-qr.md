ez chall for humans tbh, but ended up 2nd least solved during the event - simply because this problem can't be slopped & everyone's a slopper nowadays 💀

## Summary

At first, I tried several online QR recovery tools, but none of them worked. I brainstormed with an LLM and experimented with a few reconstruction algorithms - still failed. After examining the image more carefully, I realized the fragments weren't randomly shuffled; they had simply been pulled apart, with neighboring pieces staying close to each other. Based on that observation, I just manually aligned the fragments in Microsoft Paint until the QR code became readable.

![[fragmented-qr.png]]

see the parts i circled in red? any human can tell right away that those aren't randomly shuffled - they're literally just pulled apart. so from there it's obvious you just need to drag them back together in ms paint

![[qr-scan-result.png]]

and here's the result after dragging everything back. honestly tho, you don't even need to fully restore it - a QR code only really needs the corner parts (the three finder patterns) to scan

![[manual-reconstruction.png]]

qr's recovered, and scanning it gives us a canva link

![[recovered-flag.png]]

once we're inside the canva, there's a fully recovered qr - and obviously my first instinct was to scan it again, but it just loops back to the same canva link lol

so i started thinking like the probset: since a qr really only needs the corners to be scannable, and the full recovered version shows "bronco{}" in the middle - that part was probably intentionally recovered by the author for us, right after we fix the 3 corners ourselves

but since an area that small can't be scanned, i went for the low-cost approach: inspect element, in case there's hidden text somewhere 👀

> `bronco{th3_h1dd3n_cu3}`
