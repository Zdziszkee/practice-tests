// practice-tests/src/routes/index.tsx
import { Title } from "@solidjs/meta";
import { createSignal, Show, createEffect } from "solid-js";
import { Quiz } from "../types/quiz";
import QuizPlayer from "../components/QuizPlayer";
import QuizUploader from "../components/QuizUploader";
import QuizSelector from "../components/QuizSelector";
import "../components/Quizz.css";

// Define view states
type ViewState = "selection" | "quiz" | "upload";

// Default quiz file paths
const DEFAULT_QUIZ_FILES = [
  "/practice-tests/test1.json",
  "/practice-tests/test2.json",
  "/practice-tests/test3.json",
  "/practice-tests/test4.json",
];

export default function Home() {
  const [quiz, setQuiz] = createSignal<Quiz | null>(null);
  const [quizzes, setQuizzes] = createSignal<Quiz[]>([]);
  const [viewState, setViewState] = createSignal<ViewState>("selection");
  const [loading, setLoading] = createSignal(true);

  // Function to fetch a quiz from file
  const fetchQuiz = async (url: string): Promise<Quiz | null> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(
          `Failed to fetch quiz from ${url}: ${response.statusText}`,
        );
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching quiz from ${url}:`, error);
      return null;
    }
  };

  // Load default quizzes only if needed
  const loadDefaultQuizzes = async () => {
    setLoading(true);

    const loadedQuizzes = [];
    for (const quizUrl of DEFAULT_QUIZ_FILES) {
      const quizData = await fetchQuiz(quizUrl);
      if (quizData) {
        loadedQuizzes.push(quizData);
      }
    }

    setQuizzes(loadedQuizzes);
    localStorage.setItem("quizzes", JSON.stringify(loadedQuizzes));
    setLoading(false);
  };

  // Initialize with stored quizzes or load defaults
  createEffect(async () => {
    const storedQuizzes = localStorage.getItem("quizzes");

    if (storedQuizzes) {
      try {
        const parsedQuizzes = JSON.parse(storedQuizzes);

        // Check if the array actually contains quizzes
        if (Array.isArray(parsedQuizzes) && parsedQuizzes.length > 0) {
          setQuizzes(parsedQuizzes);
          setLoading(false);
          return; // Exit if we successfully loaded quizzes
        }
      } catch (error) {
        console.error("Failed to parse stored quizzes:", error);
      }
    }

    // If we get here, either there are no quizzes in storage or there was an error
    // Load our default quizzes
    await loadDefaultQuizzes();
  });

  // Save quizzes to local storage when they change
  createEffect(() => {
    if (quizzes().length > 0 && !loading()) {
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

    // If we deleted all quizzes, load the defaults again
    if (updatedQuizzes.length === 0) {
      loadDefaultQuizzes();
    } else {
      setQuizzes(updatedQuizzes);
      localStorage.setItem("quizzes", JSON.stringify(updatedQuizzes));
    }
  };

  const resetToDefaultQuizzes = async () => {
    if (
      confirm(
        "Are you sure you want to reset all quizzes? This will remove all custom quizzes and restore the default quizzes.",
      )
    ) {
      await loadDefaultQuizzes();
    }
  };

  return (
    <main>
      <Title>Interactive Quiz App</Title>

      <Show
        when={!loading()}
        fallback={<div class="loading-screen">Loading quizzes...</div>}
      >
        <Show when={viewState() === "quiz" && quiz()}>
          <>
            <button
              onClick={() => setViewState("selection")}
              class="back-button"
            >
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

          <div class="storage-info">
            <span>
              {quizzes().length} quiz{quizzes().length !== 1 ? "zes" : ""} saved
              in your browser
            </span>
            <button class="storage-clear" onClick={resetToDefaultQuizzes}>
              Reset to Default Quizzes
            </button>
          </div>
        </Show>

        <Show when={viewState() === "upload"}>
          <>
            <button
              onClick={() => setViewState("selection")}
              class="back-button"
            >
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
                Create your own quiz by preparing a JSON file with your
                questions and uploading it above.
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
      </Show>
    </main>
  );
}
