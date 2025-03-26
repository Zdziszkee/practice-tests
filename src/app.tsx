// src/app.tsx
import { createSignal, Show, For, createEffect } from "solid-js";
import "./app.css";

// Define types
type Question = {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
};

type Quiz = {
  id: string;
  title: string;
  description: string;
  questions: Question[];
};

// Sample quizzes - initial set
const initialQuizzes: Quiz[] = [
  {
    id: "javascript-basics",
    title: "JavaScript Basics",
    description: "Test your knowledge of JavaScript fundamentals",
    questions: [
      {
        id: "js-q1",
        text: "Which of the following is a primitive data type in JavaScript?",
        options: ["Object", "Array", "Function", "Symbol"],
        correctAnswer: 3,
        explanation: "Symbol is a primitive data type introduced in ES6.",
      },
      {
        id: "js-q2",
        text: "What will console.log(typeof null) output?",
        options: ["null", "undefined", "object", "number"],
        correctAnswer: 2,
        explanation:
          "In JavaScript, typeof null returns 'object', which is considered a historical bug.",
      },
    ],
  },
  {
    id: "react-concepts",
    title: "React Concepts",
    description: "Test your understanding of React fundamentals",
    questions: [
      {
        id: "react-q1",
        text: "What is the primary building block of React applications?",
        options: ["Modules", "Components", "Functions", "Classes"],
        correctAnswer: 1,
        explanation:
          "Components are the building blocks of React applications.",
      },
      {
        id: "react-q2",
        text: "Which hook is used for side effects in functional components?",
        options: ["useState", "useReducer", "useEffect", "useContext"],
        correctAnswer: 2,
        explanation:
          "useEffect is used for handling side effects like data fetching or DOM manipulation.",
      },
    ],
  },
];

