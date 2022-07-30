import React from "react";

export default function IconRight2Left(props) {
  const { className } = props;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 48 48"
      className={className}
    >
      <path fill="#000" fill-opacity=".01" d="M0 0h48v48H0z" />
      <path
        stroke="#fff"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="4"
        d="M14 24h28M26 36 14 24l12-12M5 36V12"
      />
    </svg>
  );
}
