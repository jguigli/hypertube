import React, { JSX } from "react";

interface ActionCommentsProps {
  handleClick?: () => void;
  type: string | JSX.Element;
  className?: string;
  style?: React.CSSProperties;
}

const ActionComments: React.FC<ActionCommentsProps> = ({ handleClick, type, className = "" }) => {
  return (
    <div className={className} onClick={handleClick}>
      {type}
    </div>
  );
};

export default ActionComments;
