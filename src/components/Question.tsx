import { createSignal, createEffect } from "solid-js";
import type { Question } from "../models/quiz";
import type { QuizStore } from "../stores/quizStore";

interface QuestionProps {
  question: Question;
  store: QuizStore;
  showExplanation: boolean;
}

export default function QuestionComponent(props: QuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = createSignal<string | null>(
    props.store.userAnswers()[props.question.id] || null,
  );

  const isCorrect = () => {
    if (!selectedAnswer()) return false;
    const correctAnswer =
      typeof props.question.correctAnswer === "number"
        ? props.question.options[props.question.correctAnswer]
        : props.question.correctAnswer;
    return selectedAnswer() === correctAnswer;
  };

  createEffect(() => {
    if (selectedAnswer()) {
      props.store.saveAnswer(props.question.id, selectedAnswer()!);
    }
  });

  return (
    <div class="question-container">
      <h3 class="question-text">{props.question.text}</h3>

      <div class="options-container">
        {props.question.options.map((option, index) => (
          <button
            class={`option-button ${selectedAnswer() === option ? "selected" : ""}
                   ${
                     props.showExplanation && selectedAnswer() === option
                       ? isCorrect()
                         ? "correct"
                         : "incorrect"
                       : ""
                   }`}
            onClick={() => setSelectedAnswer(option)}
            disabled={props.showExplanation}
          >
            {option}
          </button>
        ))}
      </div>

      {props.showExplanation && props.question.explanation && (
        <div class={`explanation ${isCorrect() ? "correct" : "incorrect"}`}>
          <p>{props.question.explanation}</p>
        </div>
      )}
    </div>
  );
}
