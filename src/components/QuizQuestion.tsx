// practice-tests/src/components/QuizQuestion.tsx
import { createSignal, Show, createEffect } from "solid-js";
import { QuizQuestion as QuizQuestionType, QuizOption } from "../types/quiz";
import { shuffleArray } from "../utils/helpers";

interface QuizQuestionProps {
  question: QuizQuestionType;
  onAnswer: (questionId: string, optionId: string, isChecked: boolean) => void;
  isAnswered: boolean;
  selectedOptionIds?: string[];
}

export default function QuizQuestion(props: QuizQuestionProps) {
  const [options, setOptions] = createSignal<QuizOption[]>([]);

  createEffect(() => {
    if (props.question && Array.isArray(props.question.options)) {
      setOptions(shuffleArray([...props.question.options]));
    }
  });

  const isOptionSelected = (optionId: string) => {
    return (
      props.selectedOptionIds && props.selectedOptionIds.includes(optionId)
    );
  };

  const isOptionCorrect = (optionId: string) => {
    return props.question.correctOptionIds.includes(optionId);
  };

  const getOptionClass = (optionId: string) => {
    if (!props.isAnswered) return "";

    if (isOptionSelected(optionId)) {
      return isOptionCorrect(optionId) ? "correct" : "incorrect";
    } else if (props.isAnswered && isOptionCorrect(optionId)) {
      // Show correct answers that weren't selected
      return "missed-correct";
    }

    return "";
  };

  const handleOptionClick = (optionId: string) => {
    if (props.isAnswered) return;

    const isSelected = isOptionSelected(optionId);
    props.onAnswer(props.question.id, optionId, !isSelected);
  };

  return (
    <div class="card quiz-question">
      <h3>{props.question.question}</h3>

      <Show when={props.question.multipleAnswer}>
        <p class="multiple-answer-notice">
          (Multiple answers may be correct. Select all that apply.)
        </p>
      </Show>

      <div class="options">
        {options().map((option) => (
          <div
            class={`option ${getOptionClass(option.id)} ${props.question.multipleAnswer ? "checkbox-style" : "radio-style"}`}
            onClick={() => handleOptionClick(option.id)}
          >
            <span class="option-indicator">
              {props.question.multipleAnswer ? (
                <input
                  type="checkbox"
                  checked={isOptionSelected(option.id)}
                  disabled={props.isAnswered}
                  onChange={() => {}} // Handled by parent div click
                />
              ) : (
                <input
                  type="radio"
                  checked={isOptionSelected(option.id)}
                  disabled={props.isAnswered}
                  name={`question-${props.question.id}`}
                  onChange={() => {}} // Handled by parent div click
                />
              )}
            </span>
            <span class="option-text">{option.text}</span>
          </div>
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
