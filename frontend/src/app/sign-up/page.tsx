"use client";

import styles from "../styles/common.module.css";
import pageStyles from "./page.module.css";
import SignUp from "./SignUp";

export default function SignUpPage() {
  return (
    <div className={`${pageStyles.page} ${styles.page}`}>
      <main className={styles.main}>
        <SignUp />
      </main>
    </div>
  );
}
