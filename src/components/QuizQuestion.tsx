import { createSignal, Show, createEffect } from "solid-js";
import { QuizQuestion as QuizQuestionType, QuizOption } from "../types/quiz";
import { shuffleArray } from "../utils/helpers";

interface QuizQuestionProps {
  question: QuizQuestionType;
  onAnswer: (questionId: string, optionId: string, isChecked: boolean) => void;
  isAnswered: boolean;
  selectedOptionIds?: string[];
  onSubmit?: () => void;
}

export default function QuizQuestion(props: QuizQuestionProps) {
  const [options, setOptions] = createSignal<QuizOption[]>([]);
  const [tempSelections, setTempSelections] = createSignal<string[]>(
    props.selectedOptionIds || [],
  );
  const [localAnswered, setLocalAnswered] = createSignal(false);

  // Reset tempSelections when question changes
  createEffect(() => {
    if (props.question?.id) {
      setTempSelections(props.selectedOptionIds || []);
      setLocalAnswered(props.isAnswered);
    }
  });

  createEffect(() => {
    if (props.question && Array.isArray(props.question.options)) {
      setOptions(shuffleArray([...props.question.options]));
    }
  });

  const isOptionSelected = (optionId: string) => {
    return tempSelections().includes(optionId);
  };

  const isOptionCorrect = (optionId: string) => {
    return props.question.correctOptionIds.includes(optionId);
  };

  const getOptionClass = (optionId: string) => {
    if (!localAnswered() && !props.isAnswered) return "";

    // When answered, highlight all correct options
    if (localAnswered() || props.isAnswered) {
      if (isOptionCorrect(optionId)) {
        return isOptionSelected(optionId) ? "correct" : "missed-correct";
      } else if (isOptionSelected(optionId)) {
        return "incorrect";
      }
    }

    return "";
  };

  const handleOptionClick = (optionId: string) => {
    if (localAnswered() || props.isAnswered) return;

    const isSelected = isOptionSelected(optionId);

    if (props.question.multipleAnswer) {
      // Toggle selection for multiple choice
      if (isSelected) {
        setTempSelections(tempSelections().filter((id) => id !== optionId));
      } else {
        setTempSelections([...tempSelections(), optionId]);
      }
    } else {
      // Single choice - replace selection
      setTempSelections([optionId]);
    }
  };

  const handleSubmit = () => {
    setLocalAnswered(true);

    // Send all selections to parent
    tempSelections().forEach((optionId) => {
      props.onAnswer(props.question.id, optionId, true);
    });

    // Notify parent that question has been answered
    if (props.onSubmit) {
      props.onSubmit();
    }
  };

  const hasSelections = () => tempSelections().length > 0;

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
                  disabled={localAnswered() || props.isAnswered}
                  onChange={() => {}} // Handled by parent div click
                />
              ) : (
                <input
                  type="radio"
                  checked={isOptionSelected(option.id)}
                  disabled={localAnswered() || props.isAnswered}
                  name={`question-${props.question.id}`}
                  onChange={() => {}} // Handled by parent div click
                />
              )}
            </span>
            <span class="option-text">{option.text}</span>
          </div>
        ))}
      </div>

      {/* Submit button only shown if not already answered */}
      <Show when={!localAnswered() && !props.isAnswered}>
        <div class="submit-area">
          <button
            class="submit-btn"
            onClick={handleSubmit}
            disabled={!hasSelections()}
          >
            Submit Answer
          </button>
        </div>
      </Show>

      <Show
        when={
          (localAnswered() || props.isAnswered) && props.question.explanation
        }
      >
        <div class="explanation">
          <h4>Explanation:</h4>
          <p>{props.question.explanation}</p>
        </div>
      </Show>
    </div>
  );
}
