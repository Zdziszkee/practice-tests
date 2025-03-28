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
  // Track answers by question index and option indices
  const [answers, setAnswers] = createSignal<Record<number, number[]>>({});
  const [answeredQuestions, setAnsweredQuestions] = createSignal<Set<number>>(
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
        // Process the questions to determine if they're multiple-answer
        const processedQuestions = props.quiz.questions.map((q) => {
          // Count how many correct options there are
          const correctCount = q.options.filter(
            (option) => option.isCorrect,
          ).length;
          return {
            ...q,
            multipleAnswer: correctCount > 1,
          };
        });

        setQuestions(shuffleArray([...processedQuestions]));
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

  const isAnswered = (questionIndex: number) => {
    return answeredQuestions().has(questionIndex);
  };

  const handleAnswer = (
    questionIndex: number,
    optionIndex: number,
    isChecked: boolean,
  ) => {
    const question = questions()[questionIndex];
    if (!question) return;

    const currentAnswers = answers()[questionIndex] || [];

    if (question.multipleAnswer) {
      // For multiple choice: toggle the selection
      let updatedAnswers = [...currentAnswers];

      if (isChecked && !updatedAnswers.includes(optionIndex)) {
        updatedAnswers.push(optionIndex);
      } else if (!isChecked) {
        updatedAnswers = updatedAnswers.filter((idx) => idx !== optionIndex);
      }

      setAnswers({ ...answers(), [questionIndex]: updatedAnswers });
    } else {
      // For single choice: replace existing answer
      setAnswers({ ...answers(), [questionIndex]: [optionIndex] });
    }
  };

  const handleQuestionSubmit = () => {
    const qIndex = currentQuestionIndex();

    // Mark this question as answered
    const newAnsweredQuestions = new Set(answeredQuestions());
    newAnsweredQuestions.add(qIndex);
    setAnsweredQuestions(newAnsweredQuestions);
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
    let total = 0;

    questions().forEach((q, qIndex) => {
      total++;
      const userAnswers = answers()[qIndex] || [];

      // Get all correct option indices
      const correctOptionIndices = q.options
        .map((opt, idx) => (opt.isCorrect ? idx : -1))
        .filter((idx) => idx !== -1);

      // For a question to be correct:
      // 1. All correct options must be selected
      // 2. No incorrect options can be selected
      const allCorrectSelected = correctOptionIndices.every((idx) =>
        userAnswers.includes(idx),
      );
      const noIncorrectSelected = userAnswers.every((idx) =>
        correctOptionIndices.includes(idx),
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
    setQuestions(shuffleArray([...props.quiz.questions]));
    setCurrentQuestionIndex(0);
    setAnswers({});
    setAnsweredQuestions(new Set<number>());
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
                {(question, index) => (
                  <QuizQuestionComponent
                    question={question}
                    questionIndex={index()}
                    onAnswer={() => {}}
                    isAnswered={true}
                    selectedIndices={answers()[index()] || []}
                  />
                )}
              </For>

              <button class="restart-btn" onClick={resetQuiz}>
                Restart Quiz
              </button>
            </div>
          }
        >
          <div class="quiz-header">
            <h2>{props.quiz.title}</h2>
            <p class="progress">
              Question {currentQuestionIndex() + 1} of {questions().length}
            </p>
            <div class="progress-bar">
              <div
                class="progress-indicator"
                style={{
                  width: `${((currentQuestionIndex() + 1) / questions().length) * 100}%`,
                }}
              ></div>
            </div>

            {currentQuestion() ? (
              <QuizQuestionComponent
                question={currentQuestion()!}
                questionIndex={currentQuestionIndex()}
                onAnswer={handleAnswer}
                isAnswered={isAnswered(currentQuestionIndex())}
                selectedIndices={answers()[currentQuestionIndex()] || []}
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
                    !currentQuestion() || !isAnswered(currentQuestionIndex())
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
