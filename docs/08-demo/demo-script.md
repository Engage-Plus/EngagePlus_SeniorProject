# Engage+ demo script (about 6 minutes)

Live demo of the Engage+ prototype at **https://engage-plus.github.io/EngagePlus_SeniorProject/**.
Set up first with [demo-runbook.md](demo-runbook.md). Every name in the demo data is fictional.

**How to read this:** the left column is what you do on screen and the right column is what you say. Times are targets. Record each numbered segment as its own clip so a mistake costs one segment, not the whole take.

---

## 1. Hook (0:00–0:30)

| On screen | Say |
|---|---|
| Title card: "Engage+ · Find your people. Show up." | "Every week there are dozens of events at Howard: workshops, cultural nights, recruiter mixers. Most students never hear about them, or they find out the day after." |
| Switch to Engage+ Discover, phone view, signed out | "Anthology Engage is the official record, but it's a directory, not a way to discover things. Engage+ sits on top of it. It's a mobile-first website that helps you find events and act on them in a tap." |

## 2. Discover (0:30–1:15) · F4, F13

| On screen | Say |
|---|---|
| Scroll slowly past **Trending this week** | "On the home page you see what's trending right now, ranked by how many students have RSVP'd this week." |
| Tap the **Professional** chip, then **All events** | "Filter by category…" |
| Type `hack` in search, then clear it | "…or search. Each card shows the date, host, location and how many people are going." |

## 3. Sign in and swipe (1:15–2:45) · F21, F2, F3, F17

| On screen | Say |
|---|---|
| Tap **Sign in**. Point at the disabled Microsoft button | "In production you sign in with your Howard Microsoft account, and the server only accepts Howard's tenant. For the demo we use example accounts." |
| Tap **Student: Jordan Ellis** (opens Swipe) | "This is the core of Engage+: a swipe feed picked for you." |
| Point at **Why you're seeing this** | "Every card says why it's here: orgs you follow, your interests, friends going, or that it's trending. Here two of Jordan's friends are going to the Caribbean Night Market." |
| Tap the red ✓ (RSVP) | "Swipe right to RSVP…" |
| Drag the next card **left** | "…left to skip…" |
| Tap the **person+** button (follow) | "…or up to follow the org without committing to the event." |
| Point at the "N left" counter | "Each swipe is recorded once. Swiping the same event again never double-counts, and we have a test for exactly that." |

## 4. Personalize (2:45–3:45) · F1, F12, F18

| On screen | Say |
|---|---|
| Discover → tap the **New here? Take the quiz** banner | "A new student doesn't follow anyone yet, so we start with a 30-second quiz." |
| Answer: **Build skills** → **Hackathon with pizza** → **STEM** | — |
| Show **Your matches**, tap **Follow** on Bison Coders | "It matches you with orgs, and those interests now rank your feed." |
| Tab **My Events** | "My Events shows everything you've RSVP'd to." |
| Point at **My class schedule** | "Students told us the biggest reason they skip events is class. Add your schedule…" |
| Tab **Discover**, point at **Hide events during my classes (N hidden)** and flip the switch off and on | "…and Engage+ hides anything that overlaps. Turn it off and those events come back, flagged in red." |
| Back on **My Events**, flip **Hide my RSVPs** | "Privacy is built in. Hide your RSVPs and friends won't see where you're going." |

## 5. Event page (3:45–4:15) · F20

| On screen | Say |
|---|---|
| Open any event card | "Each event page has the details, friends going, and a class-conflict warning if there is one." |
| Tap **Add to calendar** | "One tap exports it to Google, Apple or Outlook calendar as an .ics file." |

## 6. Org side (4:15–5:30) · F10, F14, F8

| On screen | Say |
|---|---|
| Sign out (top right) → **Org manager: Taylor Reed** (opens Dashboard) | "Now the org side. Taylor runs Bison Coders." |
| Scroll the **Dashboard** stat tiles and **Event funnel** | "Managers see followers, views, swipe rights and RSVPs per event, so they know what's working. Only managers can see this, and it's all anonymous counts." |
| Tap **Post an event** | "Orgs already write an Instagram caption for every event. They shouldn't have to type it all again." |
| Tap **Example 1**, then **Fill the form** | "Paste the caption and Engage+ pulls out the title, date, time, location and price." |
| Point at the filled form fields | "In production, Gemini reads the caption, and we send it no names or emails. If the AI fails, these same rules take over, so posting never breaks." |
| Tap **Publish event** | "Check it, publish, and it's live." |
| Tab **Discover**, scroll to the new event | "Students can see it and RSVP right away." |

## 7. Under the hood and roadmap (5:30–6:00)

| On screen | Say |
|---|---|
| Slide: stack + "22 automated tests" | "The prototype is React and TypeScript, deployed to GitHub Pages by GitHub Actions. Every feature ships with an acceptance test named after its requirement. 22 tests run on every push." |
| Slide: roadmap | "Next: the production API with Postgres, live Howard Microsoft sign-in, Gemini parsing on the server, notifications, and a browser extension that posts straight from Instagram." |
| Team slide | "We're Engage+. Thanks." |

---

## What's real in the demo vs production

Say this honestly if asked. Don't claim more on camera.

| Feature | In this demo | In production plan |
|---|---|---|
| Data | Example data saved in the browser; reseeds daily | Postgres on Supabase via the Express API |
| Sign-in | One-click example accounts | Microsoft sign-in, Howard tenant only (F21) |
| Caption parser | Rule-based parser in the browser | Gemini JSON on the API, with these rules as the fallback (F14) |
| Recommendations | Deterministic score with reasons | Same score plus a Gemini re-rank (F3) |
| Class schedule | Typed in by hand | Upload (F12) |
| Notifications, extension, co-hosts | Not shown | F7, F15, F19 |

## Requirement map

F1 quiz · F2 swipe · F3 "for you" ranking · F4 trending · F8 dashboard · F10 posting · F12 class conflicts · F13 filters · F14 caption parser · F17 friends going · F18 hide RSVPs · F20 calendar export · F21 sign-in (stand-in)
