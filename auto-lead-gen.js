#!/usr/bin/env node
/**
 * Automated Lead Generation System
 * Uses Tavily + Firecrawl to find and score business leads
 */

const fs = require('fs').promises;
const path = require('path');

// API Keys
const TAVILY_API_KEY = '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';
const FIRECRAWL_API_KEY = 'fc-0b0956fb5cc040e0b0e3aa163230495b';

// Output file
const LEADS_CSV = path.join(__dirname, 'leads', 'auto-generated-leads.csv');

/**
 * Search for businesses using Tavily
 */
async function searchBusinesses(query, maxResults = 20) {
  console.log(`🔍 Searching: ${query}`);
  
  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TAVILY_API_KEY}`
      },
      body: JSON.stringify({
        query: query,
        max_results: maxResults,
        search_depth: 'basic',
        include_domains: ['yell.com', 'yelp.com', 'google.com', 'facebook.com']
      })
    });
    
    const data = await response.json();
    console.log(`✅ Found ${data.results?.length || 0} results`);
    return data.results || [];
  } catch (error) {
    console.error('❌ Tavily search error:', error.message);
    return [];
  }
}

/**
 * Crawl business website using Firecrawl
 */
async function crawlWebsite(url) {
  console.log(`🕷️  Crawling: ${url}`);
  
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`
      },
      body: JSON.stringify({
        url: url,
        formats: ['markdown'],
        onlyMainContent: true
      })
    });
    
    const data = await response.json();
    
    // Extract emails from content
    const emails = extractEmails(data.data?.markdown || '');
    const hasContactForm = data.data?.markdown?.includes('contact form') || 
                           data.data?.markdown?.includes('contact us');
    const hasChatbot = data.data?.markdown?.includes('chat') || 
                       data.data?.markdown?.includes('live chat');
    const hasBooking = data.data?.markdown?.includes('book') || 
                       data.data?.markdown?.includes('appointment');
    
    console.log(`   📧 Emails: ${emails.length}, Form: ${hasContactForm}, Chat: ${hasChatbot}`);
    
    return {
      emails,
      hasContactForm,
      hasChatbot,
      hasBooking,
      content: data.data?.markdown || ''
    };
  } catch (error) {
    console.error('❌ Firecrawl error:', error.message);
    return {
      emails: [],
      hasContactForm: false,
      hasChatbot: false,
      hasBooking: false,
      content: ''
    };
  }
}

/**
 * Extract emails from text
 */
function extractEmails(text) {
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
  const matches = text.match(emailRegex);
  return matches ? [...new Set(matches)] : [];
}

/**
 * Score lead opportunity 1-10
 */
function scoreLead(websiteData, rating = 0, reviewCount = 0) {
  let score = 5; // Base score
  
  // No website = high opportunity
  if (!websiteData) return 8;
  
  // No email found = higher score (harder to contact)
  if (websiteData.emails.length === 0) score += 1;
  
  // No contact form = higher score
  if (!websiteData.hasContactForm) score += 1;
  
  // No chatbot = opportunity for AI chat
  if (!websiteData.hasChatbot) score += 1;
  
  // No booking system = opportunity
  if (!websiteData.hasBooking) score += 1;
  
  // High rating + low reviews = untapped potential
  if (rating >= 4.5 && reviewCount < 20) score += 1;
  
  // Cap at 10
  return Math.min(score, 10);
}

/**
 * Generate personalized outreach email
 */
function generateOutreach(leadName, websiteData, score, service) {
  const gaps = [];
  
  if (!websiteData || !websiteData.hasChatbot) gaps.push('24/7 AI chat support');
  if (!websiteData || !websiteData.hasBooking) gaps.push('online booking system');
  if (!websiteData || websiteData.emails.length === 0) gaps.push('easy contact options');
  
  const gapText = gaps.slice(0, 2).join(' and ');
  
  return `Subject: Quick question about ${leadName}'s website

Hi ${leadName} team,

I was searching for ${service} in the area and came across your website.

I noticed you don't have ${gapText} - adding these could help you capture more leads and convert more visitors into customers.

I specialize in helping ${service} businesses modernize their online presence. Recent client saw 40% more inquiries after adding AI chat + online booking.

Worth a quick 10-minute chat to see if this could work for ${leadName}?

Best,
[Your Name]
[Your Phone]
[Your Website]

P.S. I'm offering free website audits this week - happy to show you specific opportunities on your site.`;
}

