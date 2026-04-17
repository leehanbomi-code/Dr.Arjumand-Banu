import { Lesson, QuizQuestion } from './types';

export const MOCK_LESSONS: Lesson[] = [
  {
    id: 'l1',
    title: 'The Fundamentals of Photosynthesis',
    description: 'Learn how plants convert light into energy. Essential for biology students.',
    videoUrl: 'https://www.youtube.com/embed/UPBMG5EYPsc', // Example placeholder
    videoClippedSegments: {
      'chloroplasts': '0:45',
      'light-reaction': '2:15',
    },
    textbookContent: 'Photosynthesis is a process used by plants and other organisms to convert light energy into chemical energy...',
    chapters: [
      {
        id: 'c1',
        title: 'Overview',
        content: 'Photosynthesis takes place primarily in the leaves of plants within specialized organelles called chloroplasts. These organelles contain chlorophyll, which absorbs sunlight.'
      },
      {
        id: 'c2',
        title: 'The Light-Dependent Reaction',
        content: 'The first stage of photosynthesis is the light-dependent reaction, which occurs in the thylakoid membranes. Here, solar energy is captured and converted into ATP and NADPH.'
      }
    ]
  },
  {
    id: 'l2',
    title: 'Introduction to Calculus: Derivatives',
    description: 'Master the concept of rate of change and the foundational principles of differentiation.',
    videoUrl: 'https://www.youtube.com/embed/9vKqVkMqHKk',
    videoClippedSegments: {
      'power-rule': '1:30',
      'limits': '0:15',
    },
    textbookContent: 'A derivative measures how a function changes as its input changes. Informally, a derivative can be thought of as how much one quantity is changing in response to changes in another quantity...',
    chapters: [
      {
        id: 'c1',
        title: 'Definition of a Derivative',
        content: 'The derivative of a function at a chosen input value describes the rate of change of the function near that input value.'
      }
    ]
  }
];

export const MOCK_QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Where does photosynthesis primarily take place in plant cells?',
    options: ['Mitochondria', 'Chloroplasts', 'Nucleus', 'Ribosomes'],
    correctAnswer: 1,
    explanation: 'Photosynthesis occurs in chloroplasts, which contain chlorophyll to absorb light.',
    sourceLink: {
      type: 'text',
      chapterId: 'c1',
      textSnippet: 'Photosynthesis takes place primarily in the leaves of plants within specialized organelles called chloroplasts.'
    }
  },
  {
    id: 'q2',
    question: 'What is the primary product of the light-dependent reaction?',
    options: ['Glucose', 'Oxygen and ATP/NADPH', 'Water', 'Carbon Dioxide'],
    correctAnswer: 1,
    explanation: 'The light reactions produce ATP and NADPH, which are then used in the Calvin cycle.',
    sourceLink: {
      type: 'video',
      timestamp: '2:15',
      textSnippet: 'The light-dependent reaction converts solar energy into ATP and NADPH.'
    }
  }
];
