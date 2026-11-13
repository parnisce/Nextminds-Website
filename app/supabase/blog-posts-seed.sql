-- NextMinds: 6 SEO blog posts. Run once in the Supabase SQL Editor (safe to re-run).
-- Covers are served from /assets/blog/ on the website.

insert into public.posts (slug, title, excerpt, content, cover_url, status, published_at) values
('what-are-ai-agents-and-how-can-they-help-your-business', 'What Are AI Agents and How Can They Help Your Business?', 'AI agents do more than answer questions. They take action. Learn what they are, where they pay off first, and how to start without a big budget.', 'AI agents are software assistants that can understand a goal, decide what to do next and carry out the steps for you. Unlike a simple chatbot that only replies to questions, an agent can look up information, update your systems and finish a task from start to end.

## How an AI agent is different from a chatbot

A chatbot answers. An agent acts. A chatbot can tell a customer your opening hours. An agent can check the calendar, book the appointment, send the confirmation and add the contact to your CRM, all in one conversation.

- Chatbots follow scripts and answer from a fixed set of replies.
- Agents use tools such as your calendar, inbox, spreadsheet or website to complete work.
- Agents can hand over to a person when a request needs human judgement.

## Where AI agents help most

The best first projects are repetitive tasks that eat hours every week. Small and mid-sized businesses usually see the quickest return in these areas:

- Customer support: answering common questions at any hour and passing complex ones to your team with the full context.
- Lead handling: replying to new enquiries within seconds, asking qualifying questions and booking calls.
- Admin work: sorting email, filling forms, updating records and preparing weekly reports.
- Content support: drafting product descriptions, summaries and social posts for a person to review.

## What to prepare before you start

You do not need perfect data or a large team. You need a clear task, a few examples of how it is done today and a decision about what the agent may do on its own. Start with one narrow job, measure the hours saved, then add more.

## Keep people in control

Good agents are built with guardrails. They log what they do, ask for approval before sensitive actions and stop when unsure. This keeps quality high and lets your team trust the result.

## Getting started with NextMinds

Our AI agent development service designs, builds and connects agents to the tools you already use. We begin with a short discovery call, agree on one measurable goal and deliver a working agent you can test quickly. Contact us to talk through your first use case.', '/assets/blog/what-are-ai-agents-and-how-can-they-help-your-business.jpg', 'published', now() - interval '0 days')
on conflict (slug) do update set title = excluded.title, excerpt = excluded.excerpt, content = excluded.content, cover_url = excluded.cover_url, status = 'published';

insert into public.posts (slug, title, excerpt, content, cover_url, status, published_at) values
('how-much-does-a-business-website-cost-in-2026', 'How Much Does a Business Website Cost in 2026?', 'A plain-English guide to website pricing: what drives the cost, what you really need and how to avoid paying for features you will never use.', 'The honest answer is that a business website can cost anywhere from a few hundred dollars to tens of thousands. The price depends on what the site has to do for your business, not on how many pages it has.

## What affects the price

- Custom design versus a template: a unique design takes more time but helps you stand out.
- Number and type of pages: a five-page brochure site is very different from a site with a shop or booking system.
- Features: contact forms, online payments, member areas and integrations add build time.
- Content: professional copy, photography and video improve results but take effort.
- Search engine optimisation: clean structure, fast loading and proper metadata should be built in from day one.

## Typical ranges

A simple brochure site for a local service business often sits at the lower end. A custom marketing site with several service pages, a blog and strong SEO costs more. An online store or web application costs the most because of payments, stock and security.

## Hidden costs to watch for

Ask what is included for hosting, domain renewal, security updates and support. A cheap build can become expensive when every small change is billed separately.

## How to get more value

- Start with the pages that bring customers: home, services, about and contact.
- Write down your main goal, such as phone calls, bookings or sales.
- Plan to launch, then improve based on real visitor behaviour.
- Choose a team that explains trade-offs instead of upselling.

## Work with NextMinds

Our web design and development team builds fast, search-friendly sites that are made to convert. Tell us your goals and budget on the contact page and we will recommend what you actually need.', '/assets/blog/how-much-does-a-business-website-cost-in-2026.jpg', 'published', now() - interval '3 days')
on conflict (slug) do update set title = excluded.title, excerpt = excluded.excerpt, content = excluded.content, cover_url = excluded.cover_url, status = 'published';

insert into public.posts (slug, title, excerpt, content, cover_url, status, published_at) values
('real-estate-photography-tips-that-help-listings-sell-faster', 'Real Estate Photography Tips That Help Listings Sell Faster', 'Buyers decide in seconds. These photography, video and staging tips make your listings stand out and bring more qualified viewings.', 'Most buyers start their search online, and the first thing they judge is your photos. Strong images make people click, save and book a viewing. Weak ones are scrolled past in a second.

## Shoot in the right light

Natural light flatters a home. Schedule the shoot for bright daytime hours, open every curtain and switch on all lamps so rooms feel warm and balanced. HDR photography combines several exposures so windows and dark corners are both clear.

## Prepare the property

- Declutter surfaces and remove personal items.
- Clean windows, floors and kitchen counters.
- Put away bins, cables and pet items.
- Add fresh flowers or a bowl of fruit for a welcoming touch.

## Use the right angles

Shoot from the corners of a room at chest height with the camera level so walls stay straight. Wide shots show space, while a few detail shots show quality finishes. Always include the best feature, whether it is a view, a fireplace or a large garden.

## Add video and drone footage

Video tours let buyers walk through a home from the sofa. Drone footage shows the lot, the neighbourhood and nearby parks. Both increase time spent on a listing and help serious buyers decide.

## Consider virtual staging

Empty rooms are hard to picture. Virtual staging adds furniture digitally at a fraction of the cost of physical staging, and helps buyers see how each space can be used.

## Why professional media pays off

Professionally shot listings tend to attract more views and enquiries. NextMinds provides HDR photography, video and drone tours, virtual staging and dedicated listing pages. Get in touch to plan your next listing.', '/assets/blog/real-estate-photography-tips-that-help-listings-sell-faster.jpg', 'published', now() - interval '6 days')
on conflict (slug) do update set title = excluded.title, excerpt = excluded.excerpt, content = excluded.content, cover_url = excluded.cover_url, status = 'published';

insert into public.posts (slug, title, excerpt, content, cover_url, status, published_at) values
('seo-checklist-for-small-business-websites', 'The SEO Checklist for Small Business Websites', 'A practical checklist to help your site rank on Google: technical basics, on-page tips, local signals and content that earns trust.', 'Search engine optimisation sounds complicated, but most small business sites win by getting the basics right. Use this checklist to find quick wins.

## Technical basics

- Make sure the site loads quickly on mobile.
- Use HTTPS on every page.
- Submit an XML sitemap to Google Search Console.
- Fix broken links and avoid duplicate pages.
- Use clean, readable URLs.

## On-page optimisation

Every page needs one clear topic. Give it a unique title of around 60 characters and a meta description of around 155 characters that invites the click. Use a single main heading, short paragraphs and descriptive subheadings. Add alt text to images so search engines and screen readers understand them.

## Content that matches search intent

Think about what a customer types before they find you, then answer it directly. Service pages should explain what you do, who it is for, how it works and what happens next. Blog posts can answer common questions and build trust over time.

## Local SEO

- Claim and complete your Google Business Profile.
- Keep your name, address and phone number the same everywhere.
- Ask happy customers for reviews.
- Mention the areas you serve on your pages.

## Structured data

Schema markup helps search engines understand your business, services and articles. It does not guarantee rich results, but it makes your pages clearer to read.

## Measure and improve

Check Search Console monthly to see which searches bring visitors, then improve pages that are close to the first page. SEO is steady work, not a one-time task.

## Need help?

NextMinds builds sites with SEO in from the start, including sitemaps, metadata, structured data and fast performance. Contact us for a friendly review of your current site.', '/assets/blog/seo-checklist-for-small-business-websites.jpg', 'published', now() - interval '9 days')
on conflict (slug) do update set title = excluded.title, excerpt = excluded.excerpt, content = excluded.content, cover_url = excluded.cover_url, status = 'published';

insert into public.posts (slug, title, excerpt, content, cover_url, status, published_at) values
('ecommerce-conversion-tips-to-turn-visitors-into-customers', '10 E-Commerce Conversion Tips to Turn Visitors into Customers', 'Traffic is only half the story. These simple changes to product pages, checkout and trust signals help more visitors complete their order.', 'Getting people to your online store is hard enough. Do not lose them at the last step. These tips improve conversion without a full redesign.

## 1. Speed up your store

Every extra second of loading costs sales. Compress images, remove unused apps and test on a mobile connection.

## 2. Show clear product photos

Offer several angles, zoom and a photo of the product in use. Good images reduce doubt and returns.

## 3. Write benefit-led descriptions

Say what the product does for the buyer, then list the specifications. Keep it short and scannable.

## 4. Show real reviews

Customer reviews build trust fast. Display star ratings near the price and respond to feedback.

## 5. Make shipping and returns obvious

Surprise costs are the top reason for abandoned carts. Show delivery times and fees before checkout.

## 6. Simplify checkout

- Offer guest checkout.
- Ask only for what you need.
- Provide popular payment options.
- Show a progress indicator.

## 7. Add trust signals

Secure payment badges, clear contact details and a visible returns policy reassure first-time buyers.

## 8. Recover abandoned carts

A short, friendly reminder email can bring back a meaningful share of shoppers who left.

## 9. Recommend related products

Suggest items that go with the one being viewed to raise the average order value.

## 10. Test and measure

Change one thing at a time and compare results. Small improvements add up.

## Build a better store with NextMinds

Our e-commerce services cover store design, product setup, payments and performance tuning. Reach out and we will review your store for quick wins.', '/assets/blog/ecommerce-conversion-tips-to-turn-visitors-into-customers.jpg', 'published', now() - interval '12 days')
on conflict (slug) do update set title = excluded.title, excerpt = excluded.excerpt, content = excluded.content, cover_url = excluded.cover_url, status = 'published';

insert into public.posts (slug, title, excerpt, content, cover_url, status, published_at) values
('why-video-and-photo-content-builds-brand-trust', 'Why Professional Video and Photo Content Builds Brand Trust', 'People trust faces and real places. Learn how headshots, brand films and portraiture strengthen your website, profiles and sales.', 'Customers decide whether to trust a business within seconds of landing on its page. Authentic photos and video are one of the fastest ways to earn that trust.

## People buy from people

Stock images feel generic. Real photos of your team, studio and work show visitors who is behind the business. Professional headshots on your About page and profiles create a confident first impression.

## Video tells your story

A short brand film can explain what you do, show your process and share customer success in under two minutes. Video keeps visitors on the page longer and is easy to share on social media.

## Where to use your content

- The homepage hero and service pages.
- Social profiles and ads.
- Email signatures and proposals.
- Press, speaker and partner pages.

## Plan your shoot

- Decide the goal: awareness, recruitment or sales.
- Choose a simple message and a clear call to action.
- Pick a location that fits your brand.
- Prepare outfits, props and a shot list.

## Keep it consistent

Use the same colours, tone and style across photos and videos so your brand is easy to recognise. A consistent look makes a small business feel established.

## Make the most of every shoot

One session can produce a library of images and short clips for months of content. Good editing and careful colour work make everything feel polished.

## Create with NextMinds

Our media production and portraiture team handles planning, filming, editing and delivery. Book a call to discuss the content your brand needs.', '/assets/blog/why-video-and-photo-content-builds-brand-trust.jpg', 'published', now() - interval '15 days')
on conflict (slug) do update set title = excluded.title, excerpt = excluded.excerpt, content = excluded.content, cover_url = excluded.cover_url, status = 'published';
