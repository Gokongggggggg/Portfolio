![[Pasted image 20260816133426.png]]

If we look at the given source code, we can see that `mint()` looks pretty sus because the `username` seems comes directly from user input and gets inserted into the Biscuit builder f-string

![[Pasted image 20260816133617.png]]

Looking at the `/signup` route, we can confirm that the `username` parameter passed into `mint()` is fully controlled by the user.

Now let's look at `mint()` again. Since we control `username`, whatever we put there will be inserted directly into this Biscuit code:

![[Pasted image 20260816133426.png]]

So, what should we do next?

The obvious idea is to make our username `webmaster`, since the code gives `role("admin")` to that user. Sadly, we can't do that because `webmaster` is already taken.

Instead, we can try to escape from the `user()` statement with something like `xxx");`, inject our own `role("admin")`, and then finish it with another valid `user("x` so the remaining syntax still works.

Payload

```
meko"); role("admin"); user("x
```

![[Pasted image 20260817150943.png]]

![[Pasted image 20260817151025.png]]