import React from "react";

function Heading({ headingText }) {
  return (
    <h2 className="text-xl font-semibold mb-4 text-gray-900 tracking-tight">
      {headingText}
    </h2>
  );
}

export default Heading;
