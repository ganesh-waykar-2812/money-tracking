import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import React from "react";
import Summary from "./Summary";

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

const TransactionList = ({ transactions, summary }) => {
  // Export to PDF handler (table format)
  const handleExportPDF = () => {
    // Landscape orientation
    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(16);
    doc.text("Transactions Summary", 14, 14);

    // Add download date and time at the top-right
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();
    doc.setFontSize(10);
    doc.text(
      `Downloaded: ${dateStr} ${timeStr}`,
      doc.internal.pageSize.getWidth() - 70,
      10
    );

    // Render summary as a table
    if (summary && Object.keys(summary).length > 0) {
      const summaryColumns = [
        { header: "Person", dataKey: "person" },
        { header: "Lend (INR)", dataKey: "lend" },
        { header: "Received (INR)", dataKey: "received" },
        { header: "Borrowed (INR)", dataKey: "borrowed" },
        { header: "Repaid (INR)", dataKey: "repaid" },
      ];
      const summaryRows = Object.entries(summary).map(([person, data]) => ({
        person,
        lend: data.lend,
        received: data.received,
        borrowed: data.borrowed,
        repaid: data.repay,
      }));

      autoTable(doc, {
        columns: summaryColumns,
        body: summaryRows,
        startY: 20,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [39, 174, 96] },
        margin: { left: 14, right: 14 },
      });
    }

    // Prepare transaction table columns and rows
    const columns = [
      { header: "Type", dataKey: "type" },
      { header: "Amount (INR)", dataKey: "amount" },
      { header: "Person", dataKey: "person" },
      { header: "Date", dataKey: "date" },
      { header: "Note", dataKey: "note" },
    ];
    const rows = transactions.map((txn) => ({
      type: txn.type.charAt(0).toUpperCase() + txn.type.slice(1),
      amount: txn.amount,
      person: txn.personId.name,
      date: new Date(txn.date).toLocaleDateString(),
      note: txn.note || "",
    }));

    // Render transactions table after summary
    if (rows.length > 0) {
      // Add heading above the transactions table
      const tableStartY = doc.lastAutoTable
        ? doc.lastAutoTable.finalY + 16
        : 40;
      doc.setFontSize(14);
      doc.text("Transactions List", 14, tableStartY - 6);

      autoTable(doc, {
        columns,
        body: rows,
        startY: tableStartY,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] },
        margin: { left: 14, right: 14 },
      });
    }

    doc.save("transactions.pdf");
  };

  return (
    <>
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 tracking-tight">
        Summary
      </h2>
      <button className="button-custom" onClick={handleExportPDF}>
        Export PDF
      </button>
      <Summary summary={summary} />
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 tracking-tight">
        Transactions List
      </h2>
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
