#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up AI Knowledge Quiz...\n');

// Check if .env already exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists');
} else if (fs.existsSync(envExamplePath)) {
  // Copy env.example to .env
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ Created .env file from env.example');
} else {
  // Create basic .env file
  const envContent = `# AI Knowledge Quiz - Groq API Configuration
# Get your free API key from: https://console.groq.com/keys

# Groq API Configuration (FREE!)
# Groq offers free tier with fast inference - perfect for quiz generation
REACT_APP_GROQ_API_KEY=your_groq_api_key_here

# Optional: Custom model selection
# Available models: llama-3.1-70b-versatile (default), llama-3.1-8b-instant, mixtral-8x7b-32768
# REACT_APP_GROQ_MODEL=llama-3.1-70b-versatile

# Note: Without an API key, the app will use fallback questions for demonstration.
# Get your free API key at: https://console.groq.com/keys
`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file');
}

console.log('\n📝 Next steps:');
console.log('1. Run: npm install');
console.log('2. Get your free Groq API key from: https://console.groq.com/keys');
console.log('3. Add your API key to the .env file');
console.log('4. Run: npm start');
console.log('\n💡 Groq offers FREE tier with fast AI inference!');
console.log('💡 Without API key, the app uses fallback questions for demo.');
console.log('\n🔧 API Key Setup:');
console.log('   - Copy the .env file content');
console.log('   - Replace "your_groq_api_key_here" with your actual API key');
console.log('   - Make sure there are no extra spaces or quotes');
console.log('\n🎉 Setup complete!');
