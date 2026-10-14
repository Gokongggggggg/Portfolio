
![[Pasted image 20260930162852.png]]

We’re given two separate Next.js apps. Since the challenge is split into backstage 1 and backstage 2, we can assume these apps are completely isolated from each other
## Backstage 1

![[Pasted image 20260930162736.png]]

The first thing I usually do when tackling a web challenge is hunting for endpoints/routes. Since this is Next.js, that means looking inside the `pages/` directory. I started by inspecting the API routes because, well, they just look juicy.

![[Pasted image 20260930163440.png]]

Looking at `login.js` and `register.js`, the first thing that looks sus is how the redirect URL is constructed: `/access-card?id=${user.id}`. This smells like a classic IDOR (Insecure Direct Object Reference) if we can control or manipulate that `user.id`.

Both files rely on helper functions (`findByUsername`, `createUser`) imported from `../../lib/users`. So, next  we'll inspect that library to see exactly what `user.id` contains and how it’s generated.

![[Pasted image 20260930164221.png]]

![[Pasted image 20260930164119.png]]

After inspecting findByUsername() and createUser(), it turns out we can't control `user.id` at all. So, this attack path basicly dead.

![[Pasted image 20260930164733.png]]

So I moved to `/access-card` since the name implies it handles access logic. Looking at the code, it generates a QR code containing the `ticketUuid`

![[Pasted image 20260930165717.png]]

![[Pasted image 20260930165815.png]]

Saw the 'Enter Backroom' button on `/access-card`, so I tried hitting `/backroom`. Got blocked. Since it's whitebox, I just checked the code. Turns out only User ID 1 gets in, and that’s where `readFirstFlagHalf()` runs. So yeah, we need to access as ID 1.

![[Pasted image 20261001063955.png]]

Looked through all the given files, found nothing exploitable. Since we know it’s a 0-day challenge from the chall desc, the bug **might be in** how the framework behaves, not just the app code. So **it’s worth digging into** `node_modules` and auditing the specific Next.js version.

We knew that in Next.js, middleware runs on the Edge Runtime while page handlers run on the Node Runtime. So our `hypothesis`: this two runtime maybe handle incoming requests differently and if they do, maybe that's something we can exploit.

For those who don't know: Next.js splits execution for performance. Middleware runs on the Edge Runtime, doing quick checks like auth before the request hits the server. Page handlers run on the Node Runtime, doing the heavy duties like DB queries. Different environments, different underlying libraries their parsing logic can diverge.

Let's start by checking the Edge Runtime, which in Next.js lives under `server/web` directory
### 1. normalizeNextQueryParam()

With help from AI, I grabbed this function from node_modules/next/dist/server/web/utils.js. Since the page had basically no input fields no forms, nothing to click or type into so the query string was the only place I could pass anything to the server. That made the next question pretty obvious: in the Next.js Edge runtime, what handles query params? I asked AI to help find that, and it pointed me to normalizeNextQueryParam.

![[Pasted image 20261001090942.png]]

Reading the function, the logic is straightforward: it takes a `key`, checks whether it starts with any of the prefixes held in `_constants.NEXT_QUERY_PARAM_PREFIX` and `_constants.NEXT_INTERCEPTION_MARKER_PREFIX`, and if it matches, it slices that prefix off (`key.substring(prefix.length)`) and returns the remainder. In other words, any input whose prefix lines up with one of those constants gets its prefix wiped.

But we don't actually know what those constants resolve to yet and without their real values, we can't say which keys would get stripped. So, we used a `grep` command to hunt for its definition directly in the source code

``` bash
grep -rn "NEXT_QUERY_PARAM_PREFIX\s*=" node_modules/next/dist --include="*.js"
```

![[Pasted image 20261001092629.png]]

And now we know it equals **`nxtP`**

So now we know the mechanic: `normalizeNextQueryParam` ->  strips the `nxtP` prefix, turning something like `nxtPid` into just `id`.

But before we exploit this, let’s answer the question: **Why does Next.js even have params like `nxtP`?**

In Next.js, there is a mechanism called SPA (Single Page Application). We won't explain this fully, but basically it stops the browser from reloading when users navigate between pages. To make this work, Next.js uses internal system requests, and `nxtP` is how it marks them.

At this point we know how the normalizeNextQueryParam() works. The next question is where it gets called from because if this is really exploitable, we need to know where the gate in is.

![[Pasted image 20261014114811.png]]

![[Pasted image 20261008161206.png]]

