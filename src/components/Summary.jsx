import React from "react";

const Summary = ({ transactions }) => {
  const summaryByPerson = {};

  transactions.forEach((txn) => {
    const { personId } = txn;
    const { name } = personId;

    if (!summaryByPerson[name]) {
      summaryByPerson[name] = { lend: 0, borrowed: 0, received: 0, repay: 0 };
    }

    if (txn.type === "lend") {
      summaryByPerson[name].lend += txn.amount;
    } else if (txn.type === "borrowed") {
      summaryByPerson[name].borrowed += txn.amount;
    } else if (txn.type === "received") {
      summaryByPerson[name].received += txn.amount;
    } else if (txn.type === "repay") {
      summaryByPerson[name].repay += txn.amount;
    }
  });

  return (
    <div className="mb-4">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 tracking-tight">
        Summary
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(summaryByPerson).map(([person, data]) => {
          const lendRemaining = data.lend - data.received;
          const borrowRemaining = data.borrowed - data.repay;
          let message = "";
          let icon = null;
          let color = "";

          if (lendRemaining === 0 && borrowRemaining === 0) {
            message = "All settled!";
            icon = (
              <span role="img" aria-label="Settled">
                ✅
              </span>
            );
            color = "bg-green-100 text-green-800";
          } else if (borrowRemaining < lendRemaining) {
            message = `${person} should pay you ₹${
              lendRemaining - borrowRemaining
            }`;
            icon = (
              <span role="img" aria-label="Receive">
                💰
              </span>
            );
            color = "bg-blue-100 text-blue-800";
          } else if (borrowRemaining > lendRemaining) {
            message = `You should pay ₹${
              borrowRemaining - lendRemaining
            } to ${person}`;
            icon = (
              <span role="img" aria-label="Pay">
                💸
              </span>
            );
            color = "bg-yellow-100 text-yellow-800";
          } else if (lendRemaining === borrowRemaining) {
            message = `${person} and you have equal lend and borrow amounts.`;
            icon = (
              <span role="img" aria-label="Equal">
                🤝
              </span>
            );
            color = "bg-gray-100 text-gray-800";
          }

          return (
            <div
              key={person}
              className={`flex items-center gap-4 p-4 rounded shadow ${color}`}
            >
              <div className="text-2xl">{icon}</div>
              <div className="flex-1">
                <div className="font-semibold text-lg">{person}</div>
                <div className="text-sm">
                  <span className="font-medium">Lend:</span> ₹{data.lend}{" "}
                  &nbsp;|&nbsp;
                  <span className="font-medium">Received:</span> ₹
                  {data.received} &nbsp;|&nbsp;
                  <span className="font-medium">Borrowed:</span> ₹
                  {data.borrowed} &nbsp;|&nbsp;
                  <span className="font-medium">Repaid:</span> ₹{data.repay}
                </div>
                <div className="mt-1 text-base font-medium">{message}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Summary;
