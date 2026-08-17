![[Pasted image 20260816144808.png]]

From the challenge description, we already get a pretty strong hint to check `robots.txt`, since the challenge says:

> “AI crawlers never respect the rules...”

`robots.txt` is basically a file that tells web crawlers which paths they are allowed or not allowed to crawl. Googlebot, for example, is Google Search's web crawler, and Google documents that it uses `robots.txt` rules when crawling websites. https://developers.google.com/search/docs/crawling-indexing/googlebot 

So the idea here is probably that the challenge has some interesting path hidden behind a `Disallow` rule in `robots.txt`.

![[Pasted image 20260816145120.png]]

![[Pasted image 20260816145216.png]]

