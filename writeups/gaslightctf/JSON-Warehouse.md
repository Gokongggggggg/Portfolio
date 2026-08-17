![[Pasted image 20260817104146.png]]

From this source code, we can see that the flag is stored inside the admin's warehouse. Since `uid` starts at `1000` and the admin is the first user created, we know that the admin's ID is `1000`

To retrieve the flag, we need to reach `getItems()`. There are two ways to do this: call `getItems(id)` directly or call `getItem(id, key)`, which internally calls `getItems(id)`

Storage.tsx

```tsx
import { Elysia, redirect } from "elysia";
import * as z from "zod";
import { Html } from "@elysiajs/html";
import { userPlugin } from "../plugins/user";
import { deleteItem, getItem, getItems, setItem } from "../data";
import {
    CreateItemButton,
    CreateItemForm,
    ItemEditForm,
    ItemPage,
    ItemCard,
    ItemView,
    StoragePage,
} from "../ui/Storage";

const parseJson = (raw: string) => {
    try {
        return { value: JSON.parse(raw) as unknown };
    } catch {
        return { error: "invalid json" };
    }
};

const storage = new Elysia({ prefix: "/storage" })
    .use(userPlugin)
    .get("/new", () => <CreateItemForm />)
    .get("/new-button", () => <CreateItemButton />)
    .get("/", ({ user }) => {
        if (!user) return redirect("/auth/login");

        return <StoragePage user={user} items={getItems(user.id) ?? new Map()} />;
    })
    .post(
        "/",
        ({ user, body: { key, value }, set }) => {
            if (!user) return redirect("/auth/login");

            if (getItem(user.id, key) !== undefined) {
                set.headers["HX-Reswap"] = "innerHTML";
                set.headers["HX-Retarget"] = "#create-item-error";
                return <p>item already exists</p>;
            }

            const parsed = parseJson(value);
            if ("error" in parsed) {
                set.headers["HX-Reswap"] = "innerHTML";
                set.headers["HX-Retarget"] = "#create-item-error";
                return <p>{parsed.error}</p>;
            }

            setItem(user.id, key, parsed.value);
            return (
                <>
                    <CreateItemButton />
                    <div id="storage-items" hx-swap-oob="beforeend">
                        <ItemCard itemKey={key} value={parsed.value} />
                    </div>
                </>
            );
        },
        {
            body: z.object({
                key: z.string().min(1),
                value: z.string(),
            }),
        },
    )
    .guard({
        schema: "standalone",
        params: z.object({
            key: z.string().min(1),
        }),
        body: z.any(),
    })
    .get("/:key", ({ user, params: { key }, set }) => {
        if (!user) return redirect("/auth/login");

        const value = getItem(user.id, key);
        if (value === undefined) {
            set.status = 404;
            return "item not found";
        }

        return <ItemPage user={user} itemKey={key} value={value} />;
    })
    .get("/:key/view", ({ user, params: { key }, set }) => {
        if (!user) return redirect("/auth/login");

        const value = getItem(user.id, key);
        if (value === undefined) {
            set.status = 404;
            return "item not found";
        }

        return <ItemView itemKey={key} value={value} />;
    })
    .get("/:key/edit", ({ user, params: { key }, set }) => {
        if (!user) return redirect("/auth/login");

        const value = getItem(user.id, key);
        if (value === undefined) {
            set.status = 404;
            return "item not found";
        }

        return <ItemEditForm itemKey={key} value={value} />;
    })
    .put(
        "/:key",
        ({ user, params: { key }, body: { value }, set }) => {
            if (!user) return redirect("/auth/login");

            const existing = getItem(user.id, key);
            if (existing === undefined) {
                set.status = 404;
                return "item not found";
            }

            const parsed = parseJson(value);
            if ("error" in parsed) {
                return (
                    <ItemEditForm
                        itemKey={key}
                        value={existing}
                        error={parsed.error}
                    />
                );
            }

            setItem(user.id, key, parsed.value);
            return <ItemView itemKey={key} value={parsed.value} />;
        },
        {
            body: z.object({
                value: z.string(),
            }),
        },
    )
    .delete("/:key", ({ user, params: { key }, set }) => {
        if (!user) return redirect("/auth/login");

        deleteItem(user.id, key);
        set.headers["HX-Redirect"] = "/storage";
        return "";
    });

export default storage;
```

