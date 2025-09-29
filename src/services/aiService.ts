import { QuizQuestion, QuizData } from '../types';

// AI service with Groq API integration for real AI-generated questions
class AIService {
  private readonly GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
  private readonly API_KEY = process.env.REACT_APP_GROQ_API_KEY;
  private readonly MODEL = process.env.REACT_APP_GROQ_MODEL || 'llama-3.1-8b-instant'; // Fast and capable model
  private readonly MAX_RETRIES = 3;

  async generateQuizQuestions(topic: string): Promise<QuizData> {
    // Check if API key is available
    if (!this.API_KEY || this.API_KEY === 'your_groq_api_key_here') {
      console.warn('Groq API key not configured. Using fallback questions for demonstration.');
      console.info('To use real AI generation, get a free API key from: https://console.groq.com/keys');
      return this.getFallbackQuestions(topic);
    }

    try {
      const questions = await this.generateAIQuestions(topic);
      return {
        topic,
        questions
      };
    } catch (error) {
      console.error('Failed to generate questions with Groq AI:', error);
      
      // Provide specific error guidance
      if (error instanceof Error && error.message.includes('401')) {
        console.error('API Key Error: Please check your Groq API key in the .env file');
        console.info('Get your free API key from: https://console.groq.com/keys');
      }
      
      // Fallback to dynamic questions if AI fails
      return this.getFallbackQuestions(topic);
    }
  }

  async generateFeedback(score: number, totalQuestions: number, topic: string): Promise<string> {
    // Check if API key is available
    if (!this.API_KEY || this.API_KEY === 'your_groq_api_key_here') {
      console.warn('Groq API key not configured. Using fallback feedback for demonstration.');
      const percentage = Math.round((score / totalQuestions) * 100);
      return this.generateDynamicFeedback(score, totalQuestions, percentage, topic);
    }

    try {
      const percentage = Math.round((score / totalQuestions) * 100);
      return await this.generateAIFeedback(score, totalQuestions, percentage, topic);
    } catch (error) {
      console.error('Failed to generate feedback with Groq AI:', error);
      
      // Provide specific error guidance
      if (error instanceof Error && error.message.includes('401')) {
        console.error('API Key Error: Please check your Groq API key in the .env file');
        console.info('Get your free API key from: https://console.groq.com/keys');
      }
      
      // Fallback to dynamic feedback
      const percentage = Math.round((score / totalQuestions) * 100);
      return this.generateDynamicFeedback(score, totalQuestions, percentage, topic);
    }
  }

