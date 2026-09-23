![[source-entry.png]]

![[dynamic-analysis.png]]

This is a blackbox challenge. Basically, there's a song playing while some text keeps changing on the screen, like song lyrics. Honestly, I was pretty confused at first about what to do - until I noticed the last lyric ended with ...}, which was really sus. So I decided to inspect the element.

Turns out the ...} was coming from emotes. Well, that makes the objective clear - collect all the emotes and figure out how to decode them.

![[hvl-1.png]]

Turns out all the emotes are already in the source - so I just grabbed them lol. Now the question is how to decode them.

## Custom Font
![[font-face.png]]

So, hunting for the decode method: since everything is emote-based, I had a feeling it was related to some style import in the CSS. Focused there. And I found this ./NotoSans-Regular.ttf import

And yep, decoding with that font works. Since I couldn't find any existing tool for this, I just vibe-coded a quick decoder. Note: my tool isn't QA'd yet - it at least works on this challenge, no guarantee beyond that lol. Feel free to contribute if you want.

tool: https://gokongggggggg.github.io/ctf-font-decode/

![[final-flag.png]]
![[hvl-2.png]]

> `v1t{g04t_mck_hvl}`
