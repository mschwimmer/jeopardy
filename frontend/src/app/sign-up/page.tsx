"use client";

import styles from "./page.module.css";
import SignUp from "./SignUp";

export default function SignUpPage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <SignUp />
      </main>
    </div>
  );
}
