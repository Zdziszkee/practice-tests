// practice-tests/src/components/QuizPlayer.tsx
import { createSignal, createEffect, For, Show } from "solid-js";
import { Quiz, QuizQuestion } from "../types/quiz";
import QuizQuestionComponent from "./QuizQuestion";
import { shuffleArray } from "../utils/helpers";

interface QuizPlayerProps {
  quiz: Quiz;
}

export default function QuizPlayer(props: QuizPlayerProps) {
  const [questions, setQuestions] = createSignal<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = createSignal(0);
  const [answers, setAnswers] = createSignal<Record<string, string[]>>({});
  const [answeredQuestions, setAnsweredQuestions] = createSignal<Set<string>>(
    new Set(),
  );
  const [showResults, setShowResults] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // Initialize and shuffle questions
  createEffect(() => {
    try {
      if (
        props.quiz &&
        Array.isArray(props.quiz.questions) &&
        props.quiz.questions.length > 0
      ) {
        // Process questions to ensure multipleAnswer flag is set
        const processedQuestions = props.quiz.questions.map((q) => {
          return {
            ...q,
            multipleAnswer:
              Array.isArray(q.correctOptionIds) &&
              q.correctOptionIds.length > 1,
          };
        });

        setQuestions(shuffleArray(processedQuestions));
        setError(null);
      } else {
        setError("Invalid quiz format or no questions found");
      }
    } catch (err) {
      setError(
        `Error processing quiz: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  });

  const currentQuestion = () => {
    const questionsArray = questions();
    if (
      questionsArray.length > 0 &&
      currentQuestionIndex() < questionsArray.length
    ) {
      return questionsArray[currentQuestionIndex()];
    }
    return null;
  };

  const isAnswered = (questionId: string) => {
    return answeredQuestions().has(questionId);
  };

  const handleAnswer = (
    questionId: string,
    optionId: string,
    isChecked: boolean,
  ) => {
    const question = questions().find((q) => q.id === questionId);
    if (!question) return;

    const currentAnswers = answers()[questionId] || [];

    if (question.multipleAnswer) {
      // For multiple choice: toggle the selection
      let updatedAnswers = [...currentAnswers];

      if (isChecked && !updatedAnswers.includes(optionId)) {
        updatedAnswers.push(optionId);
      } else if (!isChecked) {
        updatedAnswers = updatedAnswers.filter((id) => id !== optionId);
      }

      setAnswers({ ...answers(), [questionId]: updatedAnswers });
    } else {
      // For single choice: replace existing answer
      setAnswers({ ...answers(), [questionId]: [optionId] });
    }
  };

  const handleQuestionSubmit = () => {
    const question = currentQuestion();
    if (question) {
      // Mark this question as answered
      const newAnsweredQuestions = new Set(answeredQuestions());
      newAnsweredQuestions.add(question.id);
      setAnsweredQuestions(newAnsweredQuestions);
    }
  };

  const nextQuestion = () => {
    const current = currentQuestion();
    if (!current) return;

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
    let total = 0;

    questions().forEach((q) => {
      total++;
      const userAnswers = answers()[q.id] || [];

      // For a question to be correct:
      // 1. All correct options must be selected
      // 2. No incorrect options can be selected
      const allCorrectSelected = q.correctOptionIds.every((id) =>
        userAnswers.includes(id),
      );
      const noIncorrectSelected = userAnswers.every((id) =>
        q.correctOptionIds.includes(id),
      );

      if (allCorrectSelected && noIncorrectSelected) {
        correct++;
      }
    });

    return {
      correct,
      total,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
    };
  };

  const resetQuiz = () => {
    setQuestions(shuffleArray([...props.quiz.questions] as QuizQuestion[]));
    setCurrentQuestionIndex(0);
    setAnswers({});
    setAnsweredQuestions(new Set<string>());
    setShowResults(false);
  };

  return (
    <div class="quiz-player">
      <Show
        when={!error()}
        fallback={
          <div class="error-message card">
            <h3>Error</h3>
            <p>{error()}</p>
          </div>
        }
      >
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
                    selectedOptionIds={answers()[question.id] || []}
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

            {/* Don't use accessor pattern here - just render conditionally */}
            {currentQuestion() ? (
              <QuizQuestionComponent
                question={currentQuestion()!}
                onAnswer={handleAnswer}
                isAnswered={isAnswered(currentQuestion()!.id)}
                selectedOptionIds={answers()[currentQuestion()!.id] || []}
                onSubmit={handleQuestionSubmit}
              />
            ) : (
              <div>Loading question...</div>
            )}

            {currentQuestion() && (
              <div class="navigation">
                <button
                  onClick={prevQuestion}
                  disabled={currentQuestionIndex() === 0}
                >
                  Previous
                </button>

                <button
                  onClick={nextQuestion}
                  disabled={
                    !currentQuestion() || !isAnswered(currentQuestion()!.id)
                  }
                >
                  {currentQuestionIndex() < questions().length - 1
                    ? "Next"
                    : "Finish"}
                </button>
              </div>
            )}
          </div>
        </Show>
      </Show>
    </div>
  );
}