Let's do a quick trace so it's clear what this code is actually doing.

Say we send a request like this: `GET /access-card?id=1&nxtPid=999`

`const requestURL = ... new URL(params.request.url)` grabs the params along with their values, so it stores something like:

| param    | values    |
| -------- | --------- |
| `id`     | `["1"]`   |
| `nxtPid` | `["999"]` |

`const keys = [...requestURL.searchParams.keys()]` -> this one only grabs the keys, so the result is `["id", "nxtPid"]`.

The first loop iteration is `id`, but we'll skip tracing that one , you can trace it yourself if you want. Nothing interesting happens there anyway.

Now, the iteration where the key is `nxtPid`:
- `value = searchParams.getAll("nxtPid")` → `["999"]`
- `normalizedKey = normalizeNextQueryParam("nxtPid")` → starts with `nxtP` → returns `"nxtPid".substring(4)` → `"id"`
- `if ("id")` → true → we enter the if logic :
      initial state : nxtPid=999&id=1
    - `searchParams.delete("id")` → `id=1` is gone. 
	    State: `nxtPid=999`
    - `for (val of ["999"]) append("id", val)`
	    State: `nxtPid=999&id=999`
    - `searchParams.delete("nxtPid")`
        State: `id=999`

So now `nxtPid` is gone, and `id` is left holding its value.

Now let's look at `middleware.js` again. We already know middleware runs on the Edge runtime.

> [!note]- You may ask: which runs first - the middleware, or the param normalization?
>
   ![[Pasted image 20261014123321.png]]
>
> As you can see, middleware isn't actually *handled* until line **213**. JavaScript inside one function runs top to bottom, so by the time the adapter even starts caring about middleware at 213, the normalization at 112–125 already finished.
> 

![[Pasted image 20261014121658.png]]

So now we know how to exploit it: we register an account and get `id=3`, then craft the payload
``` js
GET /access-card?id=1&nxtPid=3
```

![[Pasted image 20261014130109.png]]

![[Pasted image 20261014130302.png]]

So after we pulled the victim's `ticket_uuid` from the QR code on the `id=1` access card, we tried using it to hit `/backroom` and it failed.

![[Pasted image 20261014130928.png]]

After that, I remembered the middleware has a `ticket_uuid` check, and so does the `/backroom` page. Neither of them pulls from the session, so a JWT attack wasn't the way. That left just one option a parse desync  because remember, middleware runs on the Edge runtime and the page runs on Node, so they could easily read it differently.

![[Pasted image 20261014151610.png]]

![[Pasted image 20261014152001.png]]

Quick recall 
we've got two `ticket_uuid` values: mine, `74afaec9-530b-423a-aa9a-8926f36c1572`, and the victim's from `id=1`, `3d811f9f-a602-4a79-9dfb-5cff85e41b9a`. 

So if the parse-desync assumption between Edge and Node exist, actually we just brute-force it, since there are only 4 possibilities right. Either Edge reads the first or the last, and same for the Node runtime.

![[Pasted image 20261014153508.png]]

so the result: middleware picks up the last ticket, node picks up the first -> then we got the flag_part1

> [!note]- If you're like me, want to see how the parser's check logic really works
>
> ## Node runtime cookie parser 
>![[Pasted image 20261014154516.png]]
>
>![[Pasted image 20261014154113.png]]
>
>![[Pasted image 20261014154050.png]]
>
>With the help of AI, I found the path where the file that handles the cookie parser. And to be honest, since the parser is obfuscated, it's hard to read, so I asked AI to help clean up/beautify the variable names. 
>
>So basically, the logic is pretty simple: if there's a cookie like `ticket_uuid`, the first check is whether it's still undefined (i.e., nothing with that name has been initialized before). If so, it will initialize it; otherwise, it basically just reads the first one, since it doesn't accept duplicates either.
>
>## Edge runtime Cookie parser
>
>![[Pasted image 20261014161119.png]]
>
>In the edge runtime, it doesn't have the logic like in the Node runtime that handles duplicates, so this can be overwritten. 
>``` js
>const [key, value] = [pair.slice(0, splitAt), pair.slice(splitAt + 1)];
>      try {map.set(key, decodeURIComponent(value != null ? value : "true"));
>```
>
>You can see that it just sets entries using a map with key & value pairs
## Backstage 2

As usual, we start by checking the endpoint. Since this is Next.js, we begin from the pages/ directory, and we found that simply hitting the '/' route gives us the flag right away.

