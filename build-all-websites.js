#!/usr/bin/env node
/**
 * LeadFlow AI - Bulk Website Builder
 * Automatically generates premium websites from lead data
 */

const fs = require('fs').promises;
const path = require('path');

const LEADS_FILE = path.join(__dirname, 'leads', 'leads-final.csv');
const OUTPUT_DIR = path.join(__dirname, 'built-websites');
const TEMPLATE_DIR = path.join(__dirname, 'templates');

// Website templates by niche
const NICHE_TEMPLATES = {
  plumber: 'plumber-website',
  electrician: 'plumber-website', // Can customize later
  roofer: 'plumber-website',
  painter: 'plumber-website',
  landscaper: 'plumber-website',
  mechanic: 'plumber-website',
  dentist: 'plumber-website',
  vet: 'plumber-website',
  salon: 'plumber-website',
  restaurant: 'plumber-website'
};

async function ensureDirectories() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  console.log('✅ Output directory ready');
}

async function readLeads() {
  try {
    const csvData = await fs.readFile(LEADS_FILE, 'utf8');
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',');
    
    const leads = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length >= 3 && values[0]) {
        const lead = {};
        headers.forEach((header, index) => {
          lead[header.trim()] = values[index] ? values[index].trim() : '';
        });
        leads.push(lead);
      }
    }
    
    console.log(`✅ Loaded ${leads.length} leads`);
    return leads;
  } catch (error) {
    console.error('❌ Error reading leads file:', error.message);
    console.log('📋 Please create leads/leads-final.csv with your lead data');
    return [];
  }
}

async function copyTemplate(lead, outputDir) {
  const templateName = NICHE_TEMPLATES[lead.Niche?.toLowerCase()] || 'plumber-website';
  const templatePath = path.join(TEMPLATE_DIR, templateName);
  
  try {
    // Read template HTML
    const templateHTML = await fs.readFile(path.join(templatePath, 'index.html'), 'utf8');
    
    // Customize with lead's business info
    let customizedHTML = templateHTML
      .replace(/\[Business Name\]/g, lead['Business Name'] || 'Business Name')
      .replace(/\[City\]/g, lead.City || 'City')
      .replace(/01234 567 890/g, lead.Phone || '00000 000 000')
      .replace(/info@businessname\.co\.uk/g, lead.Email || 'info@business.com')
      .replace(/\[Nearby Town 1\]/g, lead.City || 'Town')
      .replace(/\[Nearby Town 2\]/g, lead.City || 'Town')
      .replace(/\[Nearby Town 3\]/g, lead.City || 'Town');
    
    // Write customized website
    await fs.writeFile(path.join(outputDir, 'index.html'), customizedHTML);
    
    console.log(`✅ Built website for ${lead['Business Name']}`);
    return true;
  } catch (error) {
    console.error(`❌ Error building website for ${lead['Business Name']}:`, error.message);
    return false;
  }
}

async function buildAllWebsites() {
  console.log('🚀 LeadFlow AI - Bulk Website Builder');
  console.log('='.repeat(60));
  
  await ensureDirectories();
  const leads = await readLeads();
  
  if (leads.length === 0) {
    console.log('\n⚠️  No leads found. Please add leads to leads/leads-final.csv');
    console.log('Use the template at leads/lead-research-template.csv');
    return;
  }
  
  let successCount = 0;
  let failCount = 0;
  
  for (const lead of leads) {
    const safeName = lead['Business Name'].replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const outputDir = path.join(OUTPUT_DIR, safeName);
    
    await fs.mkdir(outputDir, { recursive: true });
    
    const success = await copyTemplate(lead, outputDir);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ BUILD COMPLETE!');
  console.log(`📊 Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
  console.log('='.repeat(60));
  
  console.log('\n🚀 NEXT STEPS:');
  console.log('1. Review built websites in:', OUTPUT_DIR);
  console.log('2. Deploy each to here.now:');
  console.log('   cd built-websites/[business-name]');
  console.log('   bash ~/.openclaw/workspace/skills/here-now/scripts/publish.sh .');
  console.log('3. Send deployment link to client as proposal!');
}

// Run if executed directly
if (require.main === module) {
  buildAllWebsites()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Build failed:', error);
      process.exit(1);
    });
}

module.exports = { buildAllWebsites };
