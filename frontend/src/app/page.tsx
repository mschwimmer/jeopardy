import styles from "./page.module.css";
import { Typography } from "@mui/material";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className={styles.page}>
      <header>
        <Typography variant="h1">The Trivia Game</Typography>
      </header>
      <main className={styles.main}>
        <Typography variant="h1">
          <Link href={`/sign-in`}>Sign-In</Link>
        </Typography>
      </main>
      <footer className={styles.footer}>
        The best Jeopardy app you&apos;ve ever laid your eggs in - John F.
        Kennedy
      </footer>
    </div>
  );
}
