import { createSignal, createEffect, For, Show } from "solid-js";
import { Quiz, QuizQuestion } from "~/types/quiz";
import QuizQuestionComponent from "./QuizQuestion";
import { shuffleArray } from "~/utils/helpers";

interface QuizPlayerProps {
  quiz: Quiz;
}

export default function QuizPlayer(props: QuizPlayerProps) {
  const [questions, setQuestions] = createSignal<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = createSignal(0);
  const [answers, setAnswers] = createSignal<Record<string, string>>({});
  const [showResults, setShowResults] = createSignal(false);

  // Initialize and shuffle questions
  createEffect(() => {
    setQuestions(shuffleArray([...props.quiz.questions]));
  });

  const currentQuestion = () => questions()[currentQuestionIndex()];

  const isAnswered = (questionId: string) => questionId in answers();

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers({ ...answers(), [questionId]: optionId });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex() < questions().length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex() + 1);
    } else {
      setShowResults(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex() > 0) {
      setCurrentQuestionIndex(currentQuestionIndex() - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions().forEach((q) => {
      if (answers()[q.id] === q.correctOptionId) correct++;
    });
    return {
      correct,
      total: questions().length,
      percentage: Math.round((correct / questions().length) * 100),
    };
  };

  const resetQuiz = () => {
    setQuestions(shuffleArray([...props.quiz.questions]));
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
  };

  return (
    <div class="quiz-player">
      <Show
        when={!showResults()}
        fallback={
          <div class="quiz-results card">
            <h2>Quiz Results</h2>
            <div class="score">
              <p class="score-value">
                {calculateScore().correct} / {calculateScore().total}
              </p>
              <p class="score-percentage">{calculateScore().percentage}%</p>
            </div>

            <h3>Review Questions</h3>
            <For each={questions()}>
              {(question) => (
                <QuizQuestionComponent
                  question={question}
                  onAnswer={() => {}}
                  isAnswered={true}
                  selectedOptionId={answers()[question.id]}
                />
              )}
            </For>

            <button class="restart-btn" onClick={resetQuiz}>
              Restart Quiz
            </button>
          </div>
        }
      >
        <div class="quiz-container">
          <div class="quiz-header">
            <h2>{props.quiz.title}</h2>
            <p class="progress">
              Question {currentQuestionIndex() + 1} of {questions().length}
            </p>
          </div>

          <Show when={currentQuestion()}>
            <QuizQuestionComponent
              question={currentQuestion()}
              onAnswer={handleAnswer}
              isAnswered={isAnswered(currentQuestion().id)}
              selectedOptionId={answers()[currentQuestion().id]}
            />
          </Show>

          <div class="navigation">
            <button
              onClick={prevQuestion}
              disabled={currentQuestionIndex() === 0}
            >
              Previous
            </button>

            <button
              onClick={nextQuestion}
              disabled={!isAnswered(currentQuestion().id)}
            >
              {currentQuestionIndex() < questions().length - 1
                ? "Next"
                : "Finish"}
            </button>
          </div>
        </div>
      </Show>
    </div>
  );
}
