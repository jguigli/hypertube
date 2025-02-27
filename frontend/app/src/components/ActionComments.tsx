import React from "react";

interface ActionCommentsProps {
  handleClick?: () => void;
  type: string | JSX.Element;
  className?: string;
}

const ActionComments: React.FC<ActionCommentsProps> = ({ handleClick, type, className = "" }) => {
  return (
    <div className={className} onClick={handleClick}>
      {type}
    </div>
  );
};

export default ActionComments;
