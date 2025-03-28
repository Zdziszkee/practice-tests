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

// Default quiz to show if no quizzes exist
const DEFAULT_QUIZ: Quiz = {
  title: "Color Theory Quiz",
  description: "Test your knowledge of color theory",
  questions: [
    {
      question: "What are the primary colors in the RGB color model?",
      options: [
        { text: "Red", isCorrect: true },
        { text: "Green", isCorrect: true },
        { text: "Blue", isCorrect: true },
        { text: "Yellow", isCorrect: false },
        { text: "Cyan", isCorrect: false },
      ],
      explanation:
        "In the RGB (additive) color model used for digital displays, the primary colors are Red, Green, and Blue.",
    },
    {
      question: "Which color is created by mixing blue and yellow paint?",
      options: [
        { text: "Orange", isCorrect: false },
        { text: "Purple", isCorrect: false },
        { text: "Green", isCorrect: true },
        { text: "Brown", isCorrect: false },
      ],
      explanation:
        "When mixing blue and yellow paint, you get green. This follows the subtractive color model (CMYK) used in physical media.",
    },
    {
      question:
        "Which of these colors have a wavelength longer than 600 nanometers?",
      options: [
        { text: "Blue", isCorrect: false },
        { text: "Green", isCorrect: false },
        { text: "Orange", isCorrect: true },
        { text: "Red", isCorrect: true },
      ],
      explanation:
        "Colors with longer wavelengths appear toward the red end of the spectrum. Red has the longest wavelength (around 700nm), followed by orange (around 620nm).",
    },
  ],
};

export default function Home() {
  const [quiz, setQuiz] = createSignal<Quiz | null>(null);
  const [quizzes, setQuizzes] = createSignal<Quiz[]>([]);
  const [viewState, setViewState] = createSignal<ViewState>("selection");

  // Initialize with default quiz
  createEffect(() => {
    // Try to load quizzes from localStorage
    const storedQuizzes = localStorage.getItem("quizzes");

    if (storedQuizzes) {
      try {
        const parsedQuizzes = JSON.parse(storedQuizzes);

        // Check if the array actually contains quizzes
        if (Array.isArray(parsedQuizzes) && parsedQuizzes.length > 0) {
          setQuizzes(parsedQuizzes);
          return; // Exit if we successfully loaded quizzes
        }
      } catch (error) {
        console.error("Failed to parse stored quizzes:", error);
      }
    }

    // If we get here, either there are no quizzes in storage or there was an error
    // Add our default quiz
    const initialQuizzes = [DEFAULT_QUIZ];
    setQuizzes(initialQuizzes);
    localStorage.setItem("quizzes", JSON.stringify(initialQuizzes));
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

    // If we're about to delete all quizzes, add back the default one
    if (updatedQuizzes.length === 0) {
      updatedQuizzes.push(DEFAULT_QUIZ);
    }

    setQuizzes(updatedQuizzes);
    localStorage.setItem("quizzes", JSON.stringify(updatedQuizzes));
  };

  const resetToDefaultQuizzes = () => {
    if (
      confirm(
        "Are you sure you want to reset all quizzes? This will remove all custom quizzes and restore the default quiz.",
      )
    ) {
      const defaultQuizzes = [DEFAULT_QUIZ];
      setQuizzes(defaultQuizzes);
      localStorage.setItem("quizzes", JSON.stringify(defaultQuizzes));
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

        <div class="storage-info">
          <span>
            {quizzes().length} quiz{quizzes().length !== 1 ? "zes" : ""} saved
            in your browser
          </span>
          <button class="storage-clear" onClick={resetToDefaultQuizzes}>
            Reset to Default Quiz
          </button>
        </div>
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
