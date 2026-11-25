This chall from Intigriti monthly challenges. If you know Intigriti, they usually hve brutal challs, but this month's is pretty beginner-friendly compare to others, the author himself said "This challenge's issues are something I'd expect a junior, 0 day work experience hire to solve." And because of that I wanted to contribute a human way to solve it so hopefuly people who are beginners can learn from this writeup

![[Pasted image 20261122143258.png]]

The first page you see when you open the chall is this login form. One thing that's really interesting is the "Check the changelog" link (the one I underlined in red) why? Because normally a login form only has login or sign up.

![[Pasted image 20261122144611.png]]

![[Pasted image 20261122144546.png]]

after open the checklog what we get is basically bug & patch documentation. The two DON'Ts I underlined in red in the 2.0.1 docs  "don't keep an old version running" and "don't run the server binary in the PWD" are the ones to highlight, because they basically tell us the previous version was doing exactly that, so the new version is like "don't do that again."

So if the chall runs 2.0.0, we can download the binary since it's served from the PWD. But there's one catch: we still need the endpoint name to fetch it. Let's explore more, we might come across new info.

![[Pasted image 20261122145849.png]]

I tried signing up, thinking maybe once I log in there'd be a new page with some juicy info. Turns out nope "We currently do not accept signups!" But hey, we still got a header with exactly what we needed: X-Powered-By: superfastserver Version 2.0.0. 

Wait, what's X-Powered-By? 

It's basically a header that tells you what tech is powering the server. Some frameworks like PHP, etc set it automatically by default, like free promo for themselves. Devs can disable it though, cause it leaks info. And one more thing it's fully custom, the dev can write whatever they want in there.

![[Pasted image 20261122151329.png]]

I already suspected "superfastserver" was a custom name from the dev, cause I've never heard of a framework called that. Googled it just to be sure and yep, nothing exists. So I instantly thought this must be the author's hint for the binary's endpoint  why? Because after confirming the version is 2.0.0, the endpoint name is the only piece of info we're still missing.

![[Pasted image 20261122151728.png]]

and yep, our guess was right this is an ELF file, aka a Linux binary. We can tell from the part I circled in red: that ELF at the very start is the magic bytes, basically the marker that tells you the file type.

``` bash
curl -o super https://challenge-1126.challenges.intigriti.io/superfastserver
```

and ya we can downlod it using curl & start analyze the binary file 

When doing the rev eng stuff, I like to run `strings` on the binary first to get a brief overview. And I found some interesting things  that long weird-looking string is actually Brainfuck code. we also get the info that the flag is stored at `/the_real.flag`, and there's a local flag plus the super secret auth code just sitting there in plaintext.

![[Pasted image 20261122152247.png]]

![[Pasted image 20261122152401.png]]

![[Pasted image 20261122152420.png]]

After that brief overview, now what? Let's jump into the decompiler to see things more clearly, starting from the info we got from strings.

You can use any decompiler you want. I'll use an online one, [dogbolt.org](https://dogbolt.org/), cause I haven't done rev in a while and I deleted mine back then to save space lol. So if you don't have a decompiler, you can use an online one like me or yeah, go download your Ghidra lol.

![[Pasted image 20261122172748.png]]

First thing I do is find where `/the_real.flag` is used why? Because that's our objective lol. Just search for it, and what we get is the info that the flag is stored in a buffer at a certain address. Let's save that for now maybe later there's a function that can read into that address, or something like that.

![[Pasted image 20261122173412.png]]

Scroll down a bit from the flag code .we find the super secret auth code. This is one of the interesting parts  if you remember the changelog, version 2.0.0 said the custom protocol is "protected by a very good secret to allow execution of RSA-2048 signed code." Most likely this is the secret the docs refer to  or yeah, it could just be a red herring. Let's follow where it's used to prove our hypothesis.

![[Pasted image 20261122181415.png]]


![[Pasted image 20261122175751.png]]

So basically from the code above, we can see the app inits the super secret into v21-v27, preps an empty buffer at v14-v20, then recv reads the client's input into that buffer. After that it compares the user input against the secret

This confirms our earlier hypothesis: the super secret is indeed the secret gating the RSA-2048 signed code execution. And there's still a bunch of logic below the auth check, so knowing the secret doesn't instantly get us the flag it just gets us pass the first check.

Alright, let's understand the logic that runs after we pass the first check hopefully we find something interesting.

