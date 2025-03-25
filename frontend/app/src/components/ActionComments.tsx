import React, { JSX } from "react";
import { Button } from "@mui/material";

interface ActionCommentsProps {
  handleClick?: () => void;
  type: string | JSX.Element;
  className?: string;
  style?: React.CSSProperties;
  variant?: "text" | "contained" | "outlined";
  color? : "primary" | "secondary" | "default" | "error" | "success" | "warning";
}

const ActionComments: React.FC<ActionCommentsProps> = ({ handleClick, type, className = "", variant ="contained", color="primary" }) => {
  return (
    <Button variant={variant} color={color} onClick={handleClick} className={className}>
      {type}
    </Button>
  );
};

export default ActionComments;
