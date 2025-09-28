// SectionTitle.tsx
interface SectionTitleProps {
  first: string;
  second: string;
}

export default function SectionTitle({ first, second }: SectionTitleProps) {
  return (
    <h1
      className="mb-6 text-center leading-tight"
      style={{
        fontFamily: '"Arial Black", Arial, sans-serif',
        fontSize: "2.25rem", // 4XL
        lineHeight: "1.2"
      }}
    >
      <span style={{ display: "block", color: "black" }}>{first}</span>
      <span style={{ display: "block", color: "#00008B" }}>{second}</span>
    </h1>
  );
}