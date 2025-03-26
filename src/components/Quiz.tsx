import { createSignal, createEffect, Show } from "solid-js";
import type { QuizStore } from "../stores/quizStore";
import QuestionComponent from "./Question";

interface QuizProps {
  store: QuizStore;
  onExit: () => void;
}

export default function Quiz(props: QuizProps) {
  const [quizCompleted, setQuizCompleted] = createSignal(false);
  const [showExplanation, setShowExplanation] = createSignal(false);

  const currentQuestion = () => props.store.getCurrentQuestion();

  const handleNext = () => {
    if (showExplanation()) {
      setShowExplanation(false);
      if (!props.store.nextQuestion()) {
        setQuizCompleted(true);
      }
    } else {
      setShowExplanation(true);
    }
  };

  const handlePrev = () => {
    setShowExplanation(false);
    props.store.prevQuestion();
  };

  return (
    <div class="quiz-container">
      <header class="quiz-header">
        <h1>{props.store.currentQuiz()?.title}</h1>
        <p>{props.store.currentQuiz()?.description}</p>
      </header>

      <Show
        when={!quizCompleted()}
        fallback={<QuizResults store={props.store} onExit={props.onExit} />}
      >
        <div class="question-progress">
          Question {props.store.currentQuestionIndex() + 1} of{" "}
          {props.store.currentQuiz()?.questions.length}
        </div>

        {currentQuestion() && (
          <QuestionComponent
            question={currentQuestion()!}
            store={props.store}
            showExplanation={showExplanation()}
          />
        )}

        <div class="quiz-controls">
          <button
            class="quiz-button secondary"
            onClick={handlePrev}
            disabled={props.store.currentQuestionIndex() === 0}
          >
            Previous
          </button>

          <button class="quiz-button primary" onClick={handleNext}>
            {showExplanation()
              ? props.store.currentQuestionIndex() <
                (props.store.currentQuiz()?.questions.length || 0) - 1
                ? "Next Question"
                : "See Results"
              : "Check Answer"}
          </button>
        </div>
      </Show>
    </div>
  );
}

function QuizResults(props: { store: QuizStore; onExit: () => void }) {
  const score = props.store.getScore();
  const percentage = Math.round((score.correct / score.total) * 100);

  return (
    <div class="quiz-results">
      <h2>Quiz Completed!</h2>

      <div class="score-container">
        <div class="score">
          <span class="score-value">{score.correct}</span>
          <span class="score-total">/{score.total}</span>
        </div>
        <div class="percentage">{percentage}%</div>
      </div>

      <p class="result-message">
        {percentage >= 80
          ? "Great job!"
          : percentage >= 60
            ? "Good effort!"
            : "Keep practicing!"}
      </p>

      <div class="result-buttons">
        <button class="quiz-button primary" onClick={props.onExit}>
          Choose Another Quiz
        </button>
      </div>
    </div>
  );
}
