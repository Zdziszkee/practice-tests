// practice-tests/src/routes/index.tsx
import { Title } from "@solidjs/meta";
import { createSignal, Show } from "solid-js";
import { Quiz } from "../types/quiz";
import QuizPlayer from "../components/QuizPlayer";
import QuizUploader from "../components/QuizUploader";
import "../components/Quizz.css";

export default function Home() {
  const [quiz, setQuiz] = createSignal<Quiz | null>(null);

  const handleQuizLoaded = (loadedQuiz: Quiz) => {
    setQuiz(loadedQuiz);
  };

  return (
    <main>
      <Title>Quiz App</Title>
      <h1>Interactive Quiz App</h1>

      <Show
        when={!quiz()}
        fallback={
          <>
            <button onClick={() => setQuiz(null)} class="back-button">
              ← Back to Upload
            </button>
            <QuizPlayer quiz={quiz()!} />
          </>
        }
      >
        <QuizUploader onQuizLoaded={handleQuizLoaded} />

        <div class="sample-quiz-info card">
          <h2>How to Use This App</h2>
          <p>Upload a JSON file with your quiz questions to get started.</p>

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
      </Show>
    </main>
  );
}