  private async generateAIQuestions(topic: string): Promise<QuizQuestion[]> {
    const prompt = this.createQuestionPrompt(topic);
    
    const response = await fetch(this.GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.API_KEY}`
      },
      body: JSON.stringify({
        model: this.MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert quiz generator. Always return valid JSON with the exact structure requested. Never include any text outside the JSON object.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2000,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    // Parse and validate JSON response
    const quizData = JSON.parse(content);
    
    // Validate structure
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error('Invalid response structure: missing questions array');
    }

    if (quizData.questions.length !== 5) {
      throw new Error('Invalid response structure: expected exactly 5 questions');
    }

    // Validate each question
    for (let i = 0; i < quizData.questions.length; i++) {
      const question = quizData.questions[i];
      if (!question.question || !question.options || !Array.isArray(question.options) || 
          question.options.length !== 4 || typeof question.correctAnswer !== 'number' ||
          question.correctAnswer < 0 || question.correctAnswer > 3) {
        throw new Error(`Invalid question structure at index ${i}`);
      }
    }

    return quizData.questions;
  }

  private async generateAIFeedback(score: number, totalQuestions: number, percentage: number, topic: string): Promise<string> {
    const prompt = this.createFeedbackPrompt(score, totalQuestions, percentage, topic);
    
    const response = await fetch(this.GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.API_KEY}`
      },
      body: JSON.stringify({
        model: this.MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a supportive educational coach. Provide encouraging and constructive feedback. Be motivational and specific. Keep it concise (2-3 sentences).'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.9,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  private createQuestionPrompt(topic: string): string {
    return `Generate 5 unique, educational multiple choice questions about ${topic}. 

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

Do not include any text outside the JSON object.`;
  }

  private createFeedbackPrompt(score: number, totalQuestions: number, percentage: number, topic: string): string {
    const performanceLevel = this.getPerformanceLevel(percentage);
    return `Generate personalized, encouraging feedback for a quiz result.

Quiz Details:
- Topic: ${topic}
- Score: ${score}/${totalQuestions} (${percentage}%)
- Performance Level: ${performanceLevel}

Requirements:
- Be encouraging and motivational
- Acknowledge their specific performance level
- Provide constructive advice for improvement
- Keep it concise (2-3 sentences)
- Make it feel personal and supportive

Generate feedback that will motivate continued learning.`;
  }

  private generateDynamicQuestions(topic: string): QuizQuestion[] {
    // Get all available questions for the topic
    const allQuestions = this.getAllQuestionsForTopic(topic);
    
    // Create a more sophisticated randomization system
    const questions: QuizQuestion[] = [];
    const usedIndices = new Set<number>();
    
    // Generate 5 unique questions with advanced randomization
    for (let i = 0; i < 5; i++) {
      let randomIndex: number;
      let attempts = 0;
      
      // Ensure we get unique questions
      do {
        randomIndex = Math.floor(Math.random() * allQuestions.length);
        attempts++;
      } while (usedIndices.has(randomIndex) && attempts < 20);
      
      usedIndices.add(randomIndex);
      
      // Get the base question
      const baseQuestion = allQuestions[randomIndex];
      
      // Create a dynamic version with variations
      const dynamicQuestion = this.createDynamicQuestion(baseQuestion, i + 1, topic);
      questions.push(dynamicQuestion);
    }
    
    return questions;
  }

  private createDynamicQuestion(baseQuestion: any, questionId: number, topic: string): QuizQuestion {
    // Create variations in question presentation while maintaining accuracy
    const variations = this.getQuestionVariations(baseQuestion, topic);
    const selectedVariation = variations[Math.floor(Math.random() * variations.length)];
    
    return {
      id: questionId.toString(),
      question: selectedVariation.question,
      options: selectedVariation.options,
      correctAnswer: selectedVariation.correctAnswer,
      explanation: selectedVariation.explanation
    };
  }

  private getQuestionVariations(baseQuestion: any, topic: string): any[] {
    // Create multiple variations of the same question for more dynamic experience
    const variations = [baseQuestion];
    
    // Add some variations based on topic
    if (topic.toLowerCase() === 'wellness') {
      variations.push({
        ...baseQuestion,
        question: baseQuestion.question.replace('What is', 'Which of the following is'),
        explanation: baseQuestion.explanation + ' This is an important aspect of maintaining good health.'
      });
    } else if (topic.toLowerCase() === 'tech-trends') {
      variations.push({
        ...baseQuestion,
        question: baseQuestion.question.replace('What', 'In technology, what'),
        explanation: baseQuestion.explanation + ' This technology is rapidly evolving and impacting our daily lives.'
      });
    } else if (topic.toLowerCase() === 'history') {
      variations.push({
        ...baseQuestion,
        question: baseQuestion.question.replace('Who', 'In history, who'),
        explanation: baseQuestion.explanation + ' This historical event shaped the course of human civilization.'
      });
    } else if (topic.toLowerCase() === 'science') {
      variations.push({
        ...baseQuestion,
        question: baseQuestion.question.replace('What', 'In science, what'),
        explanation: baseQuestion.explanation + ' This scientific principle is fundamental to understanding our world.'
      });
    }
    
    return variations;
  }

  private generateDynamicFeedback(score: number, totalQuestions: number, percentage: number, topic: string): string {
    // Create personalized feedback based on performance and topic
    const performanceLevel = this.getPerformanceLevel(percentage);
    const topicContext = this.getTopicContext(topic);
    
    // Generate multiple feedback variations and select one randomly
    const feedbackTemplates = this.getFeedbackTemplates(performanceLevel, topicContext);
    const selectedTemplate = feedbackTemplates[Math.floor(Math.random() * feedbackTemplates.length)];
    
    // Personalize the feedback
    return selectedTemplate
      .replace('{score}', score.toString())
      .replace('{total}', totalQuestions.toString())
      .replace('{percentage}', percentage.toString())
      .replace('{topic}', topic)
      .replace('{performance}', performanceLevel);
  }

  private getTopicContext(topic: string): string {
    const contexts = {
      'wellness': 'health and well-being',
      'tech-trends': 'technology and innovation',
      'history': 'historical knowledge',
      'science': 'scientific understanding'
    };
    return contexts[topic.toLowerCase() as keyof typeof contexts] || 'general knowledge';
  }

  private getFeedbackTemplates(performanceLevel: string, topicContext: string): string[] {
    const templates = {
      'Excellent': [
        `Outstanding work! You scored {score}/{total} ({percentage}%) on the {topic} quiz. Your knowledge of ${topicContext} is exceptional and shows deep understanding. Keep up the excellent work!`,
        `Fantastic performance! {percentage}% on {topic} demonstrates your mastery of ${topicContext}. You clearly have a strong foundation in this area. Continue exploring and learning!`,
        `Brilliant results! Your {score}/{total} score in {topic} shows excellent comprehension of ${topicContext}. Your dedication to learning is truly impressive!`
      ],
      'Very Good': [
        `Great job! You scored {score}/{total} ({percentage}%) on the {topic} quiz. You have a solid understanding of ${topicContext} with just a few areas to explore further.`,
        `Well done! Your {percentage}% performance in {topic} shows good knowledge of ${topicContext}. You're on the right track - keep learning and growing!`,
        `Excellent effort! {score}/{total} in {topic} demonstrates strong understanding of ${topicContext}. A few more study sessions and you'll master this topic!`
      ],
      'Good': [
        `Good work! You scored {score}/{total} ({percentage}%) on the {topic} quiz. You have a decent grasp of ${topicContext}, but there's room for improvement.`,
        `Not bad! Your {percentage}% in {topic} shows you understand the basics of ${topicContext}. Consider reviewing the topics you missed to strengthen your knowledge.`,
        `Solid effort! {score}/{total} in {topic} indicates you're learning about ${topicContext}. Keep studying and you'll see great improvement!`
      ],
      'Fair': [
        `Keep learning! You scored {score}/{total} ({percentage}%) on the {topic} quiz. You have some knowledge of ${topicContext}, but there are several areas to focus on.`,
        `Room for improvement! Your {percentage}% in {topic} shows you're starting to understand ${topicContext}. Take time to review and study more.`,
        `Don't give up! {score}/{total} in {topic} means you're building your knowledge of ${topicContext}. Every expert was once a beginner!`
      ],
      'Needs Improvement': [
        `Keep going! You scored {score}/{total} ({percentage}%) on the {topic} quiz. While this shows you have some knowledge gaps in ${topicContext}, it's a great starting point for learning.`,
        `Learning opportunity! Your {percentage}% in {topic} indicates areas to focus on in ${topicContext}. This is your chance to dive deeper and expand your understanding.`,
        `Every journey begins with a step! {score}/{total} in {topic} shows you're beginning to explore ${topicContext}. Keep studying and you'll see amazing progress!`
      ]
    };
    
    return templates[performanceLevel as keyof typeof templates] || templates['Good'];
  }


  private getPerformanceLevel(percentage: number): string {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Very Good';
    if (percentage >= 70) return 'Good';
    if (percentage >= 60) return 'Fair';
    return 'Needs Improvement';
  }

  private getFallbackQuestions(topic: string): QuizData {
    // Use mock data as fallback
    const mockQuestions: QuizQuestion[] = this.getMockQuestions(topic);
    
    return {
      topic,
      questions: mockQuestions
    };
  }


  private getAllQuestionsForTopic(topic: string): any[] {
    const questionPools = {
      'wellness': [
        {
          question: 'What is the recommended daily water intake for adults?',
          options: ['6-8 glasses', '10-12 glasses', '4-6 glasses', '8-10 glasses'],
          correctAnswer: 0,
          explanation: 'The general recommendation is 6-8 glasses (8 ounces each) of water per day.'
        },
        {
          question: 'Which vitamin is primarily obtained from sunlight exposure?',
          options: ['Vitamin A', 'Vitamin C', 'Vitamin D', 'Vitamin E'],
          correctAnswer: 2,
          explanation: 'Vitamin D is synthesized in the skin when exposed to UVB rays from sunlight.'
        },
        {
          question: 'What is the recommended amount of sleep for adults?',
          options: ['6-7 hours', '7-9 hours', '9-10 hours', '5-6 hours'],
          correctAnswer: 1,
          explanation: 'Adults should aim for 7-9 hours of quality sleep per night.'
        },
        {
          question: 'Which exercise is best for cardiovascular health?',
          options: ['Weight lifting', 'Aerobic exercise', 'Yoga', 'Stretching'],
          correctAnswer: 1,
          explanation: 'Aerobic exercise strengthens the heart and improves cardiovascular fitness.'
        },
        {
          question: 'What percentage of your plate should be vegetables?',
          options: ['25%', '50%', '75%', '100%'],
          correctAnswer: 1,
          explanation: 'Half your plate should be filled with vegetables for optimal nutrition.'
        },
        {
          question: 'What is the maximum recommended daily sugar intake for adults?',
          options: ['25g', '50g', '75g', '100g'],
          correctAnswer: 1,
          explanation: 'WHO recommends limiting free sugars to less than 50g per day.'
        },
        {
          question: 'Which type of fat is considered heart-healthy?',
          options: ['Saturated fat', 'Trans fat', 'Monounsaturated fat', 'All fats'],
          correctAnswer: 2,
          explanation: 'Monounsaturated fats help reduce bad cholesterol levels.'
        },
        {
          question: 'How often should adults engage in moderate exercise?',
          options: ['Once a week', '2-3 times a week', '5 times a week', 'Daily'],
          correctAnswer: 2,
          explanation: 'Adults should aim for at least 150 minutes of moderate exercise per week.'
        }
      ],
      'tech-trends': [
        {
          question: 'What does AI stand for?',
          options: ['Automated Intelligence', 'Artificial Intelligence', 'Advanced Integration', 'Algorithmic Intelligence'],
          correctAnswer: 1,
          explanation: 'AI stands for Artificial Intelligence - the simulation of human intelligence in machines.'
        },
        {
          question: 'Which technology is primarily associated with blockchain?',
          options: ['Machine Learning', 'Cryptocurrency', 'Virtual Reality', 'Cloud Computing'],
          correctAnswer: 1,
          explanation: 'Blockchain technology is the foundation of cryptocurrencies like Bitcoin.'
        },
        {
          question: 'What is the main benefit of cloud computing?',
          options: ['Faster processing', 'Scalability', 'Better graphics', 'Lower cost'],
          correctAnswer: 1,
          explanation: 'Cloud computing provides scalable and flexible computing resources on demand.'
        },
        {
          question: 'Which programming language is most popular for data science?',
          options: ['Java', 'Python', 'C++', 'JavaScript'],
          correctAnswer: 1,
          explanation: 'Python is widely used in data science due to its extensive libraries and ease of use.'
        },
        {
          question: 'What does IoT stand for?',
          options: ['Internet of Things', 'Integration of Technology', 'Intelligent Operations', 'Internet Operations'],
          correctAnswer: 0,
          explanation: 'IoT stands for Internet of Things - the network of connected devices and objects.'
        },
        {
          question: 'What is machine learning?',
          options: ['Manual programming', 'Learning from data', 'Hardware optimization', 'Network protocols'],
          correctAnswer: 1,
          explanation: 'Machine learning is a subset of AI that learns patterns from data.'
        },
        {
          question: 'Which company developed ChatGPT?',
          options: ['Google', 'Microsoft', 'OpenAI', 'Meta'],
          correctAnswer: 2,
          explanation: 'ChatGPT was developed by OpenAI, an AI research company.'
        },
        {
          question: 'What is 5G technology?',
          options: ['5th generation wireless', '5 gigabytes speed', '5G network protocol', '5G processor'],
          correctAnswer: 0,
          explanation: '5G is the fifth generation of wireless technology for cellular networks.'
        }
      ],
      'history': [
        {
          question: 'In which year did World War II end?',
          options: ['1944', '1945', '1946', '1947'],
          correctAnswer: 1,
          explanation: 'World War II ended in 1945 with the surrender of Japan.'
        },
        {
          question: 'Who was the first person to walk on the moon?',
          options: ['Buzz Aldrin', 'Neil Armstrong', 'John Glenn', 'Alan Shepard'],
          correctAnswer: 1,
          explanation: 'Neil Armstrong was the first person to walk on the moon in 1969.'
        },
        {
          question: 'Which ancient wonder of the world was located in Egypt?',
          options: ['Hanging Gardens', 'Colossus of Rhodes', 'Great Pyramid', 'Lighthouse of Alexandria'],
          correctAnswer: 2,
          explanation: 'The Great Pyramid of Giza is the only surviving ancient wonder and is located in Egypt.'
        },
        {
          question: 'When did the Renaissance period begin?',
          options: ['14th century', '15th century', '16th century', '17th century'],
          correctAnswer: 0,
          explanation: 'The Renaissance began in the 14th century in Italy.'
        },
        {
          question: 'Who painted the Mona Lisa?',
          options: ['Michelangelo', 'Raphael', 'Leonardo da Vinci', 'Donatello'],
          correctAnswer: 2,
          explanation: 'Leonardo da Vinci painted the Mona Lisa in the early 16th century.'
        },
        {
          question: 'Which empire was ruled by Julius Caesar?',
          options: ['Greek Empire', 'Roman Empire', 'Byzantine Empire', 'Persian Empire'],
          correctAnswer: 1,
          explanation: 'Julius Caesar was a Roman general and statesman who played a critical role in the Roman Republic.'
        },
        {
          question: 'When did the Berlin Wall fall?',
          options: ['1987', '1989', '1991', '1993'],
          correctAnswer: 1,
          explanation: 'The Berlin Wall fell on November 9, 1989, marking the end of the Cold War.'
        },
        {
          question: 'Who was the first President of the United States?',
          options: ['John Adams', 'Thomas Jefferson', 'George Washington', 'Benjamin Franklin'],
          correctAnswer: 2,
          explanation: 'George Washington was the first President of the United States, serving from 1789 to 1797.'
        }
      ],
      'science': [
        {
          question: 'What is the chemical symbol for gold?',
          options: ['Go', 'Gd', 'Au', 'Ag'],
          correctAnswer: 2,
          explanation: 'Au is the chemical symbol for gold, derived from the Latin word "aurum".'
        },
        {
          question: 'Which planet is closest to the Sun?',
          options: ['Venus', 'Mercury', 'Earth', 'Mars'],
          correctAnswer: 1,
          explanation: 'Mercury is the closest planet to the Sun in our solar system.'
        },
        {
          question: 'What is the speed of light in a vacuum?',
          options: ['300,000 km/s', '150,000 km/s', '450,000 km/s', '600,000 km/s'],
          correctAnswer: 0,
          explanation: 'The speed of light in a vacuum is approximately 300,000 kilometers per second.'
        },
        {
          question: 'Which gas makes up most of Earth\'s atmosphere?',
          options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'],
          correctAnswer: 2,
          explanation: 'Nitrogen makes up about 78% of Earth\'s atmosphere.'
        },
        {
          question: 'What is the smallest unit of matter?',
          options: ['Molecule', 'Atom', 'Electron', 'Proton'],
          correctAnswer: 1,
          explanation: 'An atom is the smallest unit of matter that retains the properties of an element.'
        },
        {
          question: 'What is the formula for water?',
          options: ['H2O', 'CO2', 'NaCl', 'O2'],
          correctAnswer: 0,
          explanation: 'Water is composed of two hydrogen atoms and one oxygen atom (H2O).'
        },
        {
          question: 'Which force keeps planets in orbit around the Sun?',
          options: ['Magnetic force', 'Gravitational force', 'Electric force', 'Nuclear force'],
          correctAnswer: 1,
          explanation: 'Gravitational force between the Sun and planets keeps them in orbit.'
        },
        {
          question: 'What is the process by which plants make food?',
          options: ['Respiration', 'Photosynthesis', 'Digestion', 'Fermentation'],
          correctAnswer: 1,
          explanation: 'Photosynthesis is the process by which plants convert sunlight into energy.'
        }
      ]
    };
    
    return questionPools[topic.toLowerCase() as keyof typeof questionPools] || questionPools['wellness'];
  }

  private getMockQuestions(topic: string): QuizQuestion[] {
    const questionSets: Record<string, QuizQuestion[]> = {
      'wellness': [
        {
          id: '1',
          question: 'What is the recommended daily water intake for adults?',
          options: ['6-8 glasses', '10-12 glasses', '4-6 glasses', '8-10 glasses'],
          correctAnswer: 0,
          explanation: 'The general recommendation is 6-8 glasses (8 ounces each) of water per day.'
        },
        {
          id: '2',
          question: 'Which vitamin is primarily obtained from sunlight exposure?',
          options: ['Vitamin A', 'Vitamin C', 'Vitamin D', 'Vitamin E'],
          correctAnswer: 2,
          explanation: 'Vitamin D is synthesized in the skin when exposed to UVB rays from sunlight.'
        },
        {
          id: '3',
          question: 'What is the recommended amount of sleep for adults?',
          options: ['6-7 hours', '7-9 hours', '9-10 hours', '5-6 hours'],
          correctAnswer: 1,
          explanation: 'Adults should aim for 7-9 hours of quality sleep per night.'
        },
        {
          id: '4',
          question: 'Which exercise is best for cardiovascular health?',
          options: ['Weight lifting', 'Aerobic exercise', 'Yoga', 'Stretching'],
          correctAnswer: 1,
          explanation: 'Aerobic exercise strengthens the heart and improves cardiovascular fitness.'
        },
        {
          id: '5',
          question: 'What percentage of your plate should be vegetables?',
          options: ['25%', '50%', '75%', '100%'],
          correctAnswer: 1,
          explanation: 'Half your plate should be filled with vegetables for optimal nutrition.'
        }
      ],
      'tech-trends': [
        {
          id: '1',
          question: 'What does AI stand for?',
          options: ['Automated Intelligence', 'Artificial Intelligence', 'Advanced Integration', 'Algorithmic Intelligence'],
          correctAnswer: 1,
          explanation: 'AI stands for Artificial Intelligence - the simulation of human intelligence in machines.'
        },
        {
          id: '2',
          question: 'Which technology is primarily associated with blockchain?',
          options: ['Machine Learning', 'Cryptocurrency', 'Virtual Reality', 'Cloud Computing'],
          correctAnswer: 1,
          explanation: 'Blockchain technology is the foundation of cryptocurrencies like Bitcoin.'
        },
        {
          id: '3',
          question: 'What is the main benefit of cloud computing?',
          options: ['Faster processing', 'Scalability', 'Better graphics', 'Lower cost'],
          correctAnswer: 1,
          explanation: 'Cloud computing provides scalable and flexible computing resources on demand.'
        },
        {
          id: '4',
          question: 'Which programming language is most popular for data science?',
          options: ['Java', 'Python', 'C++', 'JavaScript'],
          correctAnswer: 1,
          explanation: 'Python is widely used in data science due to its extensive libraries and ease of use.'
        },
        {
          id: '5',
          question: 'What does IoT stand for?',
          options: ['Internet of Things', 'Integration of Technology', 'Intelligent Operations', 'Internet Operations'],
          correctAnswer: 0,
          explanation: 'IoT stands for Internet of Things - the network of connected devices and objects.'
        }
      ],
      'history': [
        {
          id: '1',
          question: 'In which year did World War II end?',
          options: ['1944', '1945', '1946', '1947'],
          correctAnswer: 1,
          explanation: 'World War II ended in 1945 with the surrender of Japan.'
        },
        {
          id: '2',
          question: 'Who was the first person to walk on the moon?',
          options: ['Buzz Aldrin', 'Neil Armstrong', 'John Glenn', 'Alan Shepard'],
          correctAnswer: 1,
          explanation: 'Neil Armstrong was the first person to walk on the moon in 1969.'
        },
        {
          id: '3',
          question: 'Which ancient wonder of the world was located in Egypt?',
          options: ['Hanging Gardens', 'Colossus of Rhodes', 'Great Pyramid', 'Lighthouse of Alexandria'],
          correctAnswer: 2,
          explanation: 'The Great Pyramid of Giza is the only surviving ancient wonder and is located in Egypt.'
        },
        {
          id: '4',
          question: 'When did the Renaissance period begin?',
          options: ['14th century', '15th century', '16th century', '17th century'],
          correctAnswer: 0,
          explanation: 'The Renaissance began in the 14th century in Italy.'
        },
        {
          id: '5',
          question: 'Who painted the Mona Lisa?',
          options: ['Michelangelo', 'Raphael', 'Leonardo da Vinci', 'Donatello'],
          correctAnswer: 2,
          explanation: 'Leonardo da Vinci painted the Mona Lisa in the early 16th century.'
        }
      ],
      'science': [
        {
          id: '1',
          question: 'What is the chemical symbol for gold?',
          options: ['Go', 'Gd', 'Au', 'Ag'],
          correctAnswer: 2,
          explanation: 'Au is the chemical symbol for gold, derived from the Latin word "aurum".'
        },
        {
          id: '2',
          question: 'Which planet is closest to the Sun?',
          options: ['Venus', 'Mercury', 'Earth', 'Mars'],
          correctAnswer: 1,
          explanation: 'Mercury is the closest planet to the Sun in our solar system.'
        },
        {
          id: '3',
          question: 'What is the speed of light in a vacuum?',
          options: ['300,000 km/s', '150,000 km/s', '450,000 km/s', '600,000 km/s'],
          correctAnswer: 0,
          explanation: 'The speed of light in a vacuum is approximately 300,000 kilometers per second.'
        },
        {
          id: '4',
          question: 'Which gas makes up most of Earth\'s atmosphere?',
          options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'],
          correctAnswer: 2,
          explanation: 'Nitrogen makes up about 78% of Earth\'s atmosphere.'
        },
        {
          id: '5',
          question: 'What is the smallest unit of matter?',
          options: ['Molecule', 'Atom', 'Electron', 'Proton'],
          correctAnswer: 1,
          explanation: 'An atom is the smallest unit of matter that retains the properties of an element.'
        }
      ]
    };

    return questionSets[topic.toLowerCase()] || questionSets['wellness'];
  }

  private getMockFeedback(percentage: number, topic: string): string {
    if (percentage >= 90) {
      return `Outstanding! You scored ${percentage}% on the ${topic} quiz. Your knowledge in this area is exceptional. You clearly have a deep understanding of the subject matter. Keep up the excellent work and consider sharing your expertise with others!`;
    } else if (percentage >= 80) {
      return `Great job! You scored ${percentage}% on the ${topic} quiz. You have a solid understanding of the topic with just a few areas to brush up on. Your performance shows good knowledge retention and understanding.`;
    } else if (percentage >= 70) {
      return `Good effort! You scored ${percentage}% on the ${topic} quiz. You have a decent grasp of the material, but there's room for improvement. Consider reviewing the topics you missed to strengthen your knowledge.`;
    } else if (percentage >= 60) {
      return `Not bad! You scored ${percentage}% on the ${topic} quiz. You have some knowledge of the topic, but there are several areas where you could improve. Take some time to study the material more thoroughly.`;
    } else {
      return `Keep learning! You scored ${percentage}% on the ${topic} quiz. While this score indicates you have some knowledge gaps, don't be discouraged. This is a great opportunity to dive deeper into the subject and expand your understanding.`;
    }
  }

}

export const aiService = new AIService();
