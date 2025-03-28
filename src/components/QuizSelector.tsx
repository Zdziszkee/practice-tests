import { createEffect, For } from "solid-js";
import { Quiz } from "../types/quiz";

interface QuizSelectorProps {
  quizzes: Quiz[];
  onSelectQuiz: (quiz: Quiz) => void;
  onDeleteQuiz: (index: number) => void;
}

export default function QuizSelector(props: QuizSelectorProps) {
  return (
    <div class="quiz-selector">
      <h2>Available Quizzes</h2>
      <p class="section-description">
        Select a quiz from your library or upload a new one
      </p>

      <div class="quiz-list">
        <For each={props.quizzes}>
          {(quiz, index) => (
            <div class="quiz-item card">
              <div
                class="quiz-item-content"
                onClick={() => props.onSelectQuiz(quiz)}
              >
                <h3>{quiz.title}</h3>
                <p class="quiz-description">
                  {quiz.description || "No description provided"}
                </p>
                <div class="quiz-meta">
                  <span class="question-count">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    {quiz.questions.length} questions
                  </span>
                </div>
              </div>
              <div class="quiz-actions">
                <button
                  class="btn-secondary"
                  onClick={() => props.onSelectQuiz(quiz)}
                >
                  Start Quiz
                </button>
                <button
                  class="btn-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      confirm(
                        `Are you sure you want to delete "${quiz.title}"? This action cannot be undone.`,
                      )
                    ) {
                      props.onDeleteQuiz(index());
                    }
                  }}
                  title="Delete Quiz"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </For>

        {props.quizzes.length === 0 && (
          <div class="empty-state">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
            <p>Loading quizzes... If none appear, try refreshing the page.</p>
          </div>
        )}
      </div>
    </div>
  );
}
