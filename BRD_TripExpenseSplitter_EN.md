# Business Requirements Document (BRD)
## Trip Expense Splitter

**Version:** 1.0
**Date:** 06/06/2026
**Status:** Draft

---

## 1. Background & Problem

### 1.1 Background
Nga's team at the company occasionally goes on trips to relax (no fixed dates). On each trip, Nga is the one who pays for all the group's costs upfront. A trip includes several different activities (meals, car rental, entrance tickets, etc.), and not every activity includes everyone.

### 1.2 Current Problem
- At the end of the trip, Nga has to split the bill among everyone, which is very tricky because each activity has a different set of participants.
- Nga is not good with Excel and not confident doing manual calculations.
- Participants have no way to review which activities they joined and how much they owe.

### 1.3 Impact
Without this product: Nga spends a lot of time calculating, is prone to mistakes, may cause misunderstandings or a sense of unfairness within the group, and has to explain things manually to each person.

---

## 2. Goals

| # | Goal | Success Metric |
|---|------|----------------|
| 1 | Help Nga split bills quickly and accurately | Finish summarizing a trip in under 10 minutes, with no manual calculation |
| 2 | Automatically compute the correct amount each person owes | 0 calculation errors; total of all activities = total collected from everyone |
| 3 | Let participants view their own costs | Each person can see the activities they joined + the amount owed without asking Nga |

---

## 3. Scope

### 3.1 In Scope
- Manage one trip at a time.
- Nga enters each activity along with its cost.
- Select participants for each activity.
- Automatically split each activity's cost equally among its participants.
- Summarize the total amount each person owes for the whole trip.
- Participants log in simply to view their own costs and activities.
- Mobile-optimized interface (mobile web).

### 3.2 Out of Scope
- Splitting by custom ratio/amount (this version only does **equal split**).
- Managing multiple trips at once / history of multiple trips.
- Online payment or e-wallet/bank integration.
- Messaging or comments between members.
- Handling multiple payers (only one payer — Nga).

---

## 4. User Personas

### Persona 1 — Nga (Organizer / Cost Manager)

> *"I just want to enter the amounts and have it calculate how much each person owes — don't make me do Excel."*

| Info | Detail |
|------|--------|
| Role | The person who pays for and summarizes the trip |
| Profile | Company employee, not good with Excel / manual calculation |
| Goal | Split bills quickly, accurately, and fairly |
| Concern | Miscalculating, wasting time, causing misunderstandings in the group |
| Device | Phone (mobile web) |

**Typical journey:**
Trip ends → open the web app on phone → create a trip & add the member list → enter each activity with its amount → select who joined that activity → system splits equally → view the summary of how much each person owes → share with the group.

### Persona 2 — Team Member (Participant)

> *"Just let me see which activities I joined and how much I have to pay."*

| Info | Detail |
|------|--------|
| Role | Trip participant who needs to pay Nga back |
| Profile | A colleague in the group, only cares about their own share |
| Goal | Know exactly how much they owe and why |
| Concern | Being wrongly charged for an activity they didn't join |
| Device | Phone (mobile web) |

**Typical journey:**
Receive a notification/link → log in simply → view the list of activities they joined → see the amount per activity and the total owed.

---

## 5. Functional Requirements

### 5.1 Trip & Member Management

| ID | Requirement | Priority |
|----|-------------|----------|
| F-01 | Nga can create a trip (name, date) | Must Have |
| F-02 | Nga can add/edit/delete the list of members on the trip | Must Have |
| F-03 | The system manages only one trip at a time | Must Have |

### 5.2 Activity & Cost Management

| ID | Requirement | Priority |
|----|-------------|----------|
| F-04 | Nga can add an activity with a name and total amount | Must Have |
| F-05 | For each activity, Nga selects the members who participated | Must Have |
| F-06 | The system automatically splits the activity amount equally among the participants | Must Have |
| F-07 | Nga can edit/delete an entered activity | Should Have |

### 5.3 Summary & Sharing

| ID | Requirement | Priority |
|----|-------------|----------|
| F-08 | The system aggregates the amount each member owes for the whole trip | Must Have |
| F-09 | Display a summary table: member name + total + breakdown by activity | Must Have |
| F-10 | Allow sharing the summary with the group (e.g., a link or image export) | Should Have |

### 5.4 Member Login & View

| ID | Requirement | Priority |
|----|-------------|----------|
| F-11 | Members log in simply (name + phone number or email) | Must Have |
| F-12 | Members can only view their own costs and activities | Must Have |
| F-13 | Members can see the total amount they owe | Must Have |

---

## 6. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Platform | Mobile web — optimized for phone screens, opens in a browser, no app install needed |
| Performance | Instant calculation and summary display when adding/editing activities |
| Security | Members can only view their own data; only Nga can add/edit activities |
| UX | Simple interface, minimal text, few steps; suitable for users who aren't good with calculation tools |

---

*This document is the foundation for UI/UX design and starting product development.*
