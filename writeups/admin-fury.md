![[challenge-prompt.png]]

note: tbh this was a very bad ctf - they only gave 5 attempts for osint challs and the flag format was horrible. but the fursuit motivated me enough to write this WU

## 1. Identifying The Event Name

First, we need to identify the event name. I already know it's an event at ICE BSD, but to confirm, we can just check using google AI mode.

![[fury-1.png]]

## 2. Determine the Edition

![[fury-2.png]]

Events that have multiple editions usually come with a different theme for each edition. In the given challenge image, the person is wearing a wristband with a unique pattern, so I assumed the pattern matches the theme of that particular edition. From there, I started scrolling Instagram using the #comifuro hashtag

![[fury-3.png]]

![[cf22-tag.png]]

After scrolling for a while, luckily I quickly found a post of someone wearing a wristband with the same pattern as the one in the challenge image. Their caption mentioned "CF22", so it's definitely Comifuro 22.

![[comifuro-official.png]]

Since there was still a chance of being wrong, I checked Comifuro's official Instagram and found the post above - and it perfectly matches the wristband pattern. So it's fully confirmed: this is Comifuro 22.

## Finding The Map

Once the event was confirmed, the next step was locating the venue map. Searching for `comifuro 22 map pdf` quickly led to the official floor map and booth directory.

![[map-search.png]]


## Matching The Booth

In the given image, there's a booth sign with the text RGB. So I searched for "RGB" in the PDF, and it turned out there were 2 matching booths. This means we can't immediately tell which one is the right one - so we need an extra step to confirm. (or maybe we can bruteforce since it's only 2 lol )

![[admin-rgb-clue.png]]
![[rgb-map-search.png]] 

For the confirmation step, all we need is a simple Google search - since we'd most likely find the booth's logo there. And right as I searched, RGB Team popped up as the very first result, so now we know the booth is located at B-25ab.

![[rgb-profile.png]]


## Finding the Row Range

RGB Team is located at B-25ab. Since the flag format asks for a row range rather than the exact booth, we need to identify the row where this booth sits. Looking at the map, booth 25ab is on the same row as booths 24 through 30 - so the range we need is B24-B30

![[range-map.png]]

> `ctffit{Comic Frontier 22_b24-b30}`


