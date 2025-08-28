import styles from "../../../styles/common.module.css";
import pageStyles from "./page.module.css";

export default async function BoardsPage() {
  return (
    <div className={`${pageStyles.page} ${styles.page}`}>
      <main className={styles.main}></main>
    </div>
  );
}
