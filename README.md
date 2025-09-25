# AI-Assisted Knowledge Quiz

A modern, interactive quiz application powered by AI that generates personalized questions and feedback across multiple topics.

## 🚀 Project Setup & Demo

### Web Application
```bash
# Quick setup (recommended)
npm run setup

# Or manual setup:
# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env and add your OpenAI API key

# Start development server
npm start

# Build for production
npm run build
```

The application will be available at `http://localhost:3000`

### Environment Setup
1. Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```
2. Get your free Groq API key from [Groq Console](https://console.groq.com/keys)
3. Edit the `.env` file and replace `your_groq_api_key_here` with your actual API key:
   ```
   REACT_APP_GROQ_API_KEY=your_actual_api_key_here
   REACT_APP_GROQ_MODEL=llama-3.1-8b-instant
   ```

**Note**: Without an API key, the app will use fallback questions for demonstration purposes. Groq offers a generous free tier with fast inference!

### AI Features
- **Real AI Generation**: Uses Groq's fast inference API for truly dynamic questions
- **Free Tier**: Groq offers generous free usage with no credit card required
- **Dynamic Question Generation**: Each quiz generates completely unique questions using AI
- **Personalized Feedback**: AI creates custom feedback based on your performance and topic
- **Fast Inference**: Groq's optimized models provide quick responses
- **Fallback System**: Graceful degradation to curated questions if API is unavailable
- **Multiple Models**: Support for different Groq models (Llama, Mixtral)

### Demo
- **Live Demo**: [Deploy to Vercel/Netlify for live demo]
- **Screen Recording**: [Demo Video](./20250925-0807-24.7581634.mp4) - Complete walkthrough showing all 4 screens: topic selection → loading → quiz → results
- **Local Demo**: Run `npm start` and visit `http://localhost:3000`

## 📋 Problem Understanding

This application addresses the need for an engaging, AI-powered quiz experience that:

1. **Generates Dynamic Content**: Uses AI to create quiz questions and personalized feedback
2. **Provides Smooth UX**: Features intuitive navigation, progress tracking, and responsive design
3. **Ensures Consistency**: Maintains reliable JSON output from AI prompts with proper error handling
4. **Offers Multiple Topics**: Covers diverse subjects including Wellness, Tech Trends, History, and Science

### Assumptions Made
- Users prefer immediate feedback with explanations
- Mobile-first responsive design is essential
- AI service should gracefully handle failures with fallback content
- Dark mode support enhances user experience

## 🤖 AI Prompts & Iterations

### Initial Prompt Design
```
Generate 5 unique, educational multiple choice questions about {topic}. 

Requirements:
- Questions should be engaging and test real knowledge
- Each question should have exactly 4 options (A, B, C, D)
- Include a brief explanation for the correct answer
- Vary the difficulty level (mix of easy, medium, and challenging)
- Make questions current and relevant
- Ensure correctAnswer is the index (0-3) of the correct option

Return ONLY a valid JSON object with this exact structure:
{
  "questions": [
    {
      "id": "1",
      "question": "Your question here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}
```

### Issues Faced & Refinements

1. **Inconsistent JSON Structure**
   - **Problem**: AI sometimes returned malformed JSON
   - **Solution**: Added comprehensive error handling and fallback to mock data
   - **Refined Prompt**: Added explicit structure requirements and validation

2. **Generic Feedback**
   - **Problem**: Initial feedback was too generic
   - **Solution**: Enhanced prompt to include score context and motivational elements
   - **Refined Prompt**: Added specific instructions for encouraging, constructive feedback

3. **Question Quality**
   - **Problem**: Some questions were too easy or poorly formatted
   - **Solution**: Added temperature control and more specific instructions
   - **Refined Prompt**: Specified educational value and difficulty requirements

### Final Optimized Prompts

**Quiz Generation:**
```
Generate 5 educational multiple choice questions about ${topic}. 
Questions should be:
- Educational and informative
- Well-formatted with clear options
- Appropriate difficulty level
- Include brief explanations

Return valid JSON with exact structure specified.
```

**Feedback Generation:**
```
Generate personalized feedback for quiz result:
Score: ${score}/${totalQuestions} (${percentage}%)
Topic: ${topic}

Provide encouraging, constructive feedback that:
1. Acknowledges performance level
2. Offers specific improvement advice
3. Motivates continued learning
4. Is 2-3 sentences long
```

## 🏗️ Architecture & Code Structure

