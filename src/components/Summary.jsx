import React from "react";
import { getPersonSummaryStatus } from "../utils/transactionSummaryUtils";

const Summary = ({ summary, totalOutstanding }) => {
  return (
    <div className="mb-4">
      <div className="flex justify-center mb-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full shadow text-base font-semibold bg-white border">
          <span className="text-gray-700">Total Outstanding:</span>
          <span
            className={
              totalOutstanding > 0
                ? "text-green-700 font-bold"
                : totalOutstanding < 0
                ? "text-red-700 font-bold"
                : "text-gray-700 font-bold"
            }
          >
            {totalOutstanding > 0
              ? `You should get back Rs ${totalOutstanding}`
              : totalOutstanding < 0
              ? `You should pay Rs ${-totalOutstanding}`
              : "All settled!"}
          </span>
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {Object.entries(summary).map(([person, data]) => {
          const { message, icon, color } = getPersonSummaryStatus(person, data);

          const colorClass =
            {
              green: "bg-green-100 text-green-800",
              blue: "bg-blue-100 text-blue-800",
              yellow: "bg-yellow-100 text-yellow-800",
              gray: "bg-gray-100 text-gray-800",
            }[color] || "bg-gray-100 text-gray-800";

          return (
            <div
              key={person}
              className={`flex items-center gap-2 p-2 rounded shadow ${colorClass}`}
            >
              <div className="text-2xl">
                <span role="img" aria-label="icon">
                  {icon}
                </span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-base text-black">{person}</div>
                <div className="text-sm">
                  <span className="font-medium">Lend:</span> Rs {data.lend}
                  &nbsp;|&nbsp;
                  <span className="font-medium">Received:</span> Rs{" "}
                  {data.received}
                  &nbsp;|&nbsp;
                  <span className="font-medium">Borrowed:</span>Rs{" "}
                  {data.borrowed}
                  &nbsp;|&nbsp;
                  <span className="font-medium">Repaid:</span> Rs {data.repay}
                </div>
                <div className="mt-1 text-base ">{message}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Summary;