![[Pasted image 20261123204900.png]]

In rev-eng, you don't have to understand everything top-down. The better move is usually just finding the part that looks interesting, then tracing backwards to see how the flow even got there. 
for example, like the one I took a screenshot of above. 

If you try reading that example from top to bottom, you’ll definitely be confused about what it’s actually trying to do. It suddenly asks for 1 byte which must be 'w' then asks for 4 bytes which must be less than 0x400 and so on; it’s strange, isn’t it? (We’re lacking some context here.)

![[Pasted image 20261122192401.png]]

> [!note]- How we know that decimal is representing char - for those who don't know
>
>When you see a case with a big number like 1347175752, even though the program only reads 4 bytes of input, that's usually a 4-character string packed into an integer. Computers store everything as bits, and the decompiler just picks how to display them - here it chose decimal. Another tool might show hex (0x504C4548) or even the string ('HELP'). Same bits, different display.
>To read it: convert to hex, then reverse the byte order. It's packed little-endian, that just means the lowest byte is stored first, so the bytes sit backwards compared to how you'd read the string. Reversing puts them in the right order, and you get HELP.
>
>Let's prove what we just said
>
>![[Pasted image 20261122193110.png]]
>
>![[Pasted image 20261122193131.png]]
>Ok, our thesis is confirmed. Now why did we go to hex first? Because hex separates the bytes for us: every 2 hex digits = 1 byte, so we can clearly see which part is which byte and map each to a char. In decimal it's all merged we can't tell where one byte ends and the next begins so going straight from decimal to char is hard. Hex makes the byte boundaries obvious.
>
>

So yeah, like I said  find the interesting part. Scroll down and boom, there's a `HELP` case. It `memcpy`s 1112 bytes from `&g_4089d0` into a local buffer, then `send`the whole thing straight to us , we still have no clue what &g_4089d0 even holds. But since it's the `HELP` case, it's almost certainly a `hint` the author left on purpose,

Now we backtrack: what do we need to send to actually trigger HELP? Turns out it's just those 4 blocks up top that confused us when reading top-down directly the mystery `'w'` byte, the length capped at `0x400`, the extra 4 bytes. They're not random checks, they're the door: open with `'w'`, send a length (HELP has no payload, so `0`), then the 4-byte tag. And read the whole thing again with that context so it becomes clear.

![[Pasted image 20261123215311.png]]
And boom, we were right HELP leaks the juicy stuff. Look at what I underlined in the output: CODE, DATA, SIGN, EXEC. And if you look at the bytes between those tags (CODE to DATA, DATA to SIGN, and so on), they aren't just noise they're actualy example inputs. 

So HELP didn't just give us the command names, it showed us exactly what each one expects. From this we get two things at once: the flow (CODE loads the interpreter, DATA feeds the program, SIGN attaches the signature, EXEC runs it) and a working sample payload for every command.

Let's try the payload from `HELP` & see what we got

![[Pasted image 20261124074359.png]]

Interesting the output we got is `"I hope you like this so far keep going."` This shows that what we’ve been doing is on the right track.

So to move forward, let's think about our options. Can we upload our own code, our own data? Maybe. But before that, there's one thing we gotta check: `how does the signature actually work?` If it verifies everything we send, then we'd have to beat it first either find a logic fault in how it's checked, or crack the crypto itself.

![[Pasted image 20261124080124.png]]

So our goal now is to figure out how the signature gets checked

In the EXEC block there's an interesting function call: `sub_405a00(&v29[v36], v35 + v33, v9)`. If we pass the checks above it, `v35` is the CODE length and `v33` the DATA length, so it's using the total of code len + data len. We don't know what this function is yet, but it looks like the signature is being verified over the whole code + data.

>[!note]- How we know v35 is CODE length and v33 is DATA length - for those who don't know
>You can trace it yourself. In the CODE block, v35 gets set from v40. And remember, every command (CODE, DATA, HELP, EXEC) first reads the input length, and that length lands in v40. Same story for v33 in the DATA block, it's also set from v40. So v35 ends up holding the CODE length and v33 the DATA length.

let's verify our thesis

![[Pasted image 20261124082031.png]]

![[Pasted image 20261124081704.png]]

