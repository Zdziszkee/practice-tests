import { createSignal } from "solid-js";
import { Quiz } from "~/types/quiz";

interface QuizUploaderProps {
  onQuizLoaded: (quiz: Quiz) => void;
}

export default function QuizUploader(props: QuizUploaderProps) {
  const [error, setError] = createSignal<string | null>(null);
  const [loading, setLoading] = createSignal(false);

  const handleFileUpload = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];

    if (!file) return;

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const quiz = JSON.parse(content) as Quiz;

        // Basic validation
        if (!quiz.title || !quiz.questions || !Array.isArray(quiz.questions)) {
          throw new Error("Invalid quiz format. Missing title or questions.");
        }

        // Validate each question
        quiz.questions.forEach((q, i) => {
          if (
            !q.question ||
            !q.options ||
            !Array.isArray(q.options) ||
            !q.correctOptionId
          ) {
            throw new Error(
              `Invalid question format at index ${i}. Check question, options, and correctOptionId.`,
            );
          }
        });

        props.onQuizLoaded(quiz);
      } catch (err) {
        setError(
          `Error loading quiz: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      } finally {
        setLoading(false);
        // Clear the input
        input.value = "";
      }
    };

    reader.onerror = () => {
      setError("Error reading the file");
      setLoading(false);
    };

    reader.readAsText(file);
  };

  return (
    <div class="quiz-uploader card">
      <h2>Upload Quiz</h2>
      <p>Upload a JSON file containing your quiz data</p>

      <input
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        disabled={loading()}
      />

      {error() && <div class="error-message">{error()}</div>}
      {loading() && <div class="loading">Loading quiz data...</div>}
    </div>
  );
}
