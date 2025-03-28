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
              <a href="/practice-tests">Quiz App</a>
            </div>
          </header>
          <Suspense fallback={<div class="loading-screen">Loading...</div>}>
            {props.children}
          </Suspense>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
