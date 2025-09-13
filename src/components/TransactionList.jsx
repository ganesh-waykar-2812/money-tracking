import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import React, { useEffect, useMemo, useState } from "react";
import Summary from "./Summary";
import { Button } from "./reusable/Button";
import Dropdown from "./reusable/Dropdown";
import Modal from "./reusable/Modal";
import TextInput from "./reusable/TextInput";
import AddTransactionForm from "./AddTransactionForm";
import {
  addPerson,
  addTransaction,
  deleteTransaction,
  getPeople,
  getTransactions,
  updateTransaction,
} from "../services/api";
import LoadingPopup from "./reusable/LoadingPopup";
import { getPersonSummaryStatus } from "../utils/transactionSummaryUtils";
import { FaEdit, FaTrash } from "react-icons/fa";
import MessageModal from "./reusable/MessageModal";

const typeDetails = {
  lend: {
    label: (txn) => `You lent Rs ${txn.amount} to ${txn.personId.name}`,
    color: "bg-blue-100 text-blue-800",
    icon: (
      <span role="img" aria-label="Lend">
        💸
      </span>
    ),
  },
  borrowed: {
    label: (txn) => `You borrowed Rs ${txn.amount} from ${txn.personId.name}`,
    color: "bg-yellow-100 text-yellow-800",
    icon: (
      <span role="img" aria-label="Borrowed">
        🤝
      </span>
    ),
  },
  received: {
    label: (txn) => `You received Rs ${txn.amount} from ${txn.personId.name}`,
    color: "bg-green-100 text-green-800",
    icon: (
      <span role="img" aria-label="Received">
        🟢
      </span>
    ),
  },
  repay: {
    label: (txn) => `You repaid Rs ${txn.amount} to ${txn.personId.name}`,
    color: "bg-red-100 text-red-800",
    icon: (
      <span role="img" aria-label="Repay">
        🔴
      </span>
    ),
  },
};