export default function App() {
  // State management
  const [view, setView] = createSignal<
    "selector" | "quiz" | "results" | "upload"
  >("selector");
  const [quizzes, setQuizzes] = createSignal<Quiz[]>(initialQuizzes);
  const [currentQuiz, setCurrentQuiz] = createSignal<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = createSignal(0);
  const [userAnswers, setUserAnswers] = createSignal<Record<string, number>>(
    {},
  );
  const [showExplanation, setShowExplanation] = createSignal(false);
  const [uploadError, setUploadError] = createSignal<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = createSignal<string | null>(null);

  // Computed values
  const currentQuestion = () => {
    const quiz = currentQuiz();
    if (!quiz) return null;
    return quiz.questions[currentQuestionIndex()];
  };

  const isLastQuestion = () => {
    const quiz = currentQuiz();
    if (!quiz) return true;
    return currentQuestionIndex() === quiz.questions.length - 1;
  };

  const score = () => {
    const quiz = currentQuiz();
    if (!quiz) return { correct: 0, total: 0 };

    const correct = quiz.questions.filter(
      (q) => userAnswers()[q.id] === q.correctAnswer,
    ).length;

    return { correct, total: quiz.questions.length };
  };

  // Event handlers
  const selectQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowExplanation(false);
    setView("quiz");
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const question = currentQuestion();
    if (!question || showExplanation()) return;

    setUserAnswers((prev) => ({
      ...prev,
      [question.id]: answerIndex,
    }));
  };

  const handleNext = () => {
    if (showExplanation()) {
      setShowExplanation(false);
      if (isLastQuestion()) {
        setView("results");
      } else {
        setCurrentQuestionIndex((i) => i + 1);
      }
    } else {
      setShowExplanation(true);
    }
  };

  const handlePrevious = () => {
    setShowExplanation(false);
    setCurrentQuestionIndex((i) => i - 1);
  };

  const handleRestart = () => {
    setView("selector");
    setCurrentQuiz(null);
  };

  const goToUpload = () => {
    setUploadError(null);
    setUploadSuccess(null);
    setView("upload");
  };

  const handleFileUpload = async (event: Event) => {
    setUploadError(null);
    setUploadSuccess(null);

    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    try {
      // Read the file content
      const text = await file.text();
      const quizData = JSON.parse(text);

      // Validate the quiz structure
      if (!validateQuizData(quizData)) {
        setUploadError("Invalid quiz format. Please check the JSON structure.");
        return;
      }

      // Add the new quiz
      setQuizzes((prevQuizzes) => {
        // Check if a quiz with this ID already exists
        const existingIndex = prevQuizzes.findIndex(
          (q) => q.id === quizData.id,
        );

        if (existingIndex !== -1) {
          // Replace the existing quiz
          const updatedQuizzes = [...prevQuizzes];
          updatedQuizzes[existingIndex] = quizData;
          return updatedQuizzes;
        } else {
          // Add as a new quiz
          return [...prevQuizzes, quizData];
        }
      });

      setUploadSuccess(
        `Quiz "${quizData.title}" has been successfully uploaded.`,
      );

      // Reset file input
      input.value = "";
    } catch (error) {
      setUploadError(
        `Error reading JSON file: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  // Validate quiz data structure
  const validateQuizData = (data: any): data is Quiz => {
    if (!data || typeof data !== "object") return false;
    if (!data.id || typeof data.id !== "string") return false;
    if (!data.title || typeof data.title !== "string") return false;
    if (!data.description || typeof data.description !== "string") return false;
    if (!Array.isArray(data.questions) || data.questions.length === 0)
      return false;

    // Check each question
    for (const question of data.questions) {
      if (!question.id || typeof question.id !== "string") return false;
      if (!question.text || typeof question.text !== "string") return false;
      if (!Array.isArray(question.options) || question.options.length < 2)
        return false;
      if (
        typeof question.correctAnswer !== "number" ||
        question.correctAnswer < 0 ||
        question.correctAnswer >= question.options.length
      )
        return false;
    }

    return true;
  };

  return (
    <main class="quiz-app">
      <header class="app-header">
        <h1>Quiz Master</h1>
      </header>

      <div class="content">
        {/* Quiz Selection View */}
        <Show when={view() === "selector"}>
          <div class="quiz-selector">
            <h2>Select a Quiz</h2>
            <div class="quiz-list">
              {quizzes().map((quiz) => (
                <button class="quiz-button" onClick={() => selectQuiz(quiz)}>
                  <strong>{quiz.title}</strong>
                  <span>{quiz.description}</span>
                </button>
              ))}
            </div>

            <div class="upload-section">
              <button
                class="quiz-button secondary upload-btn"
                onClick={goToUpload}
              >
                <span>Upload New Quiz</span>
              </button>
            </div>
          </div>
        </Show>

        {/* Upload View */}
        <Show when={view() === "upload"}>
          <div class="quiz-container">
            <h2>Upload Quiz</h2>
            <p class="upload-instructions">
              Upload a JSON file containing a quiz. The file should follow the
              required format.
            </p>

            <div class="upload-form">
              <label class="file-upload-label">
                <input type="file" accept=".json" onChange={handleFileUpload} />
                Choose JSON File
              </label>

              <Show when={uploadError()}>
                <div class="upload-error">{uploadError()}</div>
              </Show>

              <Show when={uploadSuccess()}>
                <div class="upload-success">{uploadSuccess()}</div>
              </Show>

              <div class="format-help">
                <h4>Required JSON Format:</h4>
                <pre class="json-format">
                  {`{
  "id": "unique-quiz-id",
  "title": "Quiz Title",
  "description": "Quiz Description",
  "questions": [
    {
      "id": "q1",
      "text": "Question text?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0,
      "explanation": "Optional explanation"
    }
  ]
}`}
                </pre>
              </div>
            </div>

            <div class="upload-controls">
              <button
                class="quiz-button secondary"
                onClick={() => setView("selector")}
              >
                Back to Quiz List
              </button>
            </div>
          </div>
        </Show>

        {/* Quiz Taking View */}
        <Show when={view() === "quiz" && currentQuiz() && currentQuestion()}>
          <div class="quiz-container">
            <header class="quiz-header">
              <h2>{currentQuiz()!.title}</h2>
              <p>{currentQuiz()!.description}</p>
            </header>

            <div class="question-progress">
              Question {currentQuestionIndex() + 1} of{" "}
              {currentQuiz()!.questions.length}
            </div>

            <div class="question-container">
              <h3 class="question-text">{currentQuestion()!.text}</h3>

              <div class="options-container">
                {currentQuestion()!.options.map((option, idx) => {
                  const isSelected =
                    userAnswers()[currentQuestion()!.id] === idx;
                  const isCorrect = currentQuestion()!.correctAnswer === idx;

                  return (
                    <button
                      class={`option-button
                        ${isSelected ? "selected" : ""}
                        ${showExplanation() && isSelected ? (isCorrect ? "correct" : "incorrect") : ""}`}
                      onClick={() => handleAnswerSelect(idx)}
                      disabled={showExplanation()}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              <Show when={showExplanation() && currentQuestion()!.explanation}>
                <div
                  class={`explanation ${
                    userAnswers()[currentQuestion()!.id] ===
                    currentQuestion()!.correctAnswer
                      ? "correct"
                      : "incorrect"
                  }`}
                >
                  <p>{currentQuestion()!.explanation}</p>
                </div>
              </Show>
            </div>

            <div class="quiz-controls">
              <button
                class="quiz-button secondary"
                onClick={handlePrevious}
                disabled={currentQuestionIndex() === 0}
              >
                Previous
              </button>

              <button
                class="quiz-button primary"
                onClick={handleNext}
                disabled={
                  userAnswers()[currentQuestion()!.id] === undefined &&
                  !showExplanation()
                }
              >
                {showExplanation()
                  ? isLastQuestion()
                    ? "See Results"
                    : "Next Question"
                  : "Check Answer"}
              </button>
            </div>
          </div>
        </Show>

        {/* Results View */}
        <Show when={view() === "results" && currentQuiz()}>
          <div class="quiz-container">
            <h2>Quiz Completed!</h2>

            <div class="score-container">
              <div class="score">
                <span class="score-value">{score().correct}</span>
                <span class="score-total">/{score().total}</span>
              </div>
              <div class="percentage">
                {Math.round((score().correct / score().total) * 100)}%
              </div>
            </div>

            <p class="result-message">
              {score().correct === score().total
                ? "Perfect score! Excellent job!"
                : score().correct >= score().total * 0.8
                  ? "Great job! You're doing well."
                  : score().correct >= score().total * 0.6
                    ? "Good effort! Keep studying."
                    : "Keep practicing to improve your score."}
            </p>

            <div class="result-buttons">
              <button class="quiz-button primary" onClick={handleRestart}>
                Choose Another Quiz
              </button>
            </div>
          </div>
        </Show>
      </div>
    </main>
  );
}
