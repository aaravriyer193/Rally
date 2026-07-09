# What Rally Is

Rally is a neighbourhood app built around one observation: the "favour economy" already exists — borrowed ladders, informal babysitting, someone's cousin who does electrical work on weekends — it just lives in WhatsApp groups, school newsletters, and word of mouth. It's frequent, it's painful, and it's still done manually, which is usually where products come from.

Rally gives that economy a front door, split into two connected purposes:

- **Volunteering** — for people who need service hours (DofE, CAS) matched with neighbours who need small jobs done.
- **Find a pro** — a contact-only directory of local trades (electricians, tutors, handymen), with no bidding and no in-app payments.

Both live under one onboarding flow, one identity, one app.

---

## Onboarding

Google OAuth sign-in, then a 4-step wizard:

1. **Give help** or **need help**
2. **Volunteer** or **professional**, under that
3. **Phone number** — private until you're matched with someone
4. **Location** — captured three different ways:
   - Browser GPS (best-effort, asked once)
   - An interactive OpenStreetMap picker where you drag a pin
   - Forward-geocoding — type "Ras Al Khor, Dubai" and it resolves to real coordinates via Nominatim, no GPS required
   - Dragging the pin reverse-geocodes back into a readable text label

Choosing "professional" creates a placeholder listing you edit later from your profile.

---

## The Task Lifecycle

This is the core loop:

1. A "need help" user **posts a task** — title, description, category, location, optional photo, optional budget (a slider, not a bare number field), and timing (one-off, or recurring with a day-of-week picker and hours-per-session).
2. It appears in the **"Tasks near you"** feed, sorted by real distance once both parties have coordinates (haversine, computed client-side), filterable by category and price.
3. Volunteers **apply**. The poster clicks **"Select randomly"** — a Postgres function picks one pending applicant uniformly at random and rejects the rest, server-side. No favouritism, not editable from the client.
4. Once matched, either side can **reveal the other's phone number** via a security-definer function. Numbers are never public — only revealed to a confirmed match.
5. **Mutual completion confirmation**: both the poster and the volunteer must independently confirm the task happened before it flips to "completed." Either can go first; the other sees "waiting for X to confirm." This stops one side unilaterally faking it — it can't stop two people colluding, which is why the certificate itself says *"confirmed by both parties — self-reported, not independently verified."*
6. The poster **rates** the volunteer. The volunteer **requests a certificate**.

## Certificates & Milestones

Certificates are an actual designed document, not a list item — double border, amber corner marks, a Rally seal, recipient name, a certificate number, print/PDF-ready from the browser's own print dialog.

On top of per-task certificates, a **milestone system** auto-awards separate achievement certificates when you cross hour thresholds (5/10/25/50/100) or task-count thresholds (1/5/10/25), computed against your real completed-task history every time your profile loads.

## Find a Pro

Deliberately simple: a searchable, filterable directory by category, a real editable listing (description, rate), and a "Get contact" button that reveals a phone number to any signed-in neighbour. No booking flow, no payment processing, no fees — that's exactly the complexity that kills most neighbourhood apps before they prove anyone wants the connection at all.

## Maps

Two different tools for two different needs:
- **Leaflet + OpenStreetMap** for anything interactive — dragging your location pin, clicking pins on the Home map view.
- **A zero-cost Google Maps iframe embed** (`?q=<place>&output=embed`, no API key, no billing) for simple display-only views, like a task's location on its detail page.

## Trust & Fairness

- Row-Level Security everywhere — phone numbers are unreadable except through the reveal functions; certificates only insertable by the completing applicant; milestones only self-awardable.
- Random selection instead of poster-choice.
- Mutual confirmation instead of one-sided completion.
- Honest limits stated on the certificate itself, rather than pretending the platform can verify real-world labour.

## Gamification

Every completed task awards points (5 to the poster, 10 to the volunteer), feeding a leaderboard. Ratings accumulate on a profile as a trust signal. Milestones layer on top as their own certificates.

## Design

Airbnb's warmth meets the New York Times' editorial restraint — rounded cards, generous whitespace, one confident display font (Questrial), and a palette pulled from paper and ink (`#111110` ink, `#F5F3EE` cream, `#F5A623` amber, `#1A7A4A` green) rather than default SaaS blue. Mobile-first, with a desktop sidebar layout that mirrors the same navigation.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite, Tailwind v4, Phosphor Icons (CDN)
- **Backend**: Supabase — Postgres, Auth, Row-Level Security, and every business rule (random selection, contact reveal, mutual confirmation, certificate issuance) implemented as a callable Postgres function, never trusted to the client
- **Maps**: react-leaflet (OpenStreetMap) + a key-free Google Maps embed
- No backend server of its own — everything lives in Postgres functions callable from the client

## Why This, Why Now

Neighbourhood apps like this don't fail because nobody thought of them — they fail because of three specific problems: it's a **chicken-and-egg marketplace** (needs both sides at once or it feels empty), the **customer is fragmented** (students, parents, retirees, tradespeople — no single group owns the ecosystem), and **trust & safety** questions compound the moment you connect strangers locally.

The fact that people already solve this manually — in group chats, newsletters, word of mouth — is itself evidence a market exists. The real question was never whether the idea works. It's whether someone can execute well enough to win one school, one street, or one city first.