/**
 * Main lead generation function
 */
async function generateLeads(service, location, count = 20) {
  console.log('🚀 Lead Generation System Starting...');
  console.log(`📍 Target: ${count} ${service} in ${location}`);
  console.log('='.repeat(60));
  
  const leads = [];
  
  // Step 1: Search for businesses
  const searchQuery = `${service} ${location} contact phone email`;
  const searchResults = await searchBusinesses(searchQuery, count * 2);
  
  // Step 2: Process each result
  for (let i = 0; i < Math.min(searchResults.length, count); i++) {
    const result = searchResults[i];
    console.log(`\n📋 Processing ${i + 1}/${count}: ${result.title}`);
    
    // Extract business info from search result
    const businessName = result.title;
    const url = result.url;
    const snippet = result.content || '';
    
    // Extract phone from snippet
    const phoneMatch = snippet.match(/(\d[\d\s-]{9,}\d)/);
    const phone = phoneMatch ? phoneMatch[1] : 'Not found';
    
    // Crawl website if available
    let websiteData = null;
    if (url && !url.includes('facebook') && !url.includes('yelp')) {
      websiteData = await crawlWebsite(url);
    }
    
    // Score the lead
    const score = scoreLead(websiteData, 4.5, 10);
    
    // Generate outreach
    const outreach = generateOutreach(businessName, websiteData, score, service);
    
    // Add to leads
    leads.push({
      companyName: businessName,
      website: url || 'No website',
      phone: phone,
      email: websiteData?.emails?.[0] || 'No email on site',
      allEmails: websiteData?.emails?.join('; ') || 'No email on site',
      hasContactForm: websiteData?.hasContactForm ? 'Yes' : 'No',
      hasChatbot: websiteData?.hasChatbot ? 'Yes' : 'No',
      hasBooking: websiteData?.hasBooking ? 'Yes' : 'No',
      opportunityScore: score,
      outreach: outreach.replace(/\n/g, '\\n')
    });
  }
  
  // Step 3: Save to CSV
  await saveToCSV(leads);
  
  // Step 4: Summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ LEAD GENERATION COMPLETE!');
  console.log(`📊 Total Leads: ${leads.length}`);
  console.log(`📧 With Email: ${leads.filter(l => l.email !== 'No email on site').length}`);
  console.log(`📝 Contact Form Only: ${leads.filter(l => l.email === 'No email on site').length}`);
  console.log(`⭐ Top Score: ${Math.max(...leads.map(l => l.opportunityScore))}/10`);
  console.log(`📁 Output: ${LEADS_CSV}`);
  console.log('='.repeat(60));
  
  // Show top 3 opportunities
  console.log('\n🏆 TOP 3 OPPORTUNITIES:');
  leads
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
    .slice(0, 3)
    .forEach((lead, i) => {
      console.log(`${i + 1}. ${lead.companyName} (Score: ${lead.opportunityScore}/10)`);
    });
}

/**
 * Save leads to CSV
 */
async function saveToCSV(leads) {
  const headers = [
    'Company Name',
    'Website',
    'Phone',
    'Email',
    'All Emails',
    'Has Contact Form',
    'Has Chatbot',
    'Has Booking',
    'Opportunity Score',
    'Outreach Draft'
  ];
  
  const csvContent = [
    headers.join(','),
    ...leads.map(lead => 
      [
        `"${lead.companyName}"`,
        `"${lead.website}"`,
        `"${lead.phone}"`,
        `"${lead.email}"`,
        `"${lead.allEmails}"`,
        `"${lead.hasContactForm}"`,
        `"${lead.hasChatbot}"`,
        `"${lead.hasBooking}"`,
        lead.opportunityScore,
        `"${lead.outreach}"`
      ].join(',')
    )
  ].join('\n');
  
  await fs.writeFile(LEADS_CSV, csvContent);
  console.log(`💾 Saved to: ${LEADS_CSV}`);
}

// Run if executed directly
if (require.main === module) {
  // Example: Find 20 plumbers in Manchester
  generateLeads('plumbers', 'Manchester UK', 20)
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Lead gen failed:', error);
      process.exit(1);
    });
}

module.exports = { generateLeads };
