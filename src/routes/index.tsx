/* practice-tests/src/routes/index.tsx */
import { Title } from "@solidjs/meta";
import { createSignal, Show } from "solid-js";
import { Quiz } from "~/types/quiz";
import QuizPlayer from "~/components/QuizPlayer";
import QuizUploader from "~/components/QuizUploader";
import "~/components/Quiz.css";

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
  "id": "unique-quiz-id",
  "title": "Your Quiz Title",
  "description": "Quiz description (optional)",
  "questions": [
    {
      "id": "q1",
      "question": "What is the capital of France?",
      "options": [
        { "id": "a", "text": "Paris" },
        { "id": "b", "text": "London" },
        { "id": "c", "text": "Berlin" },
        { "id": "d", "text": "Rome" }
      ],
      "correctOptionId": "a",
      "explanation": "Paris is the capital of France."
    },
    // More questions...
  ]
}`}
          </pre>
        </div>
      </Show>
    </main>
  );
}