Inside `sub_405a00` it calls another function, `sub_4055d0`, and that one just initializes a bunch of fields: 1779033703, 3144134277, 1013904242, `0xa54ff53a`, and so on. For those who don't know crypto, those 8 numbers are the starting state that SHA-256 always uses & fixed, every implementation loads the exact same values. So this is confirmed SHA-256. And no, we're not going to crack it, because if you've been paying attention there's already a logic fault right before this function gets called.

so where?

The fault is on `sub_405a00(&v29[v36], v35 + v33, v9)`. 
Let's trace it with a simple example: say code len = 10 and data len = 10.

![[Pasted image 20261124085428.png]]

Okay, now we know how to bypass the signature.

So what do we put in the malicious payload? Remember the example data looked like `>>>>----[+++]` gibberish that's Brainfuck. In a nutshell, Brainfuck is a tiny esolang that runs on a tape of memory cells with a pointer, and it only has 8 commands: `>` / `<` move the pointer, `+` / `-` change the current cell, `.` prints the cell, `,` reads input, and `[` / `]` loop. So because the example DATA is Brainfuck, CODE is definitely a Brainfuck interpreter, or some kind of function that understands Brainfuck input. which means our malicious payload has to be Brainfuck too.

![[Pasted image 20261124092140.png]]

Look at the decompiled BF interpreter we pulled from HELP. It does run like a normal interpreter the `0x3e` (`>`) case just moves the cell pointer by one, and the other commands do their thing too. But the problem is there's no bounds check anywhere, so the pointer can wander wherever we want nothing stops it going too far forward or too far back. That's what lets us access any memory, read it with `.` or even write it with `+`/`-`

![[Pasted image 20261124093437.png]]

Ok so now we can read anywhere let's pin down where the flag actually lives. Look at the stores right after the `fread`: those `0xffffffffffffffa0` are just negative numbers. So `...a0` = -96, `...b0` = -80, `...c0` = -64, `...d0` = -48, `...e0` = -32, `...f0` = -16. 

So the flag gets written from `v51-96` up to `v51-16`, and the `fread(&v42, 1, 81, fp)` tells us it's 81 bytes. That's our target: start at `v51-96`, length 81.

![[Pasted image 20261124094020.png]]

The interpreter's base is `v51 - 352` and the flag starts at `v51 - 96`. Same base ( v51 ), so the distance is `352 - 96 = 256`, and since `-96` is higher, we go right, not left. In BF, right is `>`, so that's `">"*256`; then `.` reads and `>` steps, repeated 81 times = `".>"*81`: 

Final BF payload ```">"*256 + ".>"*81```

## att.py

``` python
import http.client , struct
host = "challenge-1126.challenges.intigriti.io"

secret = b"SUPER_SECRET_CHALLENGE_AUTH_CODE_THAT_CANT_BE_BRUTE_FORCED_1337_INTIGRITI_341465b5b427f6e7c2125b300a74a033"

# payload template
def payload_crafting(tag , payload=b""):
    return b"w" + struct.pack("<I", len(payload)) + tag + payload

def post_request(stream):
    conn = http.client.HTTPSConnection(host) # establish connection
    conn.request("POST", "/custom_protocol", # send paload
                    body=stream,
                    headers={"connection": "close"}
                )
    return conn.getresponse().read() # return response

# abuse HELP command cuz it's leak valid signature ,  brainfuck interpreter etc
help_result = post_request(secret + payload_crafting(b"HELP"))[4:] # skip first 4 bytes of response

interpreter , brainfuck_reference , signature = help_result[9:405] , help_result[414:838] , help_result[847:1103]

  
# craft malicious payload to get the flag
malicious_payload = b">"*256 + b".>"*81
malicious_payload = malicious_payload.ljust(424, b" ")
stream = secret + payload_crafting(b"CODE" , interpreter) + payload_crafting(b"DATA", brainfuck_reference) \
        + payload_crafting(b"DATA", malicious_payload) + payload_crafting(b"SIGN", signature) + payload_crafting(b"EXEC")

result = post_request(stream)
print(result)

```

> [!note]- How solver works
>
>The script is just the whole chain in one go. Auth with the secret, then abuse `HELP` to pull the template: the interpreter (CODE), the reference BF (DATA), and a valid signature. Then build the stream: `CODE`=interpreter, `DATA`=reference, `DATA`=our malicious BF padded to the same 424 length, `SIGN`=the leaked signature, `EXEC`
>
>On remote, send it to `/custom_protocol`. We know that route because it's hardcoded you can see it right in the decompiler.

## FLAG

![[Pasted image 20261124100600.png]]
