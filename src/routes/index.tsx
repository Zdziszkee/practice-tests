import { Title } from "@solidjs/meta";
import { createSignal, Show, createEffect } from "solid-js";
import { Quiz } from "../types/quiz";
import QuizPlayer from "../components/QuizPlayer";
import QuizUploader from "../components/QuizUploader";
import QuizSelector from "../components/QuizSelector";
import "../components/Quizz.css";

// Define view states
type ViewState = "selection" | "quiz" | "upload";

export default function Home() {
  const [quiz, setQuiz] = createSignal<Quiz | null>(null);
  const [quizzes, setQuizzes] = createSignal<Quiz[]>([]);
  const [viewState, setViewState] = createSignal<ViewState>("selection");

  // Load quizzes from local storage on component mount
  createEffect(() => {
    const storedQuizzes = localStorage.getItem("quizzes");
    if (storedQuizzes) {
      try {
        setQuizzes(JSON.parse(storedQuizzes));
      } catch (error) {
        console.error("Failed to parse stored quizzes:", error);
      }
    }
  });

  // Save quizzes to local storage when they change
  createEffect(() => {
    if (quizzes().length > 0) {
      localStorage.setItem("quizzes", JSON.stringify(quizzes()));
    }
  });

  const handleQuizLoaded = (loadedQuiz: Quiz) => {
    // Add the new quiz to our collection
    setQuizzes([...quizzes(), loadedQuiz]);
    // Set as active quiz
    setQuiz(loadedQuiz);
    // Change view to quiz
    setViewState("quiz");
  };

  const handleSelectQuiz = (selected: Quiz) => {
    setQuiz(selected);
    setViewState("quiz");
  };

  const handleDeleteQuiz = (index: number) => {
    const updatedQuizzes = [...quizzes()];
    updatedQuizzes.splice(index, 1);
    setQuizzes(updatedQuizzes);
    localStorage.setItem("quizzes", JSON.stringify(updatedQuizzes));
  };

  const clearAllQuizzes = () => {
    if (
      confirm(
        "Are you sure you want to delete all quizzes? This cannot be undone.",
      )
    ) {
      setQuizzes([]);
      localStorage.removeItem("quizzes");
    }
  };

  return (
    <main>
      <Title>Interactive Quiz App</Title>

      <Show when={viewState() === "quiz" && quiz()}>
        <>
          <button onClick={() => setViewState("selection")} class="back-button">
            Back to Quiz Library
          </button>
          <QuizPlayer quiz={quiz()!} />
        </>
      </Show>

      <Show when={viewState() === "selection"}>
        <div class="welcome-section">
          <h1>Quiz App Library</h1>
          <p class="intro-text">
            Choose from your saved quizzes or upload a new quiz file to get
            started.
          </p>
          <button class="btn" onClick={() => setViewState("upload")}>
            Upload New Quiz
          </button>
        </div>

        <QuizSelector
          quizzes={quizzes()}
          onSelectQuiz={handleSelectQuiz}
          onDeleteQuiz={handleDeleteQuiz}
        />

        {quizzes().length > 0 && (
          <div class="storage-info">
            <span>
              {quizzes().length} quiz{quizzes().length !== 1 ? "zes" : ""} saved
              in your browser
            </span>
            <button class="storage-clear" onClick={clearAllQuizzes}>
              Clear All Quizzes
            </button>
          </div>
        )}
      </Show>

      <Show when={viewState() === "upload"}>
        <>
          <button onClick={() => setViewState("selection")} class="back-button">
            Back to Quiz Library
          </button>

          <div class="welcome-section">
            <h1>Upload New Quiz</h1>
            <p class="intro-text">
              Create and upload your own quiz in JSON format.
            </p>
          </div>

          <QuizUploader onQuizLoaded={handleQuizLoaded} />

          <div class="sample-quiz-info card">
            <h2>How to Create a Quiz</h2>
            <p>
              Create your own quiz by preparing a JSON file with your questions
              and uploading it above.
            </p>

            <h3>Expected JSON Format:</h3>
            <pre>
              {`{
  "title": "Your Quiz Title",
  "description": "Quiz description (optional)",
  "questions": [
    {
      "question": "What is the capital of France?",
      "options": [
        { "text": "Paris", "isCorrect": true },
        { "text": "London", "isCorrect": false },
        { "text": "Berlin", "isCorrect": false },
        { "text": "Rome", "isCorrect": false }
      ],
      "explanation": "Paris is the capital of France."
    },
    {
      "question": "Which of these are primary colors? (Select all that apply)",
      "options": [
        { "text": "Red", "isCorrect": true },
        { "text": "Green", "isCorrect": false },
        { "text": "Blue", "isCorrect": true },
        { "text": "Yellow", "isCorrect": true },
        { "text": "Orange", "isCorrect": false }
      ],
      "explanation": "Red, blue, and yellow are primary colors in traditional color theory."
    }
  ]
}`}
            </pre>
          </div>
        </>
      </Show>
    </main>
  );
}
