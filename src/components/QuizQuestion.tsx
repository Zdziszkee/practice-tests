import { createSignal, Show } from "solid-js";
import { QuizQuestion as QuizQuestionType } from "~/types/quiz";
import { shuffleArray } from "~/utils/helpers";

interface QuizQuestionProps {
  question: QuizQuestionType;
  onAnswer: (questionId: string, optionId: string) => void;
  isAnswered: boolean;
  selectedOptionId?: string;
}

export default function QuizQuestion(props: QuizQuestionProps) {
  const [options, setOptions] = createSignal(
    shuffleArray([...props.question.options]),
  );

  const isCorrect = () =>
    props.selectedOptionId === props.question.correctOptionId;

  return (
    <div class="card quiz-question">
      <h3>{props.question.question}</h3>

      <div class="options">
        {options().map((option) => (
          <button
            class={`option ${
              props.isAnswered && option.id === props.selectedOptionId
                ? option.id === props.question.correctOptionId
                  ? "correct"
                  : "incorrect"
                : ""
            }`}
            onClick={() =>
              !props.isAnswered && props.onAnswer(props.question.id, option.id)
            }
            disabled={props.isAnswered}
          >
            {option.text}
          </button>
        ))}
      </div>

      <Show when={props.isAnswered && props.question.explanation}>
        <div class="explanation">
          <h4>Explanation:</h4>
          <p>{props.question.explanation}</p>
        </div>
      </Show>
    </div>
  );
}
