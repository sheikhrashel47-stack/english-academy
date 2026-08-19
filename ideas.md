# English Academy — ডিজাইন নির্দেশনা

## সম্ভাব্য তিনটি নকশা-ধারা

### ১. পাঠশালার নীরব আলো
**খুব সংক্ষিপ্ত পরিচিতি:** বাংলাদেশি পাঠশালার পরিচিত উষ্ণতা ও একটি আধুনিক ব্যক্তিগত study desk-এর সংমিশ্রণ। শিক্ষার্থীকে চাপ নয়, স্থির অগ্রগতির অনুভূতি দেবে।

**সম্ভাব্যতা:** 0.07

### ২. ভাষার মানচিত্র
**খুব সংক্ষিপ্ত পরিচিতি:** ইংরেজি শেখাকে একটি খোলা পথ, স্তর ও মাইলফলকের মানচিত্র হিসেবে উপস্থাপন করে। প্রতিটি lesson একটি গন্তব্য, প্রতিটি অনুশীলন এগোনোর একটি দৃশ্যমান পদক্ষেপ।

**সম্ভাব্যতা:** 0.04

### ৩. এডিটোরিয়াল লার্নিং জার্নাল
**খুব সংক্ষিপ্ত পরিচিতি:** উচ্চমানের ভাষা-পত্রিকা ও ব্যক্তিগত notebook-এর শান্ত, বুদ্ধিদীপ্ত মিশ্রণ। বিষয়বস্তুকে মনোযোগী ও প্রিমিয়াম অভিজ্ঞতা হিসেবে তুলে ধরে।

**সম্ভাব্যতা:** 0.09

---

## নির্বাচিত ধারা: ভাষার মানচিত্র

### Design Movement
**Cartographic editorial design** এবং **warm modern learning workspace**-এর সমন্বয়। ডিজিটাল শেখাকে কোনো ভারী dashboard হিসেবে নয়, ধাপে ধাপে পেরোনো একটি ব্যক্তিগত পথ হিসেবে দেখা হবে।

### Core Principles

1. **পথ দৃশ্যমান:** level, unit, lesson এবং আজকের কাজ সবসময় পথের মাইলফলক হিসেবে উপস্থিত থাকবে।
2. **মনোযোগ আগে:** lesson player-এ তথ্যের ভিড় নয়; একটি প্রশ্ন, একটি ধারণা, একটি পরবর্তী কাজ।
3. **উষ্ণ কিন্তু কঠোর নয়:** কাগজের মতো off-white, কালি-রঙা লেখা, ও ছোট সজীব accent শিক্ষার্থীকে স্বস্তি দেবে।
4. **অগ্রগতি বাস্তব:** progress, streak ও mastery কেবল সংখ্যা নয়—চিহ্ন, রেখা এবং ধাপে ধাপে পূর্ণ হওয়া map marker দিয়ে বোঝানো হবে।

### Color Philosophy
ভিত্তি হবে **parchment/off-white**, যেন দীর্ঘ পড়ার সময় চোখে আরাম থাকে। মূল ink হবে গভীর নীল-কালো—আত্মবিশ্বাসী ও পাঠযোগ্য। স্বাক্ষর accent হিসেবে ব্যবহৃত হবে **মাটির তামাটে কমলা (Wayfinder Terracotta)**, যা অগ্রগতি ও উষ্ণতার সংকেত দেবে। শীতল sage/teal secondary accent হবে mastery এবং completion-এর জন্য। উজ্জ্বল নীল বা বেগুনি gradient ব্যবহার করা হবে না।

### Layout Paradigm
Dashboard একটি প্রচলিত symmetric card grid হবে না। বাম পাশে স্থায়ী **Learning Compass** navigation, মাঝখানে চলমান **learning trail**, এবং ডান পাশে অল্প-প্রস্থের **Today / Review** rail থাকবে। মোবাইলে rail-গুলো contextual sheet ও compact horizontal trail-এ রূপ নেবে। Lesson player একটি প্রশস্ত reading column এবং পাশে নরম progress landmark ব্যবহার করবে।

### Signature Elements

1. **Dotted learning trails:** সূক্ষ্ম বিন্দুযুক্ত রেখা দিয়ে level ও lesson path যুক্ত থাকবে।
2. **Map pins / lesson stamps:** সম্পন্ন lesson-এ ছোট stamp বা pin ব্যবহৃত হবে, badge নয়।
3. **Margin notes:** explanation ও feedback-এর কাছে সম্পাদকীয় margin-note treatment থাকবে।

