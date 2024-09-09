import { ReactNode } from "react";

interface SectionProps {
  children?: ReactNode;
  className?: string;
}

const Section = ({ children, className }: SectionProps) => {
  return <section className={className}>{children}</section>;
};

export default Section;
