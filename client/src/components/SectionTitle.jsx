import styles from "./SectionTitle.module.css";

export default function SectionTitle({ first, second, as: Tag = "h1" }) {
  return (
    <Tag className={`${styles.sectionTitle} ${styles.sectionTitle}`}>
      <span className={`${styles.line} ${styles.line1}`}>{first}</span>
      <span className={`${styles.line} ${styles.line2}`}>{second}</span>
    </Tag>
  );
}