Auth.tsx

``` tsx
import { Elysia } from "elysia";
import * as z from "zod";
import { Html } from "@elysiajs/html";
import { Page } from "../ui/Page";
import { LoginForm, RegisterForm } from "../ui/Auth";
import { userPlugin } from "../plugins/user";
import { createUser, getUser, getUserByUsername } from "../data";

const auth = new Elysia({ prefix: "/auth" })
    .use(userPlugin)
    .get("/login", ({ user }) => (
        <Page title="login" user={user}>
            <LoginForm />
        </Page>
    ))
    .post(
        "/login",
        ({ body: { username, password }, cookie, set }) => {
            const id = getUserByUsername(username);
            const user = id !== undefined ? getUser(id) : undefined;

            if (id === undefined || !user || user.password !== password) {
                return <LoginForm error="invalid username or password" />;
            }

            cookie.user.value = id.toString();
            set.headers["HX-Redirect"] = "/";
            return "";
        },
        {
            body: z.object({
                username: z.string(),
                password: z.string(),
            }),
        },
    )
    .post("/logout", ({ cookie, set }) => {
        cookie.user.remove();
        set.headers["HX-Redirect"] = "/";
        return "";
    })
    .get("/register", ({ user }) => (
        <Page title="create account" user={user}>
            <RegisterForm />
        </Page>
    ))
    .post(
        "/register",
        ({ body: { username, password }, cookie, set }) => {
            if (getUserByUsername(username) !== undefined) {
                return <RegisterForm error="username already taken" />;
            }

            const id = createUser(username, password);
            cookie.user.value = id.toString();
            set.headers["HX-Redirect"] = "/";
            return "";
        },
        {
            body: z.object({
                username: z.string(),
                password: z.string(),
            }),
        },
    );

export default auth;
```

When I read through `storage.tsx` and `auth.tsx`, my main objective was to find anything that could potentially let us change our UID to `1000`.

However, after going through both files, there doesn't seem to be any direct way to do that. Most of the logic in `storage.tsx` simply retrieves an item using our current `user.id`, then passes the result into UI components such as `ItemCard`, `ItemEditForm`, `ItemView`, or `ItemPage`.

`auth.tsx` is similar. Login gets the UID from `getUserByUsername()`, registration gets it from `createUser()`, and the resulting ID is stored in the `user` cookie. There is no obvious point where we can directly choose or overwrite the UID.

So, at this point, neither `storage.tsx` nor `auth.tsx` gives us a way to turn our UID into `1000`.

![[Pasted image 20260817111533.png]]

Since the application stores our UID in the `user` cookie, I tried the lowest-cost idea first: simply changing the cookie value to `1000`.

It was worth testing before digging deeper, since if the cookie were trusted directly, that alone would be enough to impersonate the admin.

However, after modifying the cookie, the application returned `"user" has invalid cookie signature`, which confirms that the cookie is signed rather than trusted as plain input.

![[Pasted image 20260817111906.png]]

Since the application complained about an invalid cookie signature, I looked for where the cookie signing was configured, hoping there might be something exploitable there.

However, the signing secret is generated using `randomUUID()`, so there is no obvious way to forge a valid cookie signature.

![[Pasted image 20260817112018.png]]

![[Pasted image 20260817112146.png]]

At this point, I was pretty stuck, so I checked whether the dependencies had any known vulnerabilities. And I found one: **CVE-2025-66456**, a **prototype pollution** vulnerability affecting Elysia 1.4.0–1.4.16.

For those who don't know what the fuck prototype pollution is, just click the PortSwigger link below. They explain it way better than I would here. https://portswigger.net/web-security/prototype-pollution

``` js
function mergeDeep(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (isObject(value) && key in target) {
      mergeDeep(target[key], value)
    } else {
      target[key] = value
    }
  }
}
```

The core of this CVE is Elysia's `mergeDeep()` function. When two standalone schemas validate the same request data, Elysia needs to combine their results, and that's where `mergeDeep()` gets called

``` js
if (isObject(value) && key in target) {
      mergeDeep(target[key], value)
```

