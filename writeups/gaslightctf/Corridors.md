![[Pasted image 20260816145351.png]]

![[Pasted image 20260816145440.png]]

This challenge is pretty intuitive. It looks like we need to guess whether the next direction is `left` or `right`.

If we choose the correct direction, the page returns `correct` and lets us continue to the next corridor.

If we choose the wrong direction, it just returns `nope`

Since the corridor can go on for hundreds of steps, doing this manually would take too long, so we can automate the process with a simple script

script.py

``` python
import requests

base = "{TARGET_URL}"

s = requests.Session()
path = ""

while True:
    r = s.get(base + path + "/l/")

    if "correct" in r.text.lower():
        path += "/l"
        print(path)
        continue

    r = s.get(base + path + "/r/")

    if "correct" in r.text.lower():
        path += "/r"
        print(path)
        continue

    print("done?")
    print(r.text)
    break
```

At the end, we finally get the full path

```
/l/r/r/l/l/r/r/r/l/r/r/l/l/l/l/r/l/r/r/r/l/l/r/r/l/r/r/l/r/r/l/l/l/r/r/l/r/l/l/r/l/r/r/l/l/r/r/r/l/r/r/l/r/l/l/l/l/r/r/r/l/r/l/l/l/r/l/l/l/l/r/r/l/r/l/r/l/r/l/l/l/r/l/l/l/r/r/l/l/r/r/r/r/l/r/r/l/r/r/l/l/r/r/l/l/r/r/r/l/l/r/l/l/l/r/r/l/l/r/r/l/l/r/r/l/l/r/r/l/r/r/l/l/r/l/l/l/l/r/r/l/l/l/l/l/r/r/l/r/r/l/r/l/r/l/r/r/r/r/r/l/l/r/r/l/r/l/l/l/r/r/r/l/r/l/l/l/r/l/r/r/r/r/r/l/r/r/l/r/r/l/l/l/l/r/r/l/r/l/l/l/r/r/r/l/l/r/r/l/r/r/r/l/r/l/l/l/r/l/r/r/r/r/r/l/r/r/l/l/r/l/r/l/l/r/r/l/r/r/l/l/l/r/r/l/r/l/r/l/l/r/r/l/l/r/r/l/r/r/l/l/l/l/r/l/r/r/l/l/l/l/r/l/l/r/r/l/r/l/l/l/l/r/r/l/l/r/r/l/l/r/r/l/l/l/l/l/r/r/l/l/l/r/l/l/r/r/l/l/r/l/l/l/r/r/l/l/l/r/l/l/r/r/r/r/r/l/r/
```

But in the end, we only get the text `freedom`

I also checked the raw HTML response, but there doesn't seem to be any useful clue there either.

![[Pasted image 20260816150306.png]]

![[Pasted image 20260816150220.png]]

Since it feels unlikely that the whole path to `freedom` is useless, the sequence itself may contain some clue that we need to decode first 

First, let's analyze the facts we have. The path is made up entirely of two possible values: `l` and `r`, for example `/l/r/r/l/...`. That makes bit encoding a reasonable possibility, where we could assume `l = 0` and `r = 1`.

However, that mapping is still just an assumption, so before trying to decode it, we need one more confirmation. If the sequence really represents ASCII bits, its length should be divisible by 8, since one ASCII character is represented by 8 bits.

Gladly, the path contains **328** `l/r` values, and **328 is divisible by 8**, so trying the bit-decoding approach is actually worth it.

convert.py

``` python

path = "/l/r/r/l/l/r/r/r/l/r/r/l/l/l/l/r/l/r/r/r/l/l/r/r/l/r/r/l/r/r/l/l/l/r/r/l/r/l/l/r/l/r/r/l/l/r/r/r/l/r/r/l/r/l/l/l/l/r/r/r/l/r/l/l/l/r/l/l/l/l/r/r/l/r/l/r/l/r/l/l/l/r/l/l/l/r/r/l/l/r/r/r/r/l/r/r/l/r/r/l/l/r/r/l/l/r/r/r/l/l/r/l/l/l/r/r/l/l/r/r/l/l/r/r/l/l/r/r/l/r/r/l/l/r/l/l/l/l/r/r/l/l/l/l/l/r/r/l/r/r/l/r/l/r/l/r/r/r/r/r/l/l/r/r/l/r/l/l/l/r/r/r/l/r/l/l/l/r/l/r/r/r/r/r/l/r/r/l/r/r/l/l/l/l/r/r/l/r/l/l/l/r/r/r/l/l/r/r/l/r/r/r/l/r/l/l/l/r/l/r/r/r/r/r/l/r/r/l/l/r/l/r/l/l/r/r/l/r/r/l/l/l/r/r/l/r/l/r/l/l/r/r/l/l/r/r/l/r/r/l/l/l/l/r/l/r/r/l/l/l/l/r/l/l/r/r/l/r/l/l/l/l/r/r/l/l/r/r/l/l/r/r/l/l/l/l/l/r/r/l/l/l/r/l/l/r/r/l/l/r/l/l/l/r/r/l/l/l/r/l/l/r/r/r/r/r/l/r/"

#print(len(path.strip("/").split("/")))

bits = path.strip("/").split("/")

binary = "".join("0" if x == "l" else "1" for x in bits)

print(binary)
```

and last just use bit to ascii converter

![[Pasted image 20260816151133.png]]