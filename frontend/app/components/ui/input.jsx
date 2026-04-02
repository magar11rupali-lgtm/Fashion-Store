import React from "react";

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
}
