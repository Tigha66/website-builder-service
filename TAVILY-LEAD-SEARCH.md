# 🔍 TAVILY LEAD SEARCH SYSTEM

## ✅ **API KEYS CONFIGURED:**
- Tavily API: `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`
- Firecrawl API: `fc-0b0956fb5cc040e0b0e3aa163230495b`

---

## 🎯 **HOW TO USE FOR LEAD GENERATION:**

### **Method 1: Use Tavily Skill**
```bash
cd /data/.openclaw/workspace/skills/tavily-search-1-0-0
# Use tavily skill to search for businesses
```

### **Method 2: Direct API Call**
```javascript
const tavily = require('tavily');
const client = new tavily.TavilyClient('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');

const results = await client.search('plumber Manchester small business', {
  max_results: 20,
  search_depth: 'basic'
});
```

### **Method 3: Use Firecrawl for Scraping**
```javascript
// Scrape business directories for contact info
const firecrawl = require('firecrawl');
const app = new firecrawl.FirecrawlApp({ apiKey: 'fc-0b0956fb5cc040e0b0e3aa163230495b' });

// Scrape Yell.com for plumbers
const scrape = await app.scrapeUrl('https://www.yell.com/s/plumbers+manchester.html');
```

---

## 📋 **SEARCH QUERIES TO USE:**

**For Plumbers:**
- "plumber Manchester no website"
- "emergency plumber Birmingham contact"
- "local plumber Leeds phone number"
- "plumbing services Sheffield email"

**For Electricians:**
- "electrician Manchester small business"
- "local electrician Birmingham contact"
- "electrical services Leeds phone"
- "emergency electrician Sheffield"

**For Roofers:**
- "roofer Manchester contact details"
- "roofing company Birmingham email"
- "local roofer Leeds phone"
- "roof repairs Sheffield contact"

---

## 🎯 **NEXT STEPS:**

1. Use Tavily to search for 100 businesses
2. Extract contact info from results
3. Update leads-100-uk.csv with real data
4. Rebuild websites with accurate info
5. Send personalized outreach emails

---

*API Keys Ready: March 18, 2026*  
*Status: ✅ READY FOR AUTOMATED LEAD GEN*
