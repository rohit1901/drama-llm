import React from "react";

interface CodeProps {
  children?: React.ReactNode;
  className?: string;
}

const Code: React.FC<CodeProps> = ({ children, className }) => {
  return (
    <code className={className} style={{ textWrap: "pretty" }}>
      {children}
    </code>
  );
};

export default Code;
