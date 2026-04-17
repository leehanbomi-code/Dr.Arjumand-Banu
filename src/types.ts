/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  videoClippedSegments: { [key: string]: string }; // Map key to timestamp/info
  textbookContent: string;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  sourceLink: {
    type: 'text' | 'video';
    chapterId?: string;
    timestamp?: string;
    textSnippet?: string;
  };
}

export interface UserStats {
  points: number;
  badges: Badge[];
  level: number;
  streak: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export type ChatStyle = 'simple' | 'real-life' | 'visual' | 'advanced';
