import React from "react";

const TransactionList = ({ transactions, dispatch }) => {
  const handleMarkReceived = (id) => {
    dispatch({ type: "MARK_RECEIVED", payload: id });
  };

  return (
    <div className="mt-6 ">
      <h2 className="text-xl font-semibold mb-2">All Transactions</h2>
      <div className="space-y-2 text-black">
        {transactions.map((txn) => (
          <div
            key={txn.id}
            className="p-3 border rounded bg-gray-50 flex justify-between items-center"
          >
            <div>
              <p>
                <strong>{txn.person}</strong> - ₹{txn.amount} ({txn.type})
              </p>
              <p className="text-sm text-gray-600">
                {txn.date} {txn.note && `- ${txn.note}`}
              </p>
            </div>
            <div>
              {txn.status === "pending" ? (
                <button
                  onClick={() => handleMarkReceived(txn.id)}
                  className="text-sm bg-green-500 text-white px-3 py-1 rounded"
                >
                  Mark Received
                </button>
              ) : (
                <span className="text-green-700 font-semibold text-sm">
                  Received
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionList;
