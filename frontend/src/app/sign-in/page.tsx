"use client";

import styles from "./page.module.css";
import SignIn from "./SignIn";

export default function SignInPage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <SignIn />
      </main>
    </div>
  );
}
