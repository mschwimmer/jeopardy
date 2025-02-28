"use client";

import styles from "../styles/common.module.css";
import pageStyles from "./page.module.css";
import SignIn from "./SignIn";

export default function SignInPage() {
  return (
    <div className={`${pageStyles.page} ${styles.page}`}>
      <main className={styles.main}>
        <SignIn />
      </main>
    </div>
  );
}