### Project Structure
```
src/
├── components/           # React components
│   ├── TopicSelection.tsx    # Topic selection screen
│   ├── QuizInterface.tsx     # Interactive quiz interface
│   ├── ResultsScreen.tsx     # Results and feedback display
│   ├── ErrorBoundary.tsx     # Error boundary component
│   ├── ErrorDisplay.tsx      # Error notification component
│   └── DarkModeToggle.tsx    # Dark mode toggle
├── context/             # State management
│   └── QuizContext.tsx       # React Context for quiz state
├── services/            # External services
│   └── aiService.ts          # AI service integration
├── types/               # TypeScript definitions
│   └── index.ts              # Type definitions
├── data/                # Static data
│   └── topics.ts             # Available quiz topics
└── App.tsx              # Main application component
```

### State Management
- **React Context**: Centralized state management using `QuizContext`
- **useReducer**: Complex state updates with predictable actions
- **Local Storage**: Persists dark mode preference

### Key Components

#### `QuizContext.tsx`
- Manages entire quiz flow state
- Handles AI service integration
- Provides actions for navigation and quiz progression

#### `aiService.ts`
- Abstracts AI API calls
- Includes fallback mock data for development
- Handles error scenarios gracefully

#### `TopicSelection.tsx`
- Beautiful topic selection interface
- Animated cards with hover effects
- Loading states during AI generation

#### `QuizInterface.tsx`
- Interactive question display
- Progress tracking and navigation
- Real-time answer validation

#### `ResultsScreen.tsx`
- Score visualization with animations
- AI-generated personalized feedback
- Detailed question review

## 📱 Screenshots / Screen Recording

### Key Screens

1. **Topic Selection Screen**
   - Modern card-based layout
   - Animated topic selection
   - Dark mode toggle

2. **Quiz Interface**
   - Clean question display
   - Progress bar and navigation
   - Answer selection with visual feedback

3. **Results Screen**
   - Score visualization
   - AI-generated feedback
   - Detailed question review

4. **Loading States**
   - Smooth loading animations
   - Progress indicators
   - Error handling

### Mobile Responsiveness
- Fully responsive design
- Touch-friendly interactions
- Optimized for mobile devices

## 🐛 Known Issues / Improvements

### Current Limitations
1. **API Key Required**: Needs Groq API key for real AI-generated questions
2. **Limited Topics**: Only 4 predefined topics available
3. **No User Accounts**: No progress tracking across sessions
4. **Basic Analytics**: Limited quiz performance analytics

### Potential Improvements

#### Short Term
- [ ] Add more quiz topics (Geography, Literature, Sports, etc.)
- [ ] Implement quiz difficulty levels
- [ ] Add sound effects and haptic feedback

#### Medium Term
- [ ] User authentication and progress tracking
- [ ] Quiz history and statistics
- [ ] Social sharing and leaderboards
- [ ] Offline mode with cached questions

#### Long Term
- [ ] Adaptive learning algorithms
- [ ] Personalized question recommendations
- [ ] Multiplayer quiz modes
- [ ] Advanced analytics dashboard

### Technical Debt
- [ ] Add comprehensive unit tests
- [ ] Implement E2E testing with Cypress
- [ ] Add performance monitoring
- [ ] Optimize bundle size

## ✨ Bonus Work

### Extra Features Added

1. **Dark Mode Support**
   - System preference detection
   - Smooth theme transitions
   - Persistent user preference

2. **Advanced Animations**
   - Framer Motion integration
   - Smooth page transitions
   - Micro-interactions and hover effects

3. **Error Handling**
   - Comprehensive error boundaries
   - User-friendly error messages
   - Retry mechanisms

4. **Accessibility**
   - ARIA labels and roles
   - Keyboard navigation support
   - Screen reader compatibility

5. **Performance Optimizations**
   - Lazy loading components
   - Optimized animations
   - Efficient state management

6. **Modern UI/UX**
   - Gradient backgrounds
   - Glass morphism effects
   - Responsive typography
   - Loading skeletons

### Code Quality Features
- TypeScript for type safety
- ESLint and Prettier configuration
- Modular component architecture
- Comprehensive error handling
- Clean separation of concerns

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **State Management**: React Context + useReducer
- **Icons**: Lucide React
- **Build Tool**: Create React App
- **Deployment**: Ready for Vercel/Netlify



#   P l u m - A s s i g n m e n t 
 
 #   P l u m - A s s i g n m e n t 
 
 #   P l u m - A s s i g n m e n t  
 #   P l u m - A s s i g n m e n t  
 