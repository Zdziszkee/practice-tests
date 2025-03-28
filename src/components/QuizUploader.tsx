// practice-tests/src/components/QuizUploader.tsx
import { createSignal } from "solid-js";
import { Quiz } from "../types/quiz";

interface QuizUploaderProps {
  onQuizLoaded: (quiz: Quiz) => void;
}

export default function QuizUploader(props: QuizUploaderProps) {
  const [error, setError] = createSignal<string | null>(null);
  const [loading, setLoading] = createSignal(false);
  const [fileName, setFileName] = createSignal<string | null>(null);

  const handleFileUpload = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];

    if (!file) return;

    setFileName(file.name);
    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const rawData = JSON.parse(content);

        // Basic validation
        if (
          !rawData.title ||
          !rawData.questions ||
          !Array.isArray(rawData.questions)
        ) {
          throw new Error("Invalid quiz format. Missing title or questions.");
        }

        // Further validation for questions
        rawData.questions.forEach((q: any, idx: number) => {
          if (!q.question || !Array.isArray(q.options)) {
            throw new Error(
              `Invalid question at index ${idx}. Missing question text or options array.`,
            );
          }

          // Check if all options have text and isCorrect properties
          q.options.forEach((opt: any, optIdx: number) => {
            if (typeof opt.text === "undefined") {
              throw new Error(
                `Missing 'text' for option ${optIdx} in question ${idx}.`,
              );
            }

            // Support both explicit isCorrect and legacy formats
            if (typeof opt.isCorrect === "undefined") {
              if (
                q.correctOptionId === opt.id ||
                (Array.isArray(q.correctOptionIds) &&
                  q.correctOptionIds.includes(opt.id))
              ) {
                opt.isCorrect = true;
              } else {
                opt.isCorrect = false;
              }
            }
          });

          // Count how many correct options there are
          const correctCount = q.options.filter(
            (opt: any) => opt.isCorrect,
          ).length;

          // If no correct answers, this is an error
          if (correctCount === 0) {
            throw new Error(`Question at index ${idx} has no correct answer.`);
          }
        });

        const quiz: Quiz = {
          title: rawData.title,
          description: rawData.description || "",
          questions: rawData.questions,
        };

        props.onQuizLoaded(quiz);
      } catch (err) {
        setError(
          `Error loading quiz: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      } finally {
        setLoading(false);
        // Don't clear the input value to show the file name
      }
    };

    reader.onerror = () => {
      setError("Error reading the file");
      setLoading(false);
      setFileName(null);
    };

    reader.readAsText(file);
  };

  return (
    <div class="quiz-uploader card">
      <h2>Start Your Quiz</h2>
      <p>Upload a JSON file containing your quiz questions to begin</p>

      <div class="file-input-container">
        <label for="quiz-file" class="file-input-label">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="file-icon"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
          <span>{fileName() || "Choose a JSON file..."}</span>
        </label>
        <input
          id="quiz-file"
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          disabled={loading()}
          class="file-input"
        />
      </div>

      {error() && (
        <div class="error-message">
          <strong>Error:</strong> {error()}
        </div>
      )}

      {loading() && <div class="loading">Loading quiz data...</div>}
    </div>
  );
}
