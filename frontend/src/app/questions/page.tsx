// src/app/questions/page.tsx

import QuestionsDashboard from "./QuestionsDashboard";
import { fetchAllQuestions } from "../lib/serverQueries";
import styles from "../styles/common.module.css";
import pageStyles from "./page.module.css";

export default async function QuestionsPage() {
  const questions = await fetchAllQuestions();

  return (
    <div className={`${pageStyles.page} ${styles.page}`}>
      <main className={styles.main}>
        <QuestionsDashboard questions={questions} />
      </main>
    </div>
  );
}