### Interaction Philosophy
প্রতিটি interaction শিক্ষার্থীকে তার বর্তমান অবস্থান এবং পরবর্তী নিরাপদ পদক্ষেপ জানাবে। Submit, continue ও complete action-এ সংক্ষিপ্ত feedback থাকবে; অসম্পন্ন কাজ বন্ধ হয়ে গেলে অবস্থান সংরক্ষিত থাকবে। ভবিষ্যৎ module-এর placeholder কখনো dead-end হবে না; এটি স্পষ্ট করে বলবে যে feature-টি এখনো Phase 0 scope-এর বাইরে।

### Animation
Route transition দ্রুত এবং কম দৃশ্যমান হবে—180–240ms opacity ও সামান্য translate। Trail marker completion-এ 220ms-এ পূর্ণ হবে। Progress ring ধীরে নয়, response-based animation ব্যবহার করবে। Hover-এ card উপরে 2px উঠবে; button press-এ 0.97 scale হবে। `prefers-reduced-motion` সক্রিয় হলে সব nonessential motion বন্ধ হবে।

### Typography System
Headlines-এর জন্য **DM Serif Display**—ভাষা শেখার ঐতিহ্য ও গুরুতরতা প্রকাশ করতে। Body ও UI-এর জন্য **Manrope**—পরিষ্কার, উচ্চ-পাঠযোগ্য এবং Bangla UI copy-এর পাশে ভারসাম্যপূর্ণ। Bangla fallback হবে **Noto Sans Bengali**। Display headline কেবল স্তর, lesson title এবং বড় status statement-এ; UI label ও instructional content-এ Manrope ব্যবহৃত হবে।

### Brand Essence
**English Academy হলো বাংলাভাষী শিক্ষার্থীর জন্য একটি offline-ready, পথনির্দেশিত ইংরেজি শেখার কর্মক্ষেত্র—যেখানে প্রতিটি অনুশীলন বাস্তব অগ্রগতিতে রূপ নেয়।**

**ব্যক্তিত্ব:** মনোযোগী, আশ্বস্তকারী, পদ্ধতিগত।

### Brand Voice
ভাষা হবে সংক্ষিপ্ত, সরাসরি এবং সহানুভূতিশীল; অতিরঞ্জিত motivation নয়, পরবর্তী সুনির্দিষ্ট কাজ জানাবে।

> “আজ একটি ছোট পাঠ—আগামীকালের কথোপকথনে তার ব্যবহার।”

> “তুমি এখানে থেমেছিলে। চল, পরের বাক্যটি গড়ি।”

### Wordmark & Logo
Logo mark হবে একটি **খোলা compass chevron-এর মধ্যে বইয়ের পাতার রেখা**, যা দিকনির্দেশ ও শেখার পথকে একত্র করে। Wordmark-এ custom editorial serif treatment থাকবে; default system font নয়। Logo mark text ছাড়া PNG হিসেবে ব্যবহৃত হবে এবং header ও favicon-এ স্পষ্ট আকারে থাকবে।

### Signature Brand Color
**Wayfinder Terracotta — `#C95D3A`**। এটি অগ্রগতি, CTA এবং active learning position-এর একমাত্র প্রধান signal colour।

## Style Decisions

- Lesson ও dashboard-এ অতিরিক্ত rounded card ব্যবহার করা যাবে না; border radius সংযত থাকবে।
- Background-এ ক্ষীণ paper grain ও map contour detail থাকবে, কিন্তু পাঠযোগ্যতার ক্ষতি করা যাবে না।
- সব illustration ও generated imagery-তে text-free composition এবং লিখিত UI copy-এর জন্য পর্যাপ্ত safe area থাকতে হবে।
- Architecture-level screen-এ visual polish অবশ্যই content hierarchy ও offline-first logic-কে সমর্থন করবে।
- প্রতিটি প্রধান page-এর উপরাংশে একটি দৃশ্যমান **route, landmark অথবা stamp** থাকতে হবে; generic grid বা list-কে word atlas, route record, field note বা lesson stamp হিসেবে frame করতে হবে।
- **Wayfinder Terracotta `#C95D3A`** শুধু primary action, current learning position এবং active route-এ ব্যবহার হবে; sage/teal কেবল completion, mastery এবং safe feedback বোঝাবে।
- Sidebar wordmark-এ compass/book mark এবং editorial serif lockup স্পষ্টভাবে একসঙ্গে থাকবে; সব learner-facing screen-এ “আমি এখন কোথায়, এবং পরের নিরাপদ পদক্ষেপ কী?”—এই প্রশ্নের উত্তর দৃশ্যমান থাকতে হবে।
