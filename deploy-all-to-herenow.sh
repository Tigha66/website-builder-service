#!/bin/bash
# LeadFlow AI - Bulk Deploy to here.now
# Deploys all demo websites to here.now hosting

echo "🚀 LeadFlow AI - Bulk Deployment to here.now"
echo "=============================================="
echo ""

DEMO_DIR="/data/.openclaw/workspace/website-builder/demo-websites"
BUILT_DIR="/data/.openclaw/workspace/website-builder/built-websites"

deploy_directory() {
  local dir=$1
  local business_name=$(basename "$dir")
  
  echo "📦 Deploying: $business_name"
  cd "$dir"
  
  # Run here.now publish script
  bash ~/.openclaw/workspace/skills/here-now/scripts/publish.sh . --client openclaw 2>&1 | grep "https://"
  
  echo "✅ Deployed: $business_name"
  echo ""
}

echo "Deploying demo websites..."
echo ""

for dir in "$DEMO_DIR"/*/; do
  if [ -d "$dir" ]; then
    deploy_directory "$dir"
  fi
done

echo ""
echo "Deploying built client websites..."
echo ""

if [ -d "$BUILT_DIR" ]; then
  for dir in "$BUILT_DIR"/*/; do
    if [ -d "$dir" ]; then
      deploy_directory "$dir"
    fi
  done
else
  echo "⚠️  No built-websites directory found yet"
fi

echo ""
echo "=============================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=============================================="
echo ""
echo "📋 Next Steps:"
echo "1. Check the deployment URLs above"
echo "2. Save URLs to leads spreadsheet"
echo "3. Send personalized emails to each business with their demo website"
echo ""
echo "Email template:"
echo "---"
echo "Subject: I made a website for [Business Name]"
echo ""
echo "Hi [Owner Name],"
echo ""
echo "I noticed [Business Name] doesn't have a proper website yet, so I took"
echo "the liberty of creating a demo to show you what's possible:"
echo ""
echo "👉 [DEMO_URL]"
echo ""
echo "This is a fully functional, modern website that would:"
echo "✅ Make you look more professional"
echo "✅ Bring in more qualified leads"
echo "✅ Work perfectly on mobile"
echo ""
echo "I can build you a custom version like this in 7-14 days."
echo "Interested in seeing what a personalized version would look like?"
echo ""
echo "Best,"
echo "[Your Name]"
echo "---"