const TransactionList = () => {
  // Local state for modals
  const [isTxnModalOpen, setIsTxnModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [personName, setPersonName] = useState("");
  const [form, setForm] = useState({
    personId: "",
    amount: "",
    type: "",
    note: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [people, setPeople] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filterPerson, setFilterPerson] = useState({ _id: "", name: "" });
  const [filterType, setFilterType] = useState({ _id: "", name: "" });
  const [msgModal, setMsgModal] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);
  const [deleteTransactionId, setDeleteTransactionId] = useState(null);

  const filteredTxns = useMemo(() => {
    return transactions.filter((txn) => {
      // Filter by person if a specific person is selected
      if (
        filterPerson &&
        filterPerson._id &&
        txn.personId._id !== filterPerson._id &&
        filterPerson._id !== "all"
      ) {
        return false;
      }

      // Filter by type if a specific type is selected
      if (
        filterType &&
        filterType._id &&
        txn.type !== filterType._id &&
        filterType._id !== "all"
      ) {
        return false;
      }

      // Include the transaction if it passes all filters
      return true;
    });
  }, [transactions, filterPerson, filterType]);

  // Export to PDF handler (table format)
  const handleExportPDF = () => {
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

    // Render filtered summary as a table
    if (filteredSummary && Object.keys(filteredSummary).length > 0) {
      // Then add a "Status" column to your summaryColumns if desired
      const summaryColumns = [
        { header: "Person", dataKey: "person" },
        { header: "Lend (Rs)", dataKey: "lend" },
        { header: "Received (Rs)", dataKey: "received" },
        { header: "Borrowed (Rs)", dataKey: "borrowed" },
        { header: "Repaid (Rs)", dataKey: "repaid" },
        { header: "Outstanding", dataKey: "outstanding" },
        { header: "Status", dataKey: "status" },
      ];
      const summaryRows = Object.entries(filteredSummary).map(
        ([person, data]) => {
          const { message } = getPersonSummaryStatus(person, data);
          const outstanding =
            data.lend - data.received - data.borrowed + data.repay;
          return {
            person,
            lend: data.lend,
            received: data.received,
            borrowed: data.borrowed,
            repaid: data.repay,
            outstanding,
            status: message,
          };
        }
      );

      // Add a total row
      summaryRows.push({
        person: "Total Outstanding",
        lend: "",
        received: "",
        borrowed: "",
        repaid: "",
        outstanding: totalOutstanding,
        status:
          totalOutstanding > 0
            ? `You should get back Rs ${totalOutstanding}`
            : totalOutstanding < 0
            ? `You should pay Rs ${-totalOutstanding}`
            : "All settled!",
      });

      autoTable(doc, {
        columns: summaryColumns,
        body: summaryRows,
        startY: 20,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [39, 174, 96] },
        margin: { left: 14, right: 14 },
      });
    }

    // Prepare filtered transaction table columns and rows
    const columns = [
      { header: "Type", dataKey: "type" },
      { header: "Amount (Rs)", dataKey: "amount" },
      { header: "Person", dataKey: "person" },
      { header: "Date", dataKey: "date" },
      { header: "Note", dataKey: "note" },
    ];
    const rows = filteredTxns.map((txn) => ({
      type: txn.type.charAt(0).toUpperCase() + txn.type.slice(1),
      amount: txn.amount,
      person: txn.personId.name,
      date: new Date(txn.date).toLocaleDateString(),
      note: txn.note || "",
    }));

    // Render transactions table after summary
    if (rows.length > 0) {
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

  const filteredSummary = useMemo(() => {
    // If a person is selected, show summary for all their transactions
    if (filterPerson && filterPerson._id && filterPerson._id !== "all") {
      const summaryObj = {};
      transactions
        .filter((txn) => txn.personId._id === filterPerson._id)
        .forEach((txn) => {
          const person = txn.personId.name;
          if (!summaryObj[person]) {
            summaryObj[person] = {
              lend: 0,
              received: 0,
              borrowed: 0,
              repay: 0,
            };
          }
          if (txn.type === "lend")
            summaryObj[person].lend += Number(txn.amount);
          if (txn.type === "received")
            summaryObj[person].received += Number(txn.amount);
          if (txn.type === "borrowed")
            summaryObj[person].borrowed += Number(txn.amount);
          if (txn.type === "repay")
            summaryObj[person].repay += Number(txn.amount);
        });
      return summaryObj;
    }
    // Otherwise, show summary for all filtered transactions
    const summaryObj = {};
    filteredTxns.forEach((txn) => {
      const person = txn.personId.name;
      if (!summaryObj[person]) {
        summaryObj[person] = { lend: 0, received: 0, borrowed: 0, repay: 0 };
      }
      if (txn.type === "lend") summaryObj[person].lend += Number(txn.amount);
      if (txn.type === "received")
        summaryObj[person].received += Number(txn.amount);
      if (txn.type === "borrowed")
        summaryObj[person].borrowed += Number(txn.amount);
      if (txn.type === "repay") summaryObj[person].repay += Number(txn.amount);
    });
    return summaryObj;
  }, [transactions, filteredTxns, filterPerson]);

  const onAddPerson = async (personName) => {
    setLoading(true);
    try {
      await addPerson({ name: personName });

      setMsgModal({
        show: true,
        message: "Person added successfully",
        type: "success",
      });
    } catch (error) {
      setMsgModal({
        show: true,
        message: error?.response?.data?.message || "Failed to add Person",
        type: "error",
      });
    }

    await loadData();
    setLoading(false);
  };

  const onAddEditTransaction = async (form) => {
    const updatedDate = new Date(
      `${form.date}T${new Date().toISOString().split("T")[1]}`
    ).toISOString();

    const payload = { ...form, date: updatedDate };

    setLoading(true);
    if (isEdit) {
      // Call update API
      try {
        await updateTransaction(form._id, payload);
        setMsgModal({
          show: true,
          message: "Transaction updated successfully",
          type: "success",
        });
        setForm({
          personId: "",
          amount: "",
          type: "",
          note: "",
          date: new Date().toISOString().split("T")[0],
        });
        setIsEdit(false);
      } catch (error) {
        setMsgModal({
          show: true,
          message:
            error?.response?.data?.message || "Failed to update Transaction",
          type: "error",
        });
      }
      await loadData();
      setLoading(false);
      return;
    }
    try {
      await addTransaction(payload);
      setMsgModal({
        show: true,
        message: "Transaction added successfully",
        type: "success",
      });
      setForm({
        personId: "",
        amount: "",
        type: "",
        note: "",
        date: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      setMsgModal({
        show: true,
        message: error?.response?.data?.message || "Failed to add Transaction",
        type: "error",
      });
    }
    await loadData();
    setLoading(false);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const peopleRes = await getPeople();
      setPeople(peopleRes.data);
      const txnRes = await getTransactions();
      setTransactions(txnRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalOutstanding = useMemo(
    () =>
      Object.values(filteredSummary).reduce(
        (sum, data) =>
          sum + (data.lend - data.received - data.borrowed + data.repay),
        0
      ),
    [filteredSummary]
  );

  const handleEdit = (txn) => {
    setForm({
      _id: txn._id,
      personId: txn.personId._id,
      amount: txn.amount,
      type: txn.type,
      note: txn.note || "",
      date: new Date(txn.date).toISOString().split("T")[0],
    });
    setIsTxnModalOpen(true);
    setIsEdit(true);
  };

  const handleDelete = async (txn) => {
    setDeleteTransactionId(txn._id);
    setIsDeleteConfirmationOpen(true);
  };
  return (
    <>
      <MessageModal
        show={msgModal.show}
        message={msgModal.message}
        type={msgModal.type}
        onClose={() => setMsgModal({ ...msgModal, show: false })}
      />
      <Modal
        show={isDeleteConfirmationOpen}
        onClose={() => {
          setIsDeleteConfirmationOpen(false);
          setDeleteTransactionId(null);
        }}
        title="Delete Expense"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteConfirmationOpen(false);
                setDeleteTransactionId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                try {
                  await deleteTransaction(deleteTransactionId);

                  setMsgModal({
                    show: true,
                    message: "Transaction deleted successfully",
                    type: "success",
                  });
                  await loadData();
                } catch (error) {
                  setMsgModal({
                    show: true,
                    message:
                      error?.response?.data?.message ||
                      "Failed to delete Transaction",
                    type: "error",
                  });
                }
                setIsDeleteConfirmationOpen(false);
                setDeleteTransactionId(null);
                setLoading(false);
              }}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </>
        }
      >
        <p className="text-gray-700">
          Are you sure you want to delete this Transaction?
        </p>
      </Modal>
      {/* Add Person Modal */}
      <Modal
        show={isPersonModalOpen}
        onClose={() => setIsPersonModalOpen(false)}
        title="Add New Person"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();

            await onAddPerson(personName);
            setPersonName("");
            setIsPersonModalOpen(false);
          }}
        >
          <TextInput
            value={personName}
            onChangeHandler={setPersonName}
            placeholder="Name"
            inputType="text"
          />
          <Button
            type="submit"
            className="mt-4 w-full"
            disabled={!personName || loading}
          >
            Add Person
          </Button>
        </form>
      </Modal>
      {/* Add Transaction Modal */}
      <Modal
        show={isTxnModalOpen}
        onClose={() => {
          setIsTxnModalOpen(false);
          setIsEdit(false);
          setForm({
            personId: "",
            amount: "",
            type: "",
            note: "",
            date: new Date().toISOString().split("T")[0],
          });
        }}
        title={isEdit ? "Edit Transaction" : "Add New Transaction"}
      >
        <AddTransactionForm
          people={people}
          handleAddTxn={async (form) => {
            await onAddEditTransaction(form);
            setIsTxnModalOpen(false);
          }}
          form={form}
          setForm={setForm}
          isEdit={isEdit}
        />
      </Modal>
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sticky top-0 bg-white z-[1] py-1">
        <div className="flex gap-2">
          <Dropdown
            label="Filter by Person"
            value={filterPerson}
            onChangeHandler={setFilterPerson}
            options={[{ _id: "all", name: "All" }, ...people]}
            placeholder="Select Person"
          />
          <Dropdown
            label="Filter by Type"
            value={filterType}
            onChangeHandler={setFilterType}
            options={[
              { _id: "all", name: "All" },
              { _id: "lend", name: "Lend" },
              { _id: "borrowed", name: "Borrowed" },
              { _id: "received", name: "Received" },
              { _id: "repay", name: "Repay" },
            ]}
            placeholder="Select Type"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportPDF}>Export PDF</Button>
          <Button onClick={() => setIsTxnModalOpen(true)}>
            + New Transaction
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsPersonModalOpen(true)}
          >
            + Add Person
          </Button>
        </div>
      </div>
      {/* Summary */}
      <h2 className="text-xl font-semibold mb-4 text-gray-900 tracking-tight">
        Lend & Borrow Summary
      </h2>
      <Summary summary={filteredSummary} totalOutstanding={totalOutstanding} />
      {/* Transaction List */}
      <h2 className="text-xl font-semibold mb-4 text-gray-900 tracking-tight">
        Transactions List
      </h2>
      <div className="bg-white  rounded shadow text-black">
        <ul className="space-y-1">
          {filteredTxns.map((txn) => {
            const details = typeDetails[txn.type] || {};
            return (
              <li
                key={txn._id}
                className={`flex items-center gap-3 p-2 rounded ${
                  details.color || "bg-gray-100 text-gray-800"
                }`}
              >
                <span className="text-xl">{details.icon}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium flex items-center gap-2">
                    {details.label ? details.label(txn) : "Transaction"}
                  </div>
                  <div className="text-xs text-gray-600">
                    {new Date(txn.date).toLocaleDateString()}
                    {txn.note ? ` • ${txn.note}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleEdit(txn)}
                    className="text-blue-500 hover:text-blue-700 transition"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(txn)}
                    className="text-red-500 hover:text-red-700 transition"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <LoadingPopup show={loading} />
    </>
  );
};

export default TransactionList;
