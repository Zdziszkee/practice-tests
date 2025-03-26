import { createSignal, createResource } from "solid-js";
import type { Quiz, Question } from "../models/quiz";

export function createQuizStore() {
  const [availableQuizzes, setAvailableQuizzes] = createSignal<string[]>([]);
  const [currentQuiz, setCurrentQuiz] = createSignal<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = createSignal(0);
  const [userAnswers, setUserAnswers] = createSignal<Record<string, string>>(
    {},
  );

  // Fetch available quiz list
  async function fetchQuizList() {
    try {
      // In a real app, this would be an API call
      // For simplicity, let's assume we have a predefined list
      setAvailableQuizzes(["javascript-basics", "react-concepts"]);
      return ["javascript-basics", "react-concepts"];
    } catch (error) {
      console.error("Failed to fetch quiz list:", error);
      return [];
    }
  }

  // Load a specific quiz by ID
  async function loadQuiz(quizId: string) {
    try {
      const response = await fetch(`/quizzes/${quizId}.json`);
      if (!response.ok) throw new Error(`Failed to load quiz: ${quizId}`);
      const quiz = await response.json();
      setCurrentQuiz(quiz);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      return quiz;
    } catch (error) {
      console.error(`Failed to load quiz ${quizId}:`, error);
      return null;
    }
  }

  const nextQuestion = () => {
    if (
      currentQuiz() &&
      currentQuestionIndex() < currentQuiz()!.questions.length - 1
    ) {
      setCurrentQuestionIndex(currentQuestionIndex() + 1);
      return true;
    }
    return false;
  };

  const prevQuestion = () => {
    if (currentQuestionIndex() > 0) {
      setCurrentQuestionIndex(currentQuestionIndex() - 1);
      return true;
    }
    return false;
  };

  const saveAnswer = (questionId: string, answer: string) => {
    setUserAnswers({ ...userAnswers(), [questionId]: answer });
  };

  const getCurrentQuestion = () => {
    const quiz = currentQuiz();
    if (quiz && quiz.questions.length > currentQuestionIndex()) {
      return quiz.questions[currentQuestionIndex()];
    }
    return null;
  };

  // Calculate the score for the current quiz
  const getScore = () => {
    const quiz = currentQuiz();
    if (!quiz) return { correct: 0, total: 0 };

    const correct = quiz.questions.filter((q) => {
      const userAnswer = userAnswers()[q.id];
      const correctAnswer =
        typeof q.correctAnswer === "number"
          ? q.options[q.correctAnswer]
          : q.correctAnswer;
      return userAnswer === correctAnswer;
    }).length;

    return { correct, total: quiz.questions.length };
  };

  return {
    availableQuizzes,
    currentQuiz,
    currentQuestionIndex,
    userAnswers,
    fetchQuizList,
    loadQuiz,
    nextQuestion,
    prevQuestion,
    saveAnswer,
    getCurrentQuestion,
    getScore,
  };
}

export type QuizStore = ReturnType<typeof createQuizStore>;
