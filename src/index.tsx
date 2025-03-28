import { Component, createSignal } from "solid-js";
import "./app.css";

// Define the interface for a Question
interface Question {
  id: number;
  text: string;
  options: Record<string, boolean>;
}

const Quiz: Component = () => {
  // State management with signals
  const [questions, setQuestions] = createSignal<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = createSignal(0);
  const [selectedAnswer, setSelectedAnswer] = createSignal<string | null>(null);
  const [showAnswer, setShowAnswer] = createSignal(false);
  const [shuffledOptions, setShuffledOptions] = createSignal<string[]>([]);
  const [error, setError] = createSignal<string | null>(null);

  // Shuffle function to randomize arrays
  const shuffleArray = (array: any[]) => {
    return array.sort(() => Math.random() - 0.5);
  };

  // Get the correct answer from options
  const getCorrectAnswer = (options: Record<string, boolean>) => {
    return (
      Object.entries(options).find(([_, isCorrect]) => isCorrect)?.[0] || ""
    );
  };

  // Handle JSON file upload
  const handleFileUpload = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          if (!Array.isArray(json) || json.length === 0) {
            throw new Error("Invalid JSON format");
          }
          const shuffledQuestions = shuffleArray([...json]);
          setQuestions(shuffledQuestions);
          setShuffledOptions(
            shuffleArray(Object.keys(shuffledQuestions[0].options)),
          );
          setError(null);
        } catch (err) {
          setError("Invalid JSON file. Please upload a valid question set.");
          setQuestions([]);
        }
      };
      reader.readAsText(input.files[0]);
    }
  };

  // Handle answer selection
  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setShowAnswer(true);
  };

  // Move to the next question
  const nextQuestion = () => {
    setShowAnswer(false);
    setSelectedAnswer(null);
    const next = currentQuestion() + 1;
    if (next < questions().length) {
      setCurrentQuestion(next);
      setShuffledOptions(shuffleArray(Object.keys(questions()[next].options)));
    }
  };

  // JSX for rendering the quiz
  return (
    <div class="container">
      {!questions().length ? (
        <div class="upload-section">
          <h1 class="title">Grok 3 Quiz</h1>
          {error() && <p class="error">{error()}</p>}
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            class="file-input"
          />
          <div>
            <p>Upload a JSON file with this format:</p>
            <pre>{`[
            {
              "id": 1,
              "text": "What is the capital of France?",
              "options": {
                "Paris": true,
                "London": false,
                "Berlin": false,
                "Madrid": false
              }
            }
          ]`}</pre>
          </div>
        </div>
      ) : (
        <div class="quiz-container">
          <h1 class="title">Grok 3 Quiz</h1>
          <div class="progress-bar">
            <div
              class="progress"
              style={{
                width: `${((currentQuestion() + 1) / questions().length) * 100}%`,
              }}
            ></div>
          </div>
          <div class="question-card">
            <p class="question-number">
              Question {currentQuestion() + 1} of {questions().length}
            </p>
            <h2 class="question-text">{questions()[currentQuestion()].text}</h2>
            <div class="options">
              {shuffledOptions().map((option) => (
                <label class="option-label">
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={selectedAnswer() === option}
                    onChange={() => handleAnswerSelect(option)}
                    disabled={showAnswer()}
                  />
                  <span
                    class={`option-text ${
                      showAnswer() &&
                      questions()[currentQuestion()].options[option]
                        ? "correct"
                        : showAnswer() && selectedAnswer() === option
                          ? "incorrect"
                          : ""
                    }`}
                  >
                    {option}
                  </span>
                </label>
              ))}
            </div>
            {showAnswer() && (
              <div class="answer-feedback">
                <p>
                  Correct Answer:{" "}
                  {getCorrectAnswer(questions()[currentQuestion()].options)}
                </p>
                <button class="next-button" onClick={nextQuestion}>
                  {currentQuestion() < questions().length - 1
                    ? "Next Question"
                    : "Finish"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;
