# Payramid

**Payroll that pays you back.**

Payramid is payroll infrastructure for Egyptian businesses. It turns the monthly
payroll run — something every company already does — into a permanent, verifiable
record of how the business actually operates.

🔗 **[payramid.github.io](https://payramid.github.io)**

---

## The problem

Payroll is the most reliable thing a business does, and the least useful.

- **One bad row stops everyone.** A wrong account number or a new joiner who isn't
  set up yet, and the whole run bounces. Everybody waits.
- **The record lives in someone's inbox.** Payslips in one folder, transfer
  confirmations in another, corrections agreed over WhatsApp. Answering "what was
  actually paid in March?" is an afternoon's work.
- **A good track record counts for nothing.** Two years of paying eighty people on
  time is the clearest evidence a business is sound — but it isn't evidence anyone
  will accept, because nothing stops the numbers being edited after the fact.

## What Payramid does

You upload the same spreadsheet you use today. Everything after that is different.

- **Preview before you commit.** Every row on screen before anything is submitted.
- **One bad row is held alone.** A payment that can't go through is set aside by
  itself; the rest of the run continues on schedule.
- **Reviews are accountable.** An administrator approves or rejects a held payment,
  a rejection requires a written reason, and the decision itself becomes part of the
  record.
- **Employees see everything.** Each person has their own view of their salary and
  every payment they have ever received, in an account that belongs to them rather
  than to their employer.
- **The record can't be quietly rewritten.** Corrections happen by adding a new
  entry, never by editing the original — including by us.

## The longer game

A lender deciding whether to finance a business wants to know whether money reliably
goes out on time. Most businesses already have that answer — twelve, twenty-four,
thirty-six months of it — but not in a form anyone will trust, because a record the
company itself can edit isn't evidence.

Payramid builds that record as a by-product of running payroll: automate payroll
now, and use the verified history to help eligible businesses reach regulated
financing later.

*Financing is a stated direction, not a service Payramid offers today. Any lending
would sit with licensed partners.*

## Where we actually are

We would rather say this plainly than have anyone find out later.

| | |
|---|---|
| **Live today** | The platform runs. Payroll runs are uploaded, previewed, approved and permanently recorded. Employees have accounts and can see their own payment history. This is working software, not a mockup. |
| **Not yet** | Payramid does not move money. It records that a payment was approved and owed; the transfer still happens on your existing rail. Moving money requires a payment licence, and our route to it is a licensed partner rather than becoming a payment institution ourselves. |
| **In a pilot** | Nobody's salary depends on us. Payramid runs alongside your existing process for two payroll cycles, on real data. You keep paying people exactly the way you do now. |

## Working with us

We are looking for a small number of pilot organisations — two or three businesses
between 30 and 150 employees — and one licensed payment partner.

If either sounds like you, the form at
**[payramid.github.io](https://payramid.github.io#pilot)** is the whole application.

## Where the pilot form goes

**The endpoint lives in one place:** the `action` on `<form id="pilot-form">` in
`index.html`. That attribute is what a browser with JavaScript disabled posts
to, and it cannot be filled in from JavaScript — so `site.js` reads the endpoint
back out of it rather than keeping its own copy. One value, one place, no way
for the two to drift apart and quietly send applications somewhere else.

To point the form somewhere else, change that attribute and nothing else.

**The fallback address** is `FALLBACK_EMAIL` in `assets/site.js`. It is only
ever shown when a submission fails, so it has to be a mailbox somebody reads.
If it is ever set back to a placeholder the page offers no address at all,
which is the honest default — better than sending someone to a dead inbox.

Submissions are delivered by [Formspree](https://formspree.io); the free tier
allows 50 a month. Worth watching that ceiling if the page ever gets picked up.

## Deploying a change

**Bump the cache-buster.** Pages puts a 10-minute cache on static assets and the
headers are not configurable, so the stylesheet and script are referenced with a
version query — currently `styles.css?v=4` and `site.js?v=4`. Increment those in
**both** `index.html` and `404.html` whenever either file changes, or returning
visitors keep the old copy for up to ten minutes and the change looks like it
did not deploy.

**Keep working notes out of the published branch.** Anything committed here is
served verbatim at its own URL, including files nobody linked to. Planning
documents, review notes and screenshots belong somewhere else.

Pushing to `main` publishes. A build takes a minute or two, and assets can 404
until it finishes.

## About this repository

This repository contains the source of the Payramid landing page and nothing else.
The Payramid platform is developed privately, and no architecture, implementation
detail or product internals are published here.

## Legal

Payramid is not a bank and does not provide financial, payment or lending services.
Nothing in this repository is an offer of financing. Any future settlement or
financing would be delivered through appropriately licensed partners.

---

© 2026 Payramid. All rights reserved.

This project is **not** open source. The contents of this repository — including its
design, copy, brand assets and code — are proprietary and may not be copied,
modified, redistributed or used to create derivative works without prior written
permission. See [LICENSE](LICENSE).
