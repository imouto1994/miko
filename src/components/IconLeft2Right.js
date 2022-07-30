import React from "react";

export default function IconLeft2Right(props) {
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
        d="M34 24H6m16-12 12 12-12 12m20-24v24"
      />
    </svg>
  );
}
