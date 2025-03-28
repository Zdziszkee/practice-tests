// practice-tests/src/app.tsx
import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";

export default function App() {
  return (
    <Router
      base="/practice-tests"
      root={(props) => (
        <MetaProvider>
          <Title>Quiz App</Title>
          <header>
            <div class="header-content">
              <a href="/practice-tests" class="logo">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                <span>Quiz App</span>
              </a>
            </div>
          </header>
          <Suspense
            fallback={
              <div class="loading-screen">Loading quiz application...</div>
            }
          >
            {props.children}
          </Suspense>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
