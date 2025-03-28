import { createSignal, Show, createEffect } from "solid-js";
import { QuizQuestion as QuizQuestionType, QuizOption } from "../types/quiz";
import { shuffleArray } from "../utils/helpers";

interface QuizQuestionProps {
  question: QuizQuestionType;
  questionIndex: number;
  onAnswer: (
    questionIndex: number,
    optionIndex: number,
    isChecked: boolean,
  ) => void;
  isAnswered: boolean;
  selectedIndices?: number[];
  onSubmit?: () => void;
}

export default function QuizQuestion(props: QuizQuestionProps) {
  const [options, setOptions] = createSignal<
    { option: QuizOption; originalIndex: number }[]
  >([]);
  const [tempSelections, setTempSelections] = createSignal<number[]>(
    props.selectedIndices || [],
  );
  const [localAnswered, setLocalAnswered] = createSignal(false);

  // Reset tempSelections when question changes
  createEffect(() => {
    if (props.questionIndex !== undefined) {
      setTempSelections(props.selectedIndices || []);
      setLocalAnswered(props.isAnswered);
    }
  });

  // Shuffle options while preserving original indices
  createEffect(() => {
    if (props.question && Array.isArray(props.question.options)) {
      const originalOptions = props.question.options.map((opt, idx) => ({
        option: opt,
        originalIndex: idx,
      }));
      setOptions(shuffleArray([...originalOptions]));
    }
  });

  const isOptionSelected = (index: number) => {
    return tempSelections().includes(index);
  };

  const getOptionClass = (option: QuizOption, originalIndex: number) => {
    if (!localAnswered() && !props.isAnswered) return "";

    // When answered, highlight all correct options
    if (localAnswered() || props.isAnswered) {
      if (option.isCorrect) {
        return isOptionSelected(originalIndex) ? "correct" : "missed-correct";
      } else if (isOptionSelected(originalIndex)) {
        return "incorrect";
      }
    }

    return "";
  };

  const handleOptionClick = (originalIndex: number) => {
    if (localAnswered() || props.isAnswered) return;

    const isSelected = isOptionSelected(originalIndex);

    if (props.question.multipleAnswer) {
      // Toggle selection for multiple choice
      if (isSelected) {
        setTempSelections(
          tempSelections().filter((idx) => idx !== originalIndex),
        );
      } else {
        setTempSelections([...tempSelections(), originalIndex]);
      }
    } else {
      // Single choice - replace selection
      setTempSelections([originalIndex]);
    }
  };

  const handleSubmit = () => {
    setLocalAnswered(true);

    // Send all selections to parent
    tempSelections().forEach((optionIndex) => {
      props.onAnswer(props.questionIndex, optionIndex, true);
    });

    // Notify parent that question has been answered
    if (props.onSubmit) {
      props.onSubmit();
    }
  };

  const hasSelections = () => tempSelections().length > 0;

  // Create option labels (A, B, C, D, etc.)
  const getOptionLabel = (index: number) => {
    return String.fromCharCode(65 + index); // 65 is ASCII for 'A'
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
        {options().map((item, displayIndex) => (
          <div
            class={`option ${getOptionClass(item.option, item.originalIndex)} ${props.question.multipleAnswer ? "checkbox-style" : "radio-style"}`}
            onClick={() => handleOptionClick(item.originalIndex)}
          >
            <span class="option-label">{getOptionLabel(displayIndex)}</span>
            <span class="option-indicator">
              {props.question.multipleAnswer ? (
                <input
                  type="checkbox"
                  checked={isOptionSelected(item.originalIndex)}
                  disabled={localAnswered() || props.isAnswered}
                  onChange={() => {}} // Handled by parent div click
                />
              ) : (
                <input
                  type="radio"
                  checked={isOptionSelected(item.originalIndex)}
                  disabled={localAnswered() || props.isAnswered}
                  name={`question-${props.questionIndex}`}
                  onChange={() => {}} // Handled by parent div click
                />
              )}
            </span>
            <span class="option-text">{item.option.text}</span>
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
