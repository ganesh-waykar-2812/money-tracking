import { useEffect, useMemo, useState } from "react";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import {
  addInvestment,
  addInvestmentDetail,
  addInvestmentTransaction,
  deleteInvestment,
  deleteInvestmentDetail,
  deleteInvestmentTransaction,
  getInvestments,
  getLoans,
  updateInvestment,
  updateInvestmentDetail,
  updateInvestmentTransaction,
} from "../services/api";
import { Button } from "../components/reusable/Button";
import Modal from "../components/reusable/Modal";
import MessageModal from "../components/reusable/MessageModal";

const emptyForm = {
  name: "",
  type: "",
  description: "",
  loanId: "",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  note: "",
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const getPaidAmount = (detail) =>
  (detail.transactions || []).reduce(
    (total, transaction) => total + Number(transaction.amount || 0),
    0,
  );

export default function InvestmentTracker() {
  const [investments, setInvestments] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [expandedDetails, setExpandedDetails] = useState({});
  const [message, setMessage] = useState({
    show: false,
    type: "success",
    message: "",
  });

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const [investmentResponse, loanResponse] = await Promise.all([
          getInvestments(),
          getLoans(),
        ]);
        setInvestments(investmentResponse.data);
        setLoans(loanResponse.data);
      } catch (error) {
        setMessage({
          show: true,
          type: "error",
          message:
            error?.response?.data?.message || "Failed to load investments.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchInvestments();
  }, []);

  const totals = useMemo(
    () =>
      investments.reduce(
        (result, investment) => {
          for (const detail of investment.details || []) {
            result.planned += Number(detail.amount) || 0;
            result.paid += getPaidAmount(detail);
          }
          return result;
        },
        { planned: 0, paid: 0 },
      ),
    [investments],
  );

  const showError = (error, fallback) => {
    setMessage({
      show: true,
      type: "error",
      message: error?.response?.data?.message || fallback,
    });
  };

  const replaceInvestment = (updatedInvestment) => {
    setInvestments((current) =>
      current.map((investment) =>
        investment._id === updatedInvestment._id
          ? updatedInvestment
          : investment,
      ),
    );
  };

  const openModal = (kind, investment, detail, record) => {
    setModal({
      kind,
      investmentId: investment?._id,
      detailId: detail?._id,
      recordId: record?._id,
    });
    if (kind === "investment") {
      setForm(
        record
          ? {
              ...emptyForm,
              name: record.name || "",
              type: record.type || "",
              description: record.description || "",
              loanId:
                typeof record.loanId === "object"
                  ? record.loanId?._id || ""
                  : record.loanId || "",
            }
          : { ...emptyForm, name: "", type: "" },
      );
    } else if (kind === "detail") {
      setForm(
        record
          ? {
              ...emptyForm,
              name: record.name || "",
              amount: String(record.amount ?? ""),
              note: record.note || "",
            }
          : { ...emptyForm, name: "", amount: "", note: "" },
      );
    } else {
      setForm(
        record
          ? {
              ...emptyForm,
              amount: String(record.amount ?? ""),
              date: record.date ? record.date.slice(0, 10) : emptyForm.date,
              note: record.note || "",
            }
          : { ...emptyForm, amount: "", note: "" },
      );
    }
  };

  const closeModal = () => {
    setModal(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() && modal.kind !== "transaction") return;
    if (modal.kind === "transaction" && Number(form.amount) <= 0) return;
    if (modal.kind === "detail" && Number(form.amount) < 0) return;
    if (modal.kind === "transaction" && !form.date) return;

    setSaving(true);
    try {
      let response;
      if (modal.kind === "investment") {
        const data = {
          name: form.name.trim(),
          type: form.type.trim(),
          description: form.description.trim(),
          loanId: form.loanId || null,
        };
        response = modal.recordId
          ? await updateInvestment(modal.investmentId, data)
          : await addInvestment(data);
        if (modal.recordId) replaceInvestment(response.data);
        else setInvestments((current) => [response.data, ...current]);
      } else if (modal.kind === "detail") {
        const data = {
          name: form.name.trim(),
          amount: Number(form.amount),
          note: form.note.trim(),
        };
        response = modal.recordId
          ? await updateInvestmentDetail(
              modal.investmentId,
              modal.detailId,
              data,
            )
          : await addInvestmentDetail(modal.investmentId, data);
        replaceInvestment(response.data);
      } else {
        const data = {
          amount: Number(form.amount),
          date: form.date,
          note: form.note.trim(),
        };
        response = modal.recordId
          ? await updateInvestmentTransaction(
              modal.investmentId,
              modal.detailId,
              modal.recordId,
              data,
            )
          : await addInvestmentTransaction(
              modal.investmentId,
              modal.detailId,
              data,
            );
        replaceInvestment(response.data);
      }
      closeModal();
    } catch (error) {
      showError(error, "Unable to save this investment record.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteInvestment = async (investment) => {
    if (
      !window.confirm(
        `Delete "${investment.name}" and all of its details and transactions?`,
      )
    ) {
      return;
    }
    try {
      await deleteInvestment(investment._id);
      setInvestments((current) =>
        current.filter((item) => item._id !== investment._id),
      );
    } catch (error) {
      showError(error, "Unable to delete this investment.");
    }
  };

  const handleDeleteDetail = async (investment, detail) => {
    if (
      !window.confirm(
        `Delete "${detail.name}" and its transaction history?`,
      )
    ) {
      return;
    }
    try {
      const response = await deleteInvestmentDetail(investment._id, detail._id);
      replaceInvestment(response.data);
    } catch (error) {
      showError(error, "Unable to delete this investment detail.");
    }
  };

  const handleDeleteTransaction = async (investment, detail, transaction) => {
    if (!window.confirm("Delete this payment record?")) return;
    try {
      const response = await deleteInvestmentTransaction(
        investment._id,
        detail._id,
        transaction._id,
      );
      replaceInvestment(response.data);
    } catch (error) {
      showError(error, "Unable to delete this payment.");
    }
  };

  const modalTitle = modal
    ? `${modal.recordId ? "Edit" : "Add"} ${
        modal.kind === "investment"
          ? "Investment"
          : modal.kind === "detail"
            ? "Cost Detail"
            : "Transaction"
      }`
    : "";

  return (
    <div className="flex-1 overflow-y-auto space-y-5 pr-1">
      <MessageModal
        show={message.show}
        message={message.message}
        type={message.type}
        onClose={() => setMessage((current) => ({ ...current, show: false }))}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-indigo-700">Investments</h1>
          <p className="text-sm text-gray-600">
            Track investment costs and payments made so far.
          </p>
        </div>
        <Button
          onClick={() => openModal("investment")}
          leftIcon={<FaPlus />}
          size="sm"
        >
          Add Investment
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
          <p className="text-sm font-medium text-indigo-700">Planned costs</p>
          <p className="mt-1 text-xl font-bold text-indigo-900">
            {formatCurrency(totals.planned)}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-sm font-medium text-emerald-700">Paid so far</p>
          <p className="mt-1 text-xl font-bold text-emerald-900">
            {formatCurrency(totals.paid)}
          </p>
        </div>
      </div>

      {loading ? (
        <p className="py-10 text-center text-gray-500">Loading investments…</p>
      ) : investments.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="font-semibold text-gray-700">No investments yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Add an investment, then list costs such as agreement value, stamp
            duty, or legal charges.
          </p>
          <Button
            className="mt-4"
            onClick={() => openModal("investment")}
            leftIcon={<FaPlus />}
            size="sm"
          >
            Add your first investment
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {investments.map((investment) => {
            const investmentPlanned = (investment.details || []).reduce(
              (sum, detail) => sum + (Number(detail.amount) || 0),
              0,
            );
            const investmentPaid = (investment.details || []).reduce(
              (sum, detail) => sum + getPaidAmount(detail),
              0,
            );

            return (
              <section
                key={investment._id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="flex flex-col gap-3 bg-gray-50 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-gray-800">
                        {investment.name}
                      </h2>
                      <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                        {investment.type}
                      </span>
                    </div>
                    {investment.loanId && (
                      <p className="mt-1 text-sm font-medium text-indigo-700">
                        Linked loan:{" "}
                        {typeof investment.loanId === "object"
                          ? investment.loanId.loanName
                          : loans.find(
                              (loan) => loan._id === investment.loanId,
                            )?.loanName || "Loan"}
                      </p>
                    )}
                    {investment.description && (
                      <p className="mt-1 text-sm text-gray-600">
                        {investment.description}
                      </p>
                    )}
                    <p className="mt-2 text-sm text-gray-600">
                      Paid{" "}
                      <span className="font-semibold text-gray-800">
                        {formatCurrency(investmentPaid)}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-gray-800">
                        {formatCurrency(investmentPlanned)}
                      </span>
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      title="Edit investment"
                      onClick={() =>
                        openModal("investment", investment, null, investment)
                      }
                      leftIcon={<FaEdit />}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      title="Delete investment"
                      onClick={() => handleDeleteInvestment(investment)}
                      leftIcon={<FaTrash />}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  {(investment.details || []).map((detail) => {
                    const paid = getPaidAmount(detail);
                    const planned = Number(detail.amount) || 0;
                    const progress =
                      planned > 0 ? Math.min((paid / planned) * 100, 100) : 0;
                    const isExpanded = expandedDetails[detail._id];

                    return (
                      <div
                        key={detail._id}
                        className="rounded-lg border border-gray-200 p-3"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-gray-800">
                                {detail.name}
                              </h3>
                              {detail.note && (
                                <span className="text-sm text-gray-500">
                                  {detail.note}
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex flex-wrap gap-x-4 text-sm">
                              <span className="text-gray-600">
                                Planned:{" "}
                                <strong>{formatCurrency(planned)}</strong>
                              </span>
                              <span className="text-emerald-700">
                                Paid: <strong>{formatCurrency(paid)}</strong>
                              </span>
                              <span className="text-amber-700">
                                Remaining:{" "}
                                <strong>{formatCurrency(planned - paid)}</strong>
                              </span>
                            </div>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                openModal("transaction", investment, detail)
                              }
                              leftIcon={<FaPlus />}
                            >
                              Add payment
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              title="Edit cost detail"
                              onClick={() =>
                                openModal("detail", investment, detail, detail)
                              }
                              leftIcon={<FaEdit />}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              title="Delete cost detail"
                              onClick={() =>
                                handleDeleteDetail(investment, detail)
                              }
                              leftIcon={<FaTrash />}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>

                        {(detail.transactions || []).length > 0 && (
                          <button
                            className="mt-3 text-sm font-medium text-indigo-700 hover:text-indigo-900"
                            onClick={() =>
                              setExpandedDetails((current) => ({
                                ...current,
                                [detail._id]: !current[detail._id],
                              }))
                            }
                          >
                            {isExpanded ? "Hide" : "Show"}{" "}
                            {detail.transactions.length} payment
                            {detail.transactions.length === 1 ? "" : "s"}
                          </button>
                        )}
                        {isExpanded && (
                          <div className="mt-2 divide-y divide-gray-100 rounded-lg bg-gray-50 px-3">
                            {detail.transactions.map((transaction) => (
                              <div
                                key={transaction._id}
                                className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
                              >
                                <div>
                                  <span className="font-semibold text-gray-800">
                                    {formatCurrency(transaction.amount)}
                                  </span>
                                  <span className="ml-2 text-gray-500">
                                    {new Date(transaction.date).toLocaleDateString()}
                                  </span>
                                  {transaction.note && (
                                    <span className="ml-2 text-gray-600">
                                      {transaction.note}
                                    </span>
                                  )}
                                </div>
                                {transaction.loanTransactionId ? (
                                  <span className="text-xs font-medium text-indigo-700">
                                    Linked loan repayment · manage in Loan Tracker
                                  </span>
                                ) : (
                                  <div className="flex gap-2">
                                    <button
                                      className="text-indigo-600 hover:text-indigo-800"
                                      title="Edit payment"
                                      onClick={() =>
                                        openModal(
                                          "transaction",
                                          investment,
                                          detail,
                                          transaction,
                                        )
                                      }
                                    >
                                      <FaEdit />
                                    </button>
                                    <button
                                      className="text-red-600 hover:text-red-800"
                                      title="Delete payment"
                                      onClick={() =>
                                        handleDeleteTransaction(
                                          investment,
                                          detail,
                                          transaction,
                                        )
                                      }
                                    >
                                      <FaTrash />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {(investment.details || []).length === 0 && (
                    <p className="py-3 text-center text-sm text-gray-500">
                      No cost details added yet.
                    </p>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openModal("detail", investment)}
                    leftIcon={<FaPlus />}
                  >
                    Add cost detail
                  </Button>
                </div>
              </section>
            );
          })}
        </div>
      )}

      <Modal show={!!modal} onClose={closeModal} title={modalTitle}>
        {modal && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {modal.kind === "investment" ? (
              <>
                <label className="block text-sm font-medium text-gray-700">
                  Investment name
                  <input
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="e.g. Pune flat"
                    required
                    maxLength={100}
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Investment type
                  <input
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                    value={form.type}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        type: event.target.value,
                      }))
                    }
                    placeholder="e.g. Flat, Stocks, Land"
                    required
                    maxLength={60}
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Link to loan (optional)
                  <select
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
                    value={form.loanId}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        loanId: event.target.value,
                      }))
                    }
                  >
                    <option value="">No linked loan</option>
                    {loans.map((loan) => (
                      <option key={loan._id} value={loan._id}>
                        {loan.loanName} ({loan.loanType})
                      </option>
                    ))}
                  </select>
                  {loans.length === 0 && (
                    <span className="mt-1 block text-xs text-gray-500">
                      No loans found. Create one in Loan Tracker first.
                    </span>
                  )}
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Description (optional)
                  <textarea
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    rows={2}
                    maxLength={500}
                  />
                </label>
              </>
            ) : (
              <>
                {modal.kind === "detail" && (
                  <label className="block text-sm font-medium text-gray-700">
                    Cost detail
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                      value={form.name}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      placeholder="e.g. Agreement value, Stamp duty"
                      required
                      maxLength={100}
                    />
                  </label>
                )}
                <label className="block text-sm font-medium text-gray-700">
                  {modal.kind === "detail" ? "Planned amount (₹)" : "Payment amount (₹)"}
                  <input
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                    type="number"
                    min={modal.kind === "detail" ? "0" : "0.01"}
                    step="0.01"
                    value={form.amount}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        amount: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                {modal.kind === "transaction" && (
                  <label className="block text-sm font-medium text-gray-700">
                    Payment date
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                      type="date"
                      value={form.date}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          date: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>
                )}
                <label className="block text-sm font-medium text-gray-700">
                  Note (optional)
                  <input
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                    value={form.note}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        note: event.target.value,
                      }))
                    }
                    maxLength={300}
                  />
                </label>
              </>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
