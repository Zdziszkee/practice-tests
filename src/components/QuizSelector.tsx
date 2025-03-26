import { For, createSignal, onMount } from "solid-js";
import type { QuizStore } from "../stores/quizStore";

interface QuizSelectorProps {
  store: QuizStore;
  onQuizSelect: (quizId: string) => void;
}

export default function QuizSelector(props: QuizSelectorProps) {
  const [loading, setLoading] = createSignal(true);
  const [quizTitles, setQuizTitles] = createSignal<Record<string, string>>({});

  onMount(async () => {
    await props.store.fetchQuizList();

    // Fetch titles for all available quizzes
    const titles: Record<string, string> = {};
    for (const quizId of props.store.availableQuizzes()) {
      try {
        const response = await fetch(`/quizzes/${quizId}.json`);
        const data = await response.json();
        titles[quizId] = data.title;
      } catch (error) {
        console.error(`Error fetching quiz ${quizId}:`, error);
        titles[quizId] = quizId; // Fallback to ID if title can't be fetched
      }
    }

    setQuizTitles(titles);
    setLoading(false);
  });

  return (
    <div class="quiz-selector">
      <h2>Select a Quiz</h2>

      {loading() ? (
        <div class="loading">Loading available quizzes...</div>
      ) : (
        <div class="quiz-list">
          <For each={props.store.availableQuizzes()}>
            {(quizId) => (
              <button
                class="quiz-button"
                onClick={() => props.onQuizSelect(quizId)}
              >
                {quizTitles()[quizId] || quizId}
              </button>
            )}
          </For>
        </div>
      )}
    </div>
  );
}
