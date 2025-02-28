import styles from "./styles/common.module.css";
import pageStyles from "./page.module.css";
import { Typography, Box, Button } from "@mui/material";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className={`${pageStyles.page} ${styles.page}`}>
      <header>
        <Typography variant="h1">Trivia Friends</Typography>
      </header>
      <main className={styles.main}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          <Typography variant="h4" gutterBottom>
            Maybe the real friends were the trivia we made along the way.
          </Typography>
          <p>Wait that can&apos;t be right... anyway:</p>
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={Link}
            href="/sign-in"
            sx={{
              borderRadius: 2,
              padding: "12px 30px",
              fontSize: "1.2rem",
              textTransform: "none",
            }}
          >
            Sign In
          </Button>
        </Box>
      </main>

      <footer className={styles.footer}>
        The best Jeopardy app you&apos;ve ever laid your eggs in - John F.
        Kennedy
      </footer>
    </div>
  );
}
