// practice-tests/src/components/QuizUploader.tsx
import { createSignal } from "solid-js";
import { Quiz } from "../types/quiz";

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
        const quizData = JSON.parse(content);

        // Basic validation
        if (
          !quizData.title ||
          !quizData.questions ||
          !Array.isArray(quizData.questions)
        ) {
          throw new Error("Invalid quiz format. Missing title or questions.");
        }

        // Validate each question and handle both legacy and new formats
        const processedQuestions = quizData.questions.map(
          (q: any, i: number) => {
            if (!q.question || !q.options || !Array.isArray(q.options)) {
              throw new Error(
                `Invalid question format at index ${i}. Check question and options.`,
              );
            }

            // Handle both formats
            if ("correctOptionId" in q && !("correctOptionIds" in q)) {
              if (!q.correctOptionId) {
                throw new Error(
                  `Missing correctOptionId for question at index ${i}.`,
                );
              }
              return {
                ...q,
                correctOptionIds: [q.correctOptionId],
                multipleAnswer: false,
              };
            }

            if ("correctOptionIds" in q) {
              if (
                !Array.isArray(q.correctOptionIds) ||
                q.correctOptionIds.length === 0
              ) {
                throw new Error(
                  `Invalid correctOptionIds for question at index ${i}.`,
                );
              }
              return {
                ...q,
                multipleAnswer: q.correctOptionIds.length > 1,
              };
            }

            throw new Error(
              `Missing correctOptionId or correctOptionIds for question at index ${i}.`,
            );
          },
        );

        const quiz: Quiz = {
          ...quizData,
          questions: processedQuestions,
        };

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
