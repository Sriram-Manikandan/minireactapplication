# DSA Pattern Identifier

## The Problem
Every time I opened a new LeetCode problem, I spent 10–15 minutes just figuring 
out which pattern applied — Sliding Window? Two Pointers? BFS? DP? By the time 
I identified it, I had lost momentum and wasted time I could have spent actually 
solving. This is a problem every CS student hits repeatedly. I built a tool where 
you paste the problem statement and instantly get the pattern, why it fits, and 
exactly how to start.

## What It Does
User pastes a DSA problem statement → GPT-4o-mini identifies the pattern, 
explains why it fits, and gives 3 bullet points on how to begin → User starts 
coding with clarity instead of confusion.

## AI Integration
**API:** OpenRouter  
**Model:** openai/gpt-4o-mini  
**Location:** `backend/server.js` → `/generate` route  
**What the AI does:** Reads a problem statement and returns the matching DSA 
pattern, the reasoning behind it, and a starting approach.

## What I Intentionally Excluded
- **No user accounts or history** — the tool works per session. Adding auth and 
  a database would triple the build time and the core value doesn't require saving 
  past results.
- **No solution code generation** — the goal is pattern recognition, not giving 
  away answers. Generating full solutions would defeat the learning purpose.
- **No difficulty rating** — classifying Easy/Medium/Hard requires a separate 
  model fine-tune or a curated dataset; out of scope for this version.

## Monthly Cost Calculation
Model: openai/gpt-4o-mini  
Input rate: $0.15 per 1M tokens  
Output rate: $0.60 per 1M tokens  
Avg tokens per call: ~600 input + ~300 output  
Cost per call: (600/1,000,000 × $0.15) + (300/1,000,000 × $0.60)  
             = $0.000090 + $0.000180  
             = $0.000270  
Expected calls/month: 200  
**Monthly total: 200 × $0.000270 = $0.054 (~$0.05/month)**

## Live Deployment
**Frontend:** [your Netlify URL here]  
**Backend:** [your Render URL here]