![[Pasted image 20261014174726.png]]

However, when we tried , it turned out not to work lol.

![[Pasted image 20261014174815.png]]

After that, I took a look and discovered there's a middleware with a matcher: '/' configured  meaning any request to the '/' route passes through the middleware first. Inside, it reads the value from the `x-real-migu` header and rejects the request unless it's 1.3.3.7. So now we understand why we were getting rejected.

![[Pasted image 20261014175150.png]]

You might have thought: when requesting `/`, why not just inject the header directly, right? That would work , but since this is SEKAI CTF, it's unlikely to be that easy. So I checked the nginx config  and the `x-real-migu` header is set there

![[Pasted image 20261014175903.png]]

Now, you might be wondering: if it's already set in nginx, does that mean we can't inject it? The answer is no, we can't  because the flow is basically: user request → nginx → nginx's request → main server. We only control the very first step of that chain.

![[Pasted image 20261014181326.png]]

Before moving on, we need to understand a few terms first: MPA (Multi Page Application) & SPA (Single Page Application). You've definitely experienced this when visiting a new page on a website, it goes white/blank for a moment before the new page loads. If that happens, it's an MPA.

Why does that happen? Let's say every time we load an HTML file, the place where we render that here we name it  'canvas'. The way MPA works is 1 endpoint = 1 canvas. So when we go to a different page, it renders a new canvas and cleans up/destroys the old one  that's why there's a brief white flash. Why is it destroyed? Because if it weren't, the JS in the old canvas would still be running, just adding unnecessary overhead.

Now with SPA, there's 1 canvas for all endpoints. Navigating to a new page doesn't require fetching new HTML from the server it just requests the JSON instead (we won't cover how & why that works; we only care about the implications here )

Let's say, like in this challenge, we want to get `/`  basically the page served by index.js When navigating to that page, there's an internal system request that asks for the index.json so it can display the new page. To mark a request as an internal system request, the path looks like this: `_next/data/<BUILD_ID>/<ROUTE_NAME>.json`

So the implication? One page, two endpoints: the actual route (`/`) and its data route (`_next/data/<BUILD_ID>/index.json`).

Now, there's important mechanism here: 
if an assetPrefix is detected in the URL of this system request, it will be stripped but remember, this only happens in the Node runtime.

> [!note]- Why Node runtime Strips `assetPrefix`
>
> First, we need to understand what assetPrefix is for. It's typically used for static files, so your main process doesn't have to serve them  usually a service like Cloudflare handles that instead. Plus, they have servers distributed globally, so it's faster and also reduces load. assetPrefix is how you configure which parts of the app get served from there.
>
>And of course, at some point, requests for assets served under the assetPrefix will still hit the main server  whether because of a cache miss or something else. When that happens, the request comes in with the internal path plus the assetPrefix, and the Node runtime is what strips it away
>
>

`if u want to verify check this file on : node_modules/next/dist/server/base-server.js`

![monkey](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdng2YmR2YndvZHg2bDF1bXV4N2xhYjBucTN1eDc3NnU4eWRpcmF6NCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/5Zesu5VPNGJlm/giphy.gif)

Now recall: the middleware (which runs on the **edge runtime**) only applies to the `/` route. If we take another path i.e., a request to the internal system request endpoint (the data route)  we won't hit the middleware at all.

You might be thinking that `/_next/data/u6X6jSshEVpqcNdGPSFYr/index.json` bypasses the middleware since it's no longer just `/`so  we wouldn't need to use `assetPrefix` (by the way, to get the `build_id`, just inspect the element on the website).

![[Pasted image 20261014211902.png]]

Well, but when we tried it directly, it didn't work.

And the answer lies in `getNextPathnameInfo()`. This function runs in both the edge & node runtimes, and its job is simple: resolve `/_next/data/u6X6jSshEVpqcNdGPSFYr/index.json` to `/`. However, it only kicks in when the path starts with `/_next/data/`.

So how do we take advantage of this? As discussed above, the assetPrefix gets stripped in the Node runtime but not in edge. By abusing this asymmetry, we can make `getNextPathnameInfo()` fail to resolve the route in the edge runtime bypassing the middleware  while it still resolves correctly in the Node runtime, letting us retrieve the data.

![[Pasted image 20261014215921.png]]

Our final payload : `/cdn/_next/data/u6X6jSshEVpqcNdGPSFYr/index.json`

![[Pasted image 20261014211833.png]]
