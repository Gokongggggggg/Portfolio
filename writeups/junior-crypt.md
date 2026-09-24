![[01.png]]

the chall tells us to find the former weber in his team, since there's no additional info anymore, that means 'team' here must be the organizers of this ctf itself, which is Beavers0

![[02.png]]

Because the challenge description mention something like a former member, the first thing I checked was the former members of beaver0 on CTFtime, but it turned out to be empty. So I made an assumption that maybe they were still listed as a current member -  like it just hadn't been updated yet. So yeah, I checked the real names of each member and mapped them.

![[03.png]]

![[04.png]]

- Handle: small
  Real Name: Sashka Malchik
  Notes: Founder/early member - lists several Beavers CTF platform websites.
- Handle: sudee
  Real Name: Egor Shitik
- Handle: arth74883
  Real Name: Arth Doshi
- Handle: For2aty
  Real Name: Ivan Skryp
- Handle: La_Flame
  Real Name: Gregory Bezzubik
- Handle: F0ra1n
  Real Name: Zakhar Dovidovich
  Notes: Telegram: @F0ra1n
- Handle: vadimm
  Real Name: Vadim M
- Handle: konorazov_ma_22
  Real Name: Matvey Konorazov
- Handle: Blandrein
  Real Name: Denis Semizarov
  Notes: Discord: Kurwaxx
- Handle: goodush
  Real Name: Ivan Krasochka
- Handle: Masik
  Real Name: Maksim Bahar
- Handle: konopackij_ia_23
  Real Name: Ivan Alexandrovich Konopackij
- Handle: Mr.Error
  Real Name: Alex Chychkan
  Notes: Publicly listed skills - Web, Python, OSINT, Crypto
- Handle: Chopiks
  Real Name: Anton Petrovski2007
- Handle: Kata
  Real Name: Ivan Savanets
- Handle: Neisvestny
  Real Name: Neisvestny (no public real name listed)
- Handle: redact3d0
  Real Name: Nikita Kisel
- Handle: Definazu
  Real Name: Hleb Shadura
  Notes: Publicly listed skills - DFIR, Reverse Engineering, Forensics, Pentest, Web Security

Short story from that mapping, I googled all of them - turns out they're all active or there's just no info of them. But then I felt like I was going down the wrong path, because if I continued, it would be an insane grind -Which based on my experience, it felt _not likely_ that it was made this grindy - though it could've been possible, but let's move on first. That's what I was thinking.

So since I felt like I was already on the wrong path, I tried re-reading the challenge description -maybe I missed something. Turns out there was a mention that the person we're looking for occupied high places in the rankings of various info sec platforms.

![[05.png]]

"First, I tried to define what infosec platforms are - there's like HTB, THM, etc. Even more so since the challenge mentioned Weber, so maybe HackerOne and others too, right? But then I remembered - the ones I mapped earlier, the handles with their real names - when I googled them, I didn't get any info that mattered. There was one person who was also the author of this challenge - in their bio there was a mention like 'top 1% on THM.' So I'd definitely check this infosec platform starting with THM first, since that's probably the one their country is really proud of. That's what I was thinking

![[06.png]]

![[07.png]]

Then I checked the THM leaderboard for Belarus - since beaver0 is from Belarus  and one more filter: the all-time high leaderboard

Lucky enough, their LinkedIn profile was linked there too

![[08.png]]

![[09.png]]

Then on their LinkedIn, we found out they actually went to the same university as the beaver0 team. So I went straight to checking where's he currently work , since the flag format asked for the organization name, his current one

![[10.png]]

![[11.png]]

And yeah, turns out it was right lol

> `grodno{Alfa_Bank}`
