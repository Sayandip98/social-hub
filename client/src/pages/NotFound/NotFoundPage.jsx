import { useNavigate } from "react-router-dom";
import { Button } from "@components/ui/index.js";
import styles from "./NotFoundPage.module.css";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Page Not Found</h1>
      <p className={styles.subtitle}>
        Sorry, the page you're looking for doesn't exist or has been moved.
      </p>
      <div className={styles.actions}>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
