import React from "react";

/**
 * Component to safely display a name.
 *
 * @param props - Component props.
 * @param props.name - The name to display.
 * @returns A span element displaying the name or a fallback.
 */
export const SafeNameDisplay: React.FC<{ name?: string }> = ({
  name = "Unknown Name",
}) => {
  return <span>{name}</span>;
};

export default SafeNameDisplay;
