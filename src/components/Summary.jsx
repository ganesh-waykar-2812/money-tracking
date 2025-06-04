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
      <h2 className="text-xl font-semibold mb-2">Summary</h2>
      {Object.entries(summaryByPerson).map(([person, data]) => {
        const lendRemaining = data.lend - data.received;
        const borrowRemaining = data.borrowed - data.repay;
        let message = "";
        if (lendRemaining === 0 && borrowRemaining === 0) {
          message = "All settled!";
        } else if (borrowRemaining < lendRemaining) {
          message = `${person} should pay you ₹${
            lendRemaining - borrowRemaining
          }`;
        } else if (borrowRemaining > lendRemaining) {
          message = `You should pay ₹${
            borrowRemaining - lendRemaining
          } to ${person}.`;
        } else if (lendRemaining === borrowRemaining) {
          message = `${person} and you have equal lend and borrow amounts.`;
        }

        return (
          <div key={person} className="bg-gray-100 p-3 rounded mb-2 text-black">
            <p>
              <strong>{person}</strong>
            </p>
            <p className="text-sm">
              Lend: ₹{data.lend}, Received: ₹{data.received}, Remaining: ₹
              {lendRemaining}
            </p>
            <p className="text-sm">
              Borrowed: ₹{data.borrowed}, Repay: ₹{data.repay}, Remaining: ₹
              {borrowRemaining}
            </p>

            <p className="text-sm">{message}</p>
          </div>
        );
      })}
    </div>
  );
};

export default Summary;
