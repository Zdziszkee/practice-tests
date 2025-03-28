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

          // Simplify to just what we need
          return {
            question: q.question,
            options: q.options.map((opt: any) => ({
              text: opt.text,
              isCorrect: Boolean(opt.isCorrect),
            })),
            explanation: q.explanation || "",
            multipleAnswer: correctCount > 1,
          };
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