above code is the problem: in JavaScript, the `in` operator also checks the prototype chain, not just the object's own properties

For example

``` js
const target = {};

"__proto__" in target // will result true
```

So even though `target` doesn't  contain `__proto__`, the expression still returns `true` because `__proto__` exists in its prototype chain

Now let's trace the full chain.

Recall that `mergeDeep()` only gets involved when Elysia has two standalone schema results from the same request that need to be combined.

For example:

``` js
schema1 = {
    body: {
        __proto__: {
            id: 1000
        }
    }
}

schema2 = {
    body: {}
}
```

Elysia then combines both schema using mergeDeep(target , source )

These are the parameter values before entering `mergeDeep()`. I'll call this our **initial state**.

``` js
target = {
    body: {}
}

source = {
    body: {
        "__proto__": {
            id: 1000
        }
    }
}
```

mergeDeep() starts with 

``` js
for (const [key, value] of Object.entries(source))
```

This loop splits `source` into `key` and `value`

``` js
target = {
    body: {}
}

key = "body"

value = {
    "__proto__": {
        id: 1000
    }
}
```

In the first call, `value` is an object, so `isObject(value)` returns `true`.  
The current `key` is `"body"`, and `"body" in target` is also `true` because `target` already contains a `body` property.

Since both conditions are true, the code enters the `if` block statemnt

``` js
if (isObject(value) && key in target) {
      mergeDeep(target[key], value)
      
result -> mergeDeep(target["body"], value)
```

Now the next state becomes:

``` js
target = {}

key = "__proto__"
value = { id: 1000 }
```

`value` is still an object, so `isObject(value)` returns `true`. `"__proto__" in target` also returns `true` because, as mentioned earlier, the `in` operator checks the prototype chain as well. Since every normal object inherits from `Object.prototype`, `__proto__` is found there

Since both conditions are true, the code enters the `if` block statemnt

``` js
if (isObject(value) && key in target) {
      mergeDeep(target[key], value)
      
result -> mergeDeep(target["__proto__"], { id: 1000 })
```

Now the next state becomes

Recall that `target["__proto__"]` points to the prototype of `target`, which for a normal object is `Object.prototype`

``` js
target = Object.prototype <- from target["__proto__"] 

key = "id"
value = 1000
```

Now `isObject(value)` returns `false` because `1000` is not an object, so the code falls into the `else` block

``` js
 else {
      target[key] = value
    }
```

With our current state, this becomes

``` js
Object.prototype["id"] = 1000
```

Now that we've confirmed the prototype pollution, let's go back to the challenge source and look for a property access that can fall back to our polluted prototype value

![[Pasted image 20260817122045.png]]

One function we haven't checked yet is `userPlugin`, and this turns out to be the gadget we need.

The logic is pretty simple: the `user` cookie is optional. If it exists, the plugin calls `getUser(+cookie.user.value)`. If it doesn't, `user` becomes `undefined`.

![[Pasted image 20260817122142.png]]

Next, I checked where `userPlugin` is used. It's attached directly to the `/storage` route group with `.use(userPlugin)`, so every request under `/storage` goes through it.

But that's still not enough. Remember, to trigger `mergeDeep()` we need two standalone schemas to be involved in the same request.

![[Pasted image 20260817122426.png]]

![[Pasted image 20260817122442.png]]

Since `.guard()` runs before the `PUT /:key` route, every `PUT` request passes through both schemas. The guard's `z.any()` keeps our malicious object, while the `PUT` schema is simply there to trigger `mergeDeep()`, since Elysia needs more than one schema result to perform a merge

![[Pasted image 20260817124708.png]]

![[Pasted image 20260817124831.png]]

Our final exploit path is simple: use `PUT /storage/:key` to pollute `Object.prototype.value` with `"1000"`, since the `PUT` request triggers the `.guard()` + route schema merge.

Then send `GET /storage/flag` **without a cookie**. `cookie.user.value` is missing, so it falls back to the polluted prototype value `"1000"`, causing `getUser(1000)` to return the admin user.

![[Pasted image 20260817131505.png]]

Btw, if you're still doubting whether we can just remove the cookie, the Elysia docs confirm it: the cookie object is always defined, only its `.value` can be `undefined`
