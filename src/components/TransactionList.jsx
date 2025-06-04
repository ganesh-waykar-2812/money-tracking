import React from "react";

const typeDetails = {
  lend: {
    label: (txn) => `You lent ₹${txn.amount} to ${txn.personId.name}`,
    color: "bg-blue-100 text-blue-800",
    icon: (
      <span role="img" aria-label="Lend">
        💸
      </span>
    ),
  },
  borrowed: {
    label: (txn) => `You borrowed ₹${txn.amount} from ${txn.personId.name}`,
    color: "bg-yellow-100 text-yellow-800",
    icon: (
      <span role="img" aria-label="Borrowed">
        🤝
      </span>
    ),
  },
  received: {
    label: (txn) => `You received ₹${txn.amount} from ${txn.personId.name}`,
    color: "bg-green-100 text-green-800",
    icon: (
      <span role="img" aria-label="Received">
        🟢
      </span>
    ),
  },
  repay: {
    label: (txn) => `You repaid ₹${txn.amount} to ${txn.personId.name}`,
    color: "bg-red-100 text-red-800",
    icon: (
      <span role="img" aria-label="Repay">
        🔴
      </span>
    ),
  },
};

const TransactionList = ({ transactions }) => {
  return (
    <>
      <h2 className="text-xl font-semibold mb-2">All Transactions</h2>
      <div className="bg-white p-4 rounded shadow text-black">
        <ul className="space-y-3">
          {transactions.map((txn) => {
            const details = typeDetails[txn.type] || {};
            return (
              <li
                key={txn._id}
                className={`flex items-center gap-3 p-3 rounded ${
                  details.color || "bg-gray-100 text-gray-800"
                }`}
              >
                <span className="text-xl">{details.icon}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium">
                    {details.label ? details.label(txn) : "Transaction"}
                  </div>
                  <div className="text-xs text-gray-600">
                    {new Date(txn.date).toLocaleDateString()}
                    {txn.note ? ` • ${txn.note}` : ""}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
};

export default TransactionList;
