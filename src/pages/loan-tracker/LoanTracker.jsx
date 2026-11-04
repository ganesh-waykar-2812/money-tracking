import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AddNewLoanForm from "../../components/loan-tracker/AddNewLoanForm";
import { Button } from "../../components/reusable/Button";
import Modal from "../../components/reusable/Modal";
import TextInput from "../../components/reusable/TextInput";
import { FaArrowRight, FaEdit, FaTrash } from "react-icons/fa";
import { encryptData } from "../../utils/cryptoUtils";
import {
  addLoanDocument,
  addLoanDisbursement,
  addLoanOffsetTransaction,
  addLoanTransaction,
  deleteLoan,
  deleteLoanDocument,
  deleteLoanDisbursement,
  deleteLoanRate,
  deleteLoanOffsetTransaction,
  deleteLoanTransaction,
  editLoanDocument,
  editLoanRate,
  getLoan,
  getLoanDashboard,
  updateLoanTransaction,
  updateLoanOffsetTransaction,
  updateLoanDisbursement,
  updateLoanRate,
  updateLoanStatus,
  updateLoanTerms,
} from "../../services/api";

const TABS = [
  "Overview",
  "Disbursements",
  "Transactions",
  "Schedule",
  "Offset account",
  "Documents",
];
const STATUS_OPTIONS = [
  "DRAFT",
  "ACTIVE",
  "OVERDUE",
  "DEFAULTED",
  "CANCELLED",
  "PAID_OFF",
];
const formatMoney = (value, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  } catch {
    return `${currency} ${Number(value) || 0}`;
  }
};
const formatMoneyPrecise = (value, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  } catch {
    return `${currency} ${(Number(value) || 0).toFixed(2)}`;
  }
};
const formatTotals = (totals) => {
  const entries = Object.entries(totals || {});
  return entries.length
    ? entries
        .map(([currency, value]) => formatMoney(value, currency))
        .join(" · ")
    : formatMoney(0);
};
const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Not set";

function Metric({ label, value, detail, tone = "slate" }) {
  const tones = {
    slate: "border-slate-200",
    blue: "border-blue-300",
    green: "border-emerald-300",
    orange: "border-orange-300",
  };
  return (
    <div className={`min-w-0 border-l-4 ${tones[tone]} bg-white px-4 py-3`}>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 break-words text-2xl font-semibold text-gray-900">
        {value}
      </p>
      {detail && <p className="mt-1 text-xs text-gray-500">{detail}</p>}
    </div>
  );
}

function IconAction({ action, onClick, disabled = false }) {
  const isDelete = action.toLowerCase().startsWith("delete");
  return (
    <button
      type="button"
      aria-label={action}
      title={action}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-8 w-8 items-center justify-center rounded border border-transparent transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:opacity-50 ${isDelete ? "text-red-600 hover:border-red-200" : "text-gray-600 hover:border-gray-300 hover:text-emerald-800"}`}
    >
      {isDelete ? (
        <FaTrash aria-hidden="true" />
      ) : (
        <FaEdit aria-hidden="true" />
      )}
    </button>
  );
}

function LoanTracker() {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loan, setLoan] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState("");
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editingRate, setEditingRate] = useState(null);
  const [editingDocument, setEditingDocument] = useState(null);
  const [editingLoan, setEditingLoan] = useState(null);
  const [editingOffset, setEditingOffset] = useState(null);
  const [editingDisbursement, setEditingDisbursement] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [repayment, setRepayment] = useState({
    type: "EMI",
    transactionDate: new Date().toISOString().slice(0, 10),
    dueDate: "",
    totalAmount: "",
    principalAmount: "",
    interestAmount: "",
    charges: "0",
    paymentMethod: "BANK_TRANSFER",
    reference: "",
    notes: "",
  });
  const [rateForm, setRateForm] = useState({
    interestRate: "",
    effectiveFrom: new Date().toISOString().slice(0, 10),
    reason: "",
  });
  const [documentForm, setDocumentForm] = useState({ name: "", url: "" });
  const [termsForm, setTermsForm] = useState({
    emiAmount: "",
    loanTenure: "",
    frequency: "Monthly",
    dueDay: "",
    emiStartDate: "",
  });
  const [offsetForm, setOffsetForm] = useState({
    type: "DEPOSIT",
    amount: "",
    transactionDate: new Date().toISOString().slice(0, 10),
    paymentMethod: "BANK_TRANSFER",
    reference: "",
    notes: "",
  });
  const [disbursementForm, setDisbursementForm] = useState({
    amount: "",
    transactionDate: new Date().toISOString().slice(0, 10),
    reference: "",
    notes: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      if (loanId) {
        const [detail, overview] = await Promise.all([
          getLoan(loanId),
          getLoanDashboard(),
        ]);
        setLoan(detail.data);
        setDashboard(overview.data);
      } else {
        const response = await getLoanDashboard();
        setDashboard(response.data);
        setLoan(null);
      }
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Could not load loan data.",
      );
    } finally {
      setLoading(false);
    }
  }, [loanId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleNewLoan = () => {
    setModal("");
    setNotice("Loan saved.");
    loadData();
  };

  const handleRepayment = async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(
      Object.entries(repayment).map(([key, value]) =>
        [
          "totalAmount",
          "principalAmount",
          "interestAmount",
          "charges",
        ].includes(key)
          ? [key, Number(value || 0)]
          : [key, value || undefined],
      ),
    );
    try {
      if (
        loan.direction === "Borrowed" &&
        Number(repayment.interestAmount) + Number(repayment.charges) > 0
      ) {
        const masterKey = localStorage.getItem("masterKey");
        if (!masterKey) {
          setErrorMessage(
            "Master key not found. Please sign in again before recording a repayment with interest or charges.",
          );
          return;
        }
        const expenseAmount = String(
          Number(repayment.interestAmount || 0) +
            Number(repayment.charges || 0),
        );
        payload.accountingExpense = {
          amount: encryptData(expenseAmount, masterKey),
          category: "Loan Interest & Charges",
          note: encryptData(
            `${loan.loanName}: ${repayment.type.replaceAll("_", " ")} repayment`,
            masterKey,
          ),
        };
      }
      if (editingTransaction) {
        await updateLoanTransaction(loanId, editingTransaction._id, payload);
      } else {
        await addLoanTransaction(loanId, payload);
      }
      setEditingTransaction(null);
      setModal("");
      setNotice(
        editingTransaction
          ? "Repayment updated."
          : "Repayment recorded. Outstanding principal has been updated.",
      );
      await loadData();
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Could not record repayment.",
      );
    }
  };

  const handleRateChange = async (event) => {
    event.preventDefault();
    try {
      if (editingRate) {
        await editLoanRate(loanId, editingRate._id, rateForm);
      } else {
        await updateLoanRate(loanId, rateForm);
      }
      setEditingRate(null);
      setModal("");
      setNotice(
        editingRate
          ? "Interest rate entry updated."
          : "Interest rate history updated.",
      );
      await loadData();
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Could not update interest rate.",
      );
    }
  };

  const handleDocument = async (event) => {
    event.preventDefault();
    try {
      if (editingDocument) {
        await editLoanDocument(loanId, editingDocument._id, documentForm);
      } else {
        await addLoanDocument(loanId, documentForm);
      }
      setDocumentForm({ name: "", url: "" });
      setEditingDocument(null);
      setModal("");
      setNotice(
        editingDocument ? "Document link updated." : "Document link added.",
      );
      await loadData();
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Could not add document link.",
      );
    }
  };

  const handleOffsetMovement = async (event) => {
    event.preventDefault();
    const payload = {
      ...offsetForm,
      amount: Number(offsetForm.amount),
    };
    try {
      if (editingOffset) {
        await updateLoanOffsetTransaction(loanId, editingOffset._id, payload);
      } else {
        await addLoanOffsetTransaction(loanId, payload);
      }
      setEditingOffset(null);
      setOffsetForm({
        type: "DEPOSIT",
        amount: "",
        transactionDate: new Date().toISOString().slice(0, 10),
        paymentMethod: "BANK_TRANSFER",
        reference: "",
        notes: "",
      });
      setModal("");
      setNotice(
        editingOffset
          ? "Offset movement updated."
          : "Surplus movement recorded.",
      );
      await loadData();
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Could not save offset movement.",
      );
    }
  };

  const handleDisbursement = async (event) => {
    event.preventDefault();
    const payload = {
      ...disbursementForm,
      amount: Number(disbursementForm.amount),
    };
    try {
      if (editingDisbursement) {
        await updateLoanDisbursement(loanId, editingDisbursement._id, payload);
      } else {
        await addLoanDisbursement(loanId, payload);
      }
      setEditingDisbursement(null);
      setDisbursementForm({
        amount: "",
        transactionDate: new Date().toISOString().slice(0, 10),
        reference: "",
        notes: "",
      });
      setModal("");
      setNotice(
        editingDisbursement
          ? "Disbursement updated."
          : "Disbursement recorded.",
      );
      await loadData();
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Could not save disbursement.",
      );
    }
  };

  const handleTerms = async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(
      Object.entries(termsForm).map(([key, value]) =>
        ["emiAmount", "loanTenure", "dueDay"].includes(key)
          ? [key, value === "" ? undefined : Number(value)]
          : [key, value || undefined],
      ),
    );
    try {
      await updateLoanTerms(loanId, payload);
      setModal("");
      setNotice("Repayment terms updated.");
      await loadData();
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Could not update repayment terms.",
      );
    }
  };

  const handleStatus = async (status) => {
    try {
      await updateLoanStatus(loanId, status);
      setNotice(`Loan status changed to ${status.replace("_", " ")}.`);
      await loadData();
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Could not update status.",
      );
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleteLoading(true);
    try {
      if (pendingDelete.type === "loan") {
        await deleteLoan(loanId);
        setPendingDelete(null);
        setNotice("Loan and its linked records were deleted.");
        navigate("/dashboard/loanTracker");
      } else if (pendingDelete.type === "transaction") {
        await deleteLoanTransaction(loanId, pendingDelete.item._id);
        setNotice("Repayment and linked records deleted.");
      } else if (pendingDelete.type === "rate") {
        await deleteLoanRate(loanId, pendingDelete.item._id);
        setNotice("Interest-rate entry deleted.");
      } else if (pendingDelete.type === "document") {
        await deleteLoanDocument(loanId, pendingDelete.item._id);
        setNotice("Document link deleted.");
      } else if (pendingDelete.type === "offset") {
        await deleteLoanOffsetTransaction(loanId, pendingDelete.item._id);
        setNotice("Offset movement deleted.");
      } else if (pendingDelete.type === "disbursement") {
        await deleteLoanDisbursement(loanId, pendingDelete.item._id);
        setNotice("Disbursement deleted and balance recalculated.");
      }
      setPendingDelete(null);
      await loadData();
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Could not delete this record.",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const setRepaymentPart = (field, value) => {
    setRepayment((previous) => {
      const next = { ...previous, [field]: value };
      if (["principalAmount", "interestAmount", "charges"].includes(field)) {
        next.totalAmount = String(
          Number(next.principalAmount || 0) +
            Number(next.interestAmount || 0) +
            Number(next.charges || 0),
        );
      }
      if (field === "type" && value === "FULL_SETTLEMENT") {
        next.principalAmount = String(loan?.outstandingPrincipal || 0);
        next.totalAmount = String(
          Number(next.principalAmount) +
            Number(next.interestAmount || 0) +
            Number(next.charges || 0),
        );
      }
      return next;
    });
  };

  if (loading)
    return (
      <div className="flex-1 overflow-auto p-6 text-left text-gray-500">
        Loading loan data...
      </div>
    );

  return (
    <main className="flex-1 overflow-y-auto bg-[#f4f6f7] p-4 text-left text-gray-900 sm:p-6">
      {errorMessage && (
        <div
          role="alert"
          className="mb-4 flex items-center justify-between border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {errorMessage}
          <button
            type="button"
            className="ml-4 underline"
            onClick={() => setErrorMessage("")}
          >
            Dismiss
          </button>
        </div>
      )}
      {notice && (
        <div
          role="status"
          className="mb-4 flex items-center justify-between border-l-4 border-emerald-500 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {notice}
          <button
            type="button"
            className="ml-4 underline"
            onClick={() => setNotice("")}
          >
            Dismiss
          </button>
        </div>
      )}

      {!loanId ? (
        <section className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Loans & lending
              </p>
              <h1 className="mt-1 text-2xl font-semibold">Overview</h1>
              <p className="mt-1 text-sm text-gray-500">
                Your balances, monthly commitments, and next repayments.
              </p>
            </div>
            <Button onClick={() => setModal("add")} leftIcon="+">
              Add loan
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              label="Total borrowed"
              value={formatTotals(dashboard?.totalBorrowed)}
              detail="Original principal"
              tone="blue"
            />
            <Metric
              label="Outstanding debt"
              value={formatTotals(dashboard?.outstandingDebt)}
              detail="After recorded principal payments"
              tone="orange"
            />
            <Metric
              label="Total lent"
              value={formatTotals(dashboard?.totalLent)}
              detail="Original principal lent"
              tone="green"
            />
            <Metric
              label="Monthly EMI"
              value={formatTotals(dashboard?.monthlyEmi)}
              detail="Active borrowed loans"
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[1.3fr_0.7fr]">
            <section>
              <div className="mb-3 flex items-center justify-between border-b border-gray-300 pb-2">
                <h2 className="font-semibold">Your loans</h2>
                <span className="text-sm text-gray-500">
                  {dashboard?.loans?.length || 0} records
                </span>
              </div>
              {dashboard?.loans?.length ? (
                <div className="divide-y divide-gray-200 bg-white">
                  {dashboard.loans.map((item) => (
                    <div
                      key={item._id}
                      className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center justify-between gap-4 sm:flex-1">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">
                            {item.loanName}
                          </p>
                          <p className="mt-1 truncate text-sm text-gray-500">
                            {item.direction} · {item.loanType} ·{" "}
                            {item.lenderBorrower}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-semibold text-gray-900">
                            {formatMoney(
                              item.outstandingPrincipal,
                              item.currency,
                            )}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {item.status.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 self-start sm:self-auto"
                        rightIcon={<FaArrowRight aria-hidden="true" />}
                        aria-label={`View loan ${item.loanName}`}
                        onClick={() =>
                          navigate(`/dashboard/loanTracker/${item._id}`)
                        }
                      >
                        View loan
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-y border-gray-200 py-10 text-center text-sm text-gray-500">
                  No loans yet. Add one to start tracking balances and
                  repayments.
                </div>
              )}
            </section>

            <section>
              <div className="mb-3 border-b border-gray-300 pb-2">
                <h2 className="font-semibold">Upcoming repayments</h2>
                <p className="mt-1 text-sm text-gray-500">Next 30 days</p>
              </div>
              {dashboard?.upcomingRepayments?.length ? (
                <div className="divide-y divide-gray-200 bg-white">
                  {dashboard.upcomingRepayments.map((item) => (
                    <button
                      key={`${item.loanId}-${item.dueDate}`}
                      type="button"
                      onClick={() =>
                        navigate(`/dashboard/loanTracker/${item.loanId}`)
                      }
                      className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left hover:bg-gray-50"
                    >
                      <span>
                        <span className="block font-medium">
                          {item.loanName}
                        </span>
                        <span className="mt-1 block text-sm text-gray-500">
                          Due {formatDate(item.dueDate)}
                        </span>
                      </span>
                      <span className="font-semibold">
                        {formatMoney(item.amount, item.currency)}
                      </span>
                    </button>
                  ))}
                  <div className="flex items-center justify-between bg-gray-50 px-4 py-3 font-semibold">
                    <span>Total monthly commitment</span>
                    <span>
                      {formatTotals(dashboard.totalMonthlyCommitment)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="border-y border-gray-200 py-10 text-center text-sm text-gray-500">
                  No repayments due in the next 30 days.
                </p>
              )}
            </section>
          </div>
        </section>
      ) : loan ? (
        <section className="mx-auto max-w-6xl">
          <button
            type="button"
            onClick={() => navigate("/dashboard/loanTracker")}
            className="mb-4 text-sm font-medium text-emerald-800 hover:underline"
          >
            &larr; Loans overview
          </button>
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-300 pb-5">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold">{loan.loanName}</h1>
                <span className="border border-gray-300 px-2 py-1 text-xs font-semibold">
                  {loan.status.replace("_", " ")}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {loan.direction} · {loan.loanType} · {loan.lenderBorrower}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <IconAction
                action="Edit loan"
                onClick={() => {
                  setEditingLoan(loan);
                  setModal("editLoan");
                }}
              />
              <button
                type="button"
                aria-label="Delete loan"
                title="Delete loan"
                onClick={() => setPendingDelete({ type: "loan", item: loan })}
                className="inline-flex h-9 w-9 items-center justify-center border border-red-200 bg-white text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <FaTrash aria-hidden="true" />
              </button>
              <IconAction
                action="Edit terms"
                onClick={() => {
                  setTermsForm({
                    emiAmount: loan.emiAmount ?? "",
                    loanTenure: loan.loanTenure ?? "",
                    frequency: loan.frequency || "Monthly",
                    dueDay: loan.dueDay ?? "",
                    emiStartDate: loan.emiStartDate
                      ? new Date(loan.emiStartDate).toISOString().slice(0, 10)
                      : "",
                  });
                  setModal("terms");
                }}
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setModal("rate")}
              >
                Rate history
              </Button>
              <Button size="sm" onClick={() => setModal("repayment")}>
                Record repayment
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 py-5 sm:grid-cols-2 lg:grid-cols-5">
            <Metric
              label="Outstanding principal"
              value={formatMoney(loan.outstandingPrincipal, loan.currency)}
              tone="orange"
            />
            <Metric
              label="Sanctioned amount"
              value={formatMoney(loan.principalAmount, loan.currency)}
            />
            <Metric
              label="Amount disbursed"
              value={formatMoney(loan.disbursedAmount, loan.currency)}
              detail="Actual bank releases"
              tone="blue"
            />
            <Metric
              label="Principal repaid"
              value={formatMoney(
                loan.disbursedAmount - loan.outstandingPrincipal,
                loan.currency,
              )}
              tone="green"
            />
            <Metric
              label="Interest rate"
              value={`${loan.interestRate ?? 0}%`}
              detail={`${loan.interestType || "Rate type not set"} interest`}
              tone="blue"
            />
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-y border-gray-300 py-3">
            <nav
              className="flex gap-1 overflow-x-auto"
              aria-label="Loan details"
            >
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={`shrink-0 border-b-2 px-3 py-2 text-sm font-medium ${activeTab === tab ? "border-emerald-700 text-emerald-800" : "border-transparent text-gray-500 hover:text-gray-900"}`}
                >
                  {tab}
                </button>
              ))}
            </nav>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              Status
              <select
                value={loan.status}
                onChange={(event) => handleStatus(event.target.value)}
                className="border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status.replace("_", " ")}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {activeTab === "Overview" && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_0.8fr]">
              <section>
                <h2 className="mb-4 font-semibold">Loan summary</h2>
                <dl className="divide-y divide-gray-200 border-y border-gray-200 bg-white px-4">
                  <SummaryRow
                    label="Monthly EMI"
                    value={
                      loan.emiAmount
                        ? formatMoney(loan.emiAmount, loan.currency)
                        : "Not set"
                    }
                  />
                  <SummaryRow
                    label="Repayment method"
                    value={loan.repaymentMethod}
                  />
                  <SummaryRow
                    label="Interest calculation"
                    value={loan.interestCalculation || "Not set"}
                  />
                  <SummaryRow
                    label="Start date"
                    value={formatDate(loan.startDate)}
                  />
                  <SummaryRow
                    label="Loan term"
                    value={
                      loan.loanTenure ? `${loan.loanTenure} months` : "Not set"
                    }
                  />
                  <SummaryRow
                    label="Maturity date"
                    value={formatDate(loan.endDate)}
                  />
                  <SummaryRow
                    label="Account number"
                    value={loan.loanAccountNumber || "Not provided"}
                  />
                </dl>
                <p className="mt-3 text-xs text-gray-500">
                  Balances are based on principal components entered in your
                  repayment records.
                </p>
              </section>
              <section>
                <h2 className="mb-4 font-semibold">Principal progress</h2>
                <div className="bg-white p-4">
                  <div className="mb-2 flex justify-between text-sm">
                    <span>
                      {formatMoney(
                        loan.disbursedAmount - loan.outstandingPrincipal,
                        loan.currency,
                      )}{" "}
                      repaid
                    </span>
                    <span>
                      {loan.disbursedAmount
                        ? Math.round(
                            ((loan.disbursedAmount -
                              loan.outstandingPrincipal) /
                              loan.disbursedAmount) *
                              100,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200">
                    <div
                      className="h-full bg-emerald-600"
                      style={{
                        width: `${loan.disbursedAmount ? Math.min(100, ((loan.disbursedAmount - loan.outstandingPrincipal) / loan.disbursedAmount) * 100) : 0}%`,
                      }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>Paid</span>
                    <span>
                      {formatMoney(loan.disbursedAmount, loan.currency)}
                    </span>
                  </div>
                </div>
                {loan.rateHistory?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="mb-2 text-sm font-semibold">
                      Interest-rate history
                    </h3>
                    <div className="divide-y divide-gray-200 border-y border-gray-200 bg-white">
                      {loan.rateHistory.map((entry) => (
                        <div
                          key={entry._id}
                          className="flex justify-between gap-3 px-4 py-3 text-sm"
                        >
                          <span>
                            {entry.interestRate}%{" "}
                            <span className="text-gray-500">
                              {entry.reason}
                            </span>
                          </span>
                          <span className="shrink-0 text-gray-500">
                            From {formatDate(entry.effectiveFrom)}
                          </span>
                          <span className="flex shrink-0 items-center gap-1">
                            <IconAction
                              action="Edit rate entry"
                              onClick={() => {
                                setEditingRate(entry);
                                setRateForm({
                                  interestRate: String(entry.interestRate),
                                  effectiveFrom: new Date(entry.effectiveFrom)
                                    .toISOString()
                                    .slice(0, 10),
                                  reason: entry.reason || "",
                                });
                                setModal("rate");
                              }}
                            />
                            <IconAction
                              action="Delete rate entry"
                              onClick={() =>
                                setPendingDelete({ type: "rate", item: entry })
                              }
                            />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === "Disbursements" && (
            <section>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="font-semibold">Disbursement history</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Only released funds accrue loan interest. Total releases
                    cannot exceed the sanctioned amount.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingDisbursement(null);
                    setDisbursementForm({
                      amount: "",
                      transactionDate: new Date().toISOString().slice(0, 10),
                      reference: "",
                      notes: "",
                    });
                    setModal("disbursement");
                  }}
                >
                  Record disbursement
                </Button>
              </div>
              <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Metric
                  label="Sanctioned"
                  value={formatMoney(loan.principalAmount, loan.currency)}
                />
                <Metric
                  label="Disbursed"
                  value={formatMoney(loan.disbursedAmount, loan.currency)}
                  tone="blue"
                />
                <Metric
                  label="Not yet disbursed"
                  value={formatMoney(
                    Math.max(0, loan.principalAmount - loan.disbursedAmount),
                    loan.currency,
                  )}
                />
              </div>
              {loan.disbursements?.length ? (
                <div className="overflow-x-auto border-y border-gray-200 bg-white">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-4 py-3">Release date</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-4 py-3">Reference / note</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loan.disbursements.map((entry) => (
                        <tr key={entry._id}>
                          <td className="px-4 py-3">
                            {formatDate(entry.transactionDate)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatMoney(entry.amount, loan.currency)}
                          </td>
                          <td className="px-4 py-3">
                            {entry.reference || entry.notes || "-"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1">
                              <IconAction
                                action="Edit disbursement"
                                onClick={() => {
                                  setEditingDisbursement(entry);
                                  setDisbursementForm({
                                    amount: String(entry.amount),
                                    transactionDate: new Date(
                                      entry.transactionDate,
                                    )
                                      .toISOString()
                                      .slice(0, 10),
                                    reference: entry.reference || "",
                                    notes: entry.notes || "",
                                  });
                                  setModal("disbursement");
                                }}
                              />
                              <IconAction
                                action="Delete disbursement"
                                onClick={() =>
                                  setPendingDelete({
                                    type: "disbursement",
                                    item: entry,
                                  })
                                }
                              />
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="border-y border-gray-200 py-10 text-center text-sm text-gray-500">
                  {loan.disbursementTrackingEnabled
                    ? "No funds have been disbursed yet. Record a tranche when the lender releases funds."
                    : "This older loan has no tranche history, so its sanctioned amount is treated as fully disbursed from the loan start date."}
                </p>
              )}
            </section>
          )}

          {activeTab === "Transactions" && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold">Repayment ledger</h2>
                <Button size="sm" onClick={() => setModal("repayment")}>
                  Add transaction
                </Button>
              </div>
              {loan.transactions?.length ? (
                <div className="overflow-x-auto border-y border-gray-200 bg-white">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3 text-right">Total</th>
                        <th className="px-4 py-3 text-right">Principal</th>
                        <th className="px-4 py-3 text-right">Interest</th>
                        <th className="px-4 py-3 text-right">Charges</th>
                        <th className="px-4 py-3">Method / reference</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loan.transactions.map((entry) => (
                        <tr key={entry._id}>
                          <td className="px-4 py-3">
                            {formatDate(entry.transactionDate)}
                          </td>
                          <td className="px-4 py-3">
                            {entry.type.replaceAll("_", " ")}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatMoney(entry.totalAmount, loan.currency)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatMoney(entry.principalAmount, loan.currency)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatMoney(entry.interestAmount, loan.currency)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatMoney(entry.charges, loan.currency)}
                          </td>
                          <td className="px-4 py-3">
                            {entry.paymentMethod?.replaceAll("_", " ") || "-"}
                            {entry.reference ? ` · ${entry.reference}` : ""}
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1">
                              <IconAction
                                action="Edit repayment"
                                onClick={() => {
                                  setEditingTransaction(entry);
                                  setRepayment({
                                    type: entry.type,
                                    transactionDate: new Date(
                                      entry.transactionDate,
                                    )
                                      .toISOString()
                                      .slice(0, 10),
                                    dueDate: entry.dueDate
                                      ? new Date(entry.dueDate)
                                          .toISOString()
                                          .slice(0, 10)
                                      : "",
                                    totalAmount: String(entry.totalAmount),
                                    principalAmount: String(
                                      entry.principalAmount,
                                    ),
                                    interestAmount: String(
                                      entry.interestAmount,
                                    ),
                                    charges: String(entry.charges || 0),
                                    paymentMethod:
                                      entry.paymentMethod || "BANK_TRANSFER",
                                    reference: entry.reference || "",
                                    notes: entry.notes || "",
                                  });
                                  setModal("repayment");
                                }}
                              />
                              <IconAction
                                action="Delete repayment"
                                onClick={() =>
                                  setPendingDelete({
                                    type: "transaction",
                                    item: entry,
                                  })
                                }
                              />
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="border-y border-gray-200 py-10 text-center text-sm text-gray-500">
                  No repayments recorded yet.
                </p>
              )}
            </section>
          )}

          {activeTab === "Schedule" && (
            <section>
              <h2 className="mb-1 font-semibold">
                Projected repayment schedule
              </h2>
              <p className="mb-4 text-xs text-gray-500">
                Daily reducing-balance estimate from the previous interest-cycle
                date through each due date. Dated offset movements reduce
                interest only; they do not reduce principal or the scheduled
                EMI. Future unrecorded offset changes are not projected. This is
                not a lender statement.
              </p>
              {loan.schedule?.length ? (
                <div className="overflow-x-auto border-y border-gray-200 bg-white">
                  <table className="w-full min-w-[1180px] text-left text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-4 py-3">Due</th>
                        <th className="px-4 py-3 text-right">Days</th>
                        <th className="px-4 py-3 text-right">
                          Rate at due date
                        </th>
                        <th className="px-4 py-3 text-right">
                          Offset at due date
                        </th>
                        <th className="px-4 py-3 text-right">
                          Interest-bearing balance
                        </th>
                        <th className="px-4 py-3 text-right">
                          Opening liability
                        </th>
                        <th className="px-4 py-3 text-right">EMI</th>
                        <th className="px-4 py-3 text-right">Interest</th>
                        <th className="px-4 py-3 text-right">Principal</th>
                        <th className="px-4 py-3 text-right">
                          Closing liability
                        </th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loan.schedule.map((row) => (
                        <tr key={`${row.installmentNumber}-${row.dueDate}`}>
                          <td className="px-4 py-3">
                            {formatDate(row.dueDate)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {row.daysCount}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {Number(row.annualRateAtDueDate || 0).toFixed(3)}%
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatMoneyPrecise(
                              row.offsetBalance,
                              loan.currency,
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatMoneyPrecise(
                              row.interestBearingBalance,
                              loan.currency,
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatMoneyPrecise(
                              row.openingPrincipal,
                              loan.currency,
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatMoneyPrecise(row.totalAmount, loan.currency)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatMoneyPrecise(
                              row.interestAmount,
                              loan.currency,
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatMoneyPrecise(
                              row.principalAmount,
                              loan.currency,
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatMoneyPrecise(
                              row.closingPrincipal,
                              loan.currency,
                            )}
                          </td>
                          <td className="px-4 py-3">{row.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="border-y border-gray-200 py-10 text-center text-sm text-gray-500">
                  No schedule available for this loan.
                </p>
              )}
            </section>
          )}

          {activeTab === "Offset account" && (
            <section>
              {!loan.offsetFacilityEnabled ? (
                <div className="border-y border-gray-200 py-10 text-center">
                  <h2 className="font-semibold">
                    Offset facility is not enabled
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Edit the loan and enable its offset facility to track
                    surplus funds and estimate daily interest savings.
                  </p>
                  <div className="mt-4 flex justify-center">
                    <IconAction
                      action="Edit loan to enable offset facility"
                      onClick={() => {
                        setEditingLoan(loan);
                        setModal("editLoan");
                      }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h2 className="font-semibold">Surplus balance</h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Dated balances offset interest only; they do not reduce
                        principal.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingOffset(null);
                        setOffsetForm({
                          type: "DEPOSIT",
                          amount: "",
                          transactionDate: new Date()
                            .toISOString()
                            .slice(0, 10),
                          paymentMethod: "BANK_TRANSFER",
                          reference: "",
                          notes: "",
                        });
                        setModal("offset");
                      }}
                    >
                      Record surplus movement
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <Metric
                      label="Offset balance"
                      value={formatMoney(
                        loan.interestSummary?.offsetBalance,
                        loan.currency,
                      )}
                      detail="Deposits less withdrawals"
                      tone="green"
                    />
                    <Metric
                      label="Interest-bearing balance"
                      value={formatMoney(
                        loan.interestSummary?.interestBearingBalance,
                        loan.currency,
                      )}
                      detail="Outstanding principal less offset"
                      tone="orange"
                    />
                    <Metric
                      label="Estimated daily interest"
                      value={formatMoney(
                        loan.interestSummary?.dailyInterest,
                        loan.currency,
                      )}
                      detail="Based on today's rate and balance"
                    />
                    <Metric
                      label="Estimated interest saved today"
                      value={formatMoney(
                        loan.interestSummary?.interestSavedToday,
                        loan.currency,
                      )}
                      detail={`Month to date: ${formatMoney(loan.interestSummary?.monthToDateInterest, loan.currency)} interest`}
                      tone="blue"
                    />
                  </div>
                  <p className="my-4 text-xs text-gray-500">
                    Estimate uses daily reducing-balance interest and the rate
                    effective on each day (365/366 days per year). Actual lender
                    calculations may differ due to posting cutoffs, compounding
                    rules, or product terms.
                  </p>
                  <div className="mb-3 border-b border-gray-300 pb-2">
                    <h3 className="font-semibold">Surplus movements</h3>
                  </div>
                  {loan.offsetTransactions?.length ? (
                    <div className="overflow-x-auto border-y border-gray-200 bg-white">
                      <table className="w-full min-w-[700px] text-left text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
                          <tr>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Movement</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                            <th className="px-4 py-3">Method / reference</th>
                            <th className="px-4 py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {loan.offsetTransactions.map((entry) => (
                            <tr key={entry._id}>
                              <td className="px-4 py-3">
                                {formatDate(entry.transactionDate)}
                              </td>
                              <td className="px-4 py-3">
                                {entry.type === "DEPOSIT"
                                  ? "Surplus deposit"
                                  : "Withdrawal"}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {formatMoney(entry.amount, loan.currency)}
                              </td>
                              <td className="px-4 py-3">
                                {entry.paymentMethod?.replaceAll("_", " ") ||
                                  "-"}
                                {entry.reference ? ` · ${entry.reference}` : ""}
                              </td>
                              <td className="px-4 py-3">
                                <span className="flex items-center gap-1">
                                  <IconAction
                                    action="Edit offset movement"
                                    onClick={() => {
                                      setEditingOffset(entry);
                                      setOffsetForm({
                                        type: entry.type,
                                        amount: String(entry.amount),
                                        transactionDate: new Date(
                                          entry.transactionDate,
                                        )
                                          .toISOString()
                                          .slice(0, 10),
                                        paymentMethod:
                                          entry.paymentMethod ||
                                          "BANK_TRANSFER",
                                        reference: entry.reference || "",
                                        notes: entry.notes || "",
                                      });
                                      setModal("offset");
                                    }}
                                  />
                                  <IconAction
                                    action="Delete offset movement"
                                    onClick={() =>
                                      setPendingDelete({
                                        type: "offset",
                                        item: entry,
                                      })
                                    }
                                  />
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="border-y border-gray-200 py-10 text-center text-sm text-gray-500">
                      No surplus movements recorded.
                    </p>
                  )}
                </>
              )}
            </section>
          )}

          {activeTab === "Documents" && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold">Documents</h2>
                <Button size="sm" onClick={() => setModal("document")}>
                  Add document link
                </Button>
              </div>
              {loan.documents?.length ? (
                <div className="divide-y divide-gray-200 border-y border-gray-200 bg-white">
                  {loan.documents.map((document, index) => (
                    <div
                      key={`${document.url}-${index}`}
                      className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                    >
                      <a
                        href={document.url}
                        target="_blank"
                        rel="noreferrer"
                        className="min-w-0 truncate text-emerald-800 hover:underline"
                      >
                        {document.name}
                      </a>
                      <span className="shrink-0 text-gray-500">
                        Added {formatDate(document.addedAt)}
                      </span>
                      <span className="flex shrink-0 items-center gap-1">
                        <IconAction
                          action="Edit document"
                          onClick={() => {
                            setEditingDocument(document);
                            setDocumentForm({
                              name: document.name,
                              url: document.url,
                            });
                            setModal("document");
                          }}
                        />
                        <IconAction
                          action="Delete document"
                          onClick={() =>
                            setPendingDelete({
                              type: "document",
                              item: document,
                            })
                          }
                        />
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="border-y border-gray-200 py-10 text-center text-sm text-gray-500">
                  No documents linked to this loan.
                </p>
              )}
            </section>
          )}
        </section>
      ) : (
        <div className="py-16 text-center">
          <p className="font-medium">Loan not found.</p>
          <button
            type="button"
            onClick={() => navigate("/dashboard/loanTracker")}
            className="mt-2 text-sm text-emerald-800 underline"
          >
            Return to loans
          </button>
        </div>
      )}

      <Modal
        show={Boolean(pendingDelete)}
        onClose={() => !deleteLoading && setPendingDelete(null)}
        title={`Delete ${pendingDelete?.type === "loan" ? "loan" : pendingDelete?.type === "transaction" ? "repayment" : pendingDelete?.type === "rate" ? "rate entry" : pendingDelete?.type === "offset" ? "surplus movement" : pendingDelete?.type === "disbursement" ? "disbursement" : "document link"}?`}
        footer={
          <>
            <Button
              variant="secondary"
              disabled={deleteLoading}
              onClick={() => setPendingDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteLoading}
              onClick={confirmDelete}
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-700">
          {pendingDelete?.type === "loan"
            ? `Delete “${pendingDelete.item.loanName}” and its repayment history, rate history, documents, linked expenses, and money transactions? This cannot be undone.`
            : pendingDelete?.type === "transaction"
              ? "Delete this repayment and its linked expense and money transaction? The outstanding principal will be recalculated."
              : pendingDelete?.type === "rate"
                ? "Delete this interest-rate entry? Adjacent effective dates will be recalculated."
                : pendingDelete?.type === "offset"
                  ? "Delete this surplus deposit or withdrawal? Daily offset balances and interest estimates will be recalculated."
                  : pendingDelete?.type === "disbursement"
                    ? "Delete this released amount? Interest and outstanding principal will be recalculated; disbursements backing repaid principal cannot be removed."
                    : "Delete this document link? The external file itself will not be deleted."}
        </p>
      </Modal>
      <Modal
        show={modal === "editLoan"}
        onClose={() => {
          setModal("");
          setEditingLoan(null);
        }}
        title="Edit loan"
        size="xl"
      >
        {editingLoan && (
          <AddNewLoanForm
            initialData={editingLoan}
            loanId={editingLoan._id}
            onSubmit={() => {
              setModal("");
              setEditingLoan(null);
              setNotice("Loan details updated.");
              loadData();
            }}
          />
        )}
      </Modal>
      <Modal
        show={modal === "add"}
        onClose={() => setModal("")}
        title="Add new loan"
        size="xl"
      >
        <AddNewLoanForm onSubmit={handleNewLoan} />
      </Modal>
      <Modal
        show={modal === "disbursement"}
        onClose={() => {
          setModal("");
          setEditingDisbursement(null);
        }}
        title={
          editingDisbursement ? "Edit disbursement" : "Record disbursement"
        }
      >
        <form onSubmit={handleDisbursement} className="space-y-4">
          <TextInput
            label="Amount released"
            value={disbursementForm.amount}
            onChangeHandler={(value) =>
              setDisbursementForm((previous) => ({
                ...previous,
                amount: value,
              }))
            }
            inputType="number"
            isRequired
          />
          <TextInput
            label="Disbursement date"
            value={disbursementForm.transactionDate}
            onChangeHandler={(value) =>
              setDisbursementForm((previous) => ({
                ...previous,
                transactionDate: value,
              }))
            }
            inputType="date"
            isRequired
          />
          <TextInput
            label="Reference"
            value={disbursementForm.reference}
            onChangeHandler={(value) =>
              setDisbursementForm((previous) => ({
                ...previous,
                reference: value,
              }))
            }
            placeholder="Optional"
          />
          <TextInput
            label="Notes"
            value={disbursementForm.notes}
            onChangeHandler={(value) =>
              setDisbursementForm((previous) => ({ ...previous, notes: value }))
            }
            placeholder="Optional"
          />
          <p className="text-xs text-gray-500">
            The total disbursed cannot exceed the sanctioned amount. Interest
            starts from each release date.
          </p>
          <Button type="submit" className="w-full">
            {editingDisbursement
              ? "Save disbursement changes"
              : "Save disbursement"}
          </Button>
        </form>
      </Modal>
      <Modal
        show={modal === "offset"}
        onClose={() => {
          setModal("");
          setEditingOffset(null);
        }}
        title={
          editingOffset ? "Edit surplus movement" : "Record surplus movement"
        }
      >
        <form onSubmit={handleOffsetMovement} className="space-y-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Movement type
            <select
              value={offsetForm.type}
              onChange={(event) =>
                setOffsetForm((previous) => ({
                  ...previous,
                  type: event.target.value,
                }))
              }
              className="border border-gray-300 px-3 py-2 font-normal text-gray-900"
            >
              <option value="DEPOSIT">Surplus deposit</option>
              <option value="WITHDRAWAL">Withdrawal</option>
            </select>
          </label>
          <TextInput
            label="Amount"
            value={offsetForm.amount}
            onChangeHandler={(value) =>
              setOffsetForm((previous) => ({ ...previous, amount: value }))
            }
            inputType="number"
            isRequired
          />
          <TextInput
            label="Effective date"
            value={offsetForm.transactionDate}
            onChangeHandler={(value) =>
              setOffsetForm((previous) => ({
                ...previous,
                transactionDate: value,
              }))
            }
            inputType="date"
            isRequired
          />
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Method
            <select
              value={offsetForm.paymentMethod}
              onChange={(event) =>
                setOffsetForm((previous) => ({
                  ...previous,
                  paymentMethod: event.target.value,
                }))
              }
              className="border border-gray-300 px-3 py-2 font-normal text-gray-900"
            >
              <option value="BANK_TRANSFER">Bank transfer</option>
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Card</option>
              <option value="OTHER">Other</option>
            </select>
          </label>
          <TextInput
            label="Reference"
            value={offsetForm.reference}
            onChangeHandler={(value) =>
              setOffsetForm((previous) => ({ ...previous, reference: value }))
            }
            placeholder="Optional"
          />
          <TextInput
            label="Notes"
            value={offsetForm.notes}
            onChangeHandler={(value) =>
              setOffsetForm((previous) => ({ ...previous, notes: value }))
            }
            placeholder="Optional"
          />
          <p className="text-xs text-gray-500">
            The effective date determines which days receive the offset.
            Withdrawals cannot exceed the available surplus balance on their
            date.
          </p>
          <Button type="submit" className="w-full">
            {editingOffset ? "Save movement changes" : "Save movement"}
          </Button>
        </form>
      </Modal>
      <Modal
        show={modal === "repayment"}
        onClose={() => {
          setModal("");
          setEditingTransaction(null);
        }}
        title={editingTransaction ? "Edit repayment" : "Record repayment"}
        size="lg"
      >
        <form
          onSubmit={handleRepayment}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Transaction type
            <select
              value={repayment.type}
              onChange={(event) => setRepaymentPart("type", event.target.value)}
              className="border border-gray-300 px-3 py-2 font-normal text-gray-900"
            >
              <option value="EMI">Regular EMI</option>
              <option value="PART_PAYMENT">Part payment</option>
              <option value="FULL_SETTLEMENT">Full loan closure</option>
              <option value="ADVANCE_EMI">Advance EMI</option>
              <option value="INTEREST_PAYMENT">Interest payment</option>
              <option value="FEE">Fee / charges</option>
              <option value="MISSED_EMI">Missed EMI</option>
            </select>
          </label>
          <TextInput
            label="Payment date"
            value={repayment.transactionDate}
            onChangeHandler={(value) =>
              setRepaymentPart("transactionDate", value)
            }
            inputType="date"
            isRequired
          />
          <TextInput
            label="Due date (optional)"
            value={repayment.dueDate}
            onChangeHandler={(value) => setRepaymentPart("dueDate", value)}
            inputType="date"
          />
          <TextInput
            label="Total payment"
            value={repayment.totalAmount}
            onChangeHandler={(value) => setRepaymentPart("totalAmount", value)}
            inputType="number"
            isRequired={repayment.type !== "MISSED_EMI"}
            disabled={repayment.type === "MISSED_EMI"}
          />
          <TextInput
            label="Principal"
            value={repayment.principalAmount}
            onChangeHandler={(value) =>
              setRepaymentPart("principalAmount", value)
            }
            inputType="number"
            isRequired
          />
          <TextInput
            label="Interest"
            value={repayment.interestAmount}
            onChangeHandler={(value) =>
              setRepaymentPart("interestAmount", value)
            }
            inputType="number"
          />
          <TextInput
            label="Charges"
            value={repayment.charges}
            onChangeHandler={(value) => setRepaymentPart("charges", value)}
            inputType="number"
          />
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Payment method
            <select
              value={repayment.paymentMethod}
              onChange={(event) =>
                setRepaymentPart("paymentMethod", event.target.value)
              }
              className="border border-gray-300 px-3 py-2 font-normal text-gray-900"
            >
              <option value="BANK_TRANSFER">Bank transfer</option>
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Card</option>
              <option value="OTHER">Other</option>
            </select>
          </label>
          <TextInput
            label="Reference"
            value={repayment.reference}
            onChangeHandler={(value) => setRepaymentPart("reference", value)}
            placeholder="Transaction reference"
          />
          <TextInput
            label="Notes"
            value={repayment.notes}
            onChangeHandler={(value) => setRepaymentPart("notes", value)}
            placeholder="Optional note"
          />
          <div className="sm:col-span-2">
            <p className="mb-3 text-xs text-gray-500">
              Total must equal principal + interest + charges. Principal
              repayments reduce the balance; interest and charges remain
              separate ledger components.
            </p>
            <Button type="submit" className="w-full">
              {editingTransaction ? "Save repayment changes" : "Save repayment"}
            </Button>
          </div>
        </form>
      </Modal>
      <Modal
        show={modal === "rate"}
        onClose={() => {
          setModal("");
          setEditingRate(null);
        }}
        title={
          editingRate ? "Edit interest-rate entry" : "Add interest-rate change"
        }
      >
        <form onSubmit={handleRateChange} className="space-y-4">
          <TextInput
            label="New annual rate (%)"
            value={rateForm.interestRate}
            onChangeHandler={(value) =>
              setRateForm((previous) => ({ ...previous, interestRate: value }))
            }
            inputType="number"
            isRequired
          />
          <TextInput
            label="Effective from"
            value={rateForm.effectiveFrom}
            onChangeHandler={(value) =>
              setRateForm((previous) => ({ ...previous, effectiveFrom: value }))
            }
            inputType="date"
            isRequired
          />
          <TextInput
            label="Reason"
            value={rateForm.reason}
            onChangeHandler={(value) =>
              setRateForm((previous) => ({ ...previous, reason: value }))
            }
            placeholder="Optional"
          />
          <Button type="submit" className="w-full">
            {editingRate ? "Save rate changes" : "Save rate change"}
          </Button>
        </form>
      </Modal>
      <Modal
        show={modal === "terms"}
        onClose={() => setModal("")}
        title="Update repayment terms"
      >
        <form onSubmit={handleTerms} className="space-y-4">
          <TextInput
            label="EMI amount"
            value={termsForm.emiAmount}
            onChangeHandler={(value) =>
              setTermsForm((previous) => ({ ...previous, emiAmount: value }))
            }
            inputType="number"
          />
          <TextInput
            label="Loan tenure (months)"
            value={termsForm.loanTenure}
            onChangeHandler={(value) =>
              setTermsForm((previous) => ({ ...previous, loanTenure: value }))
            }
            inputType="number"
          />
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Frequency
            <select
              value={termsForm.frequency}
              onChange={(event) =>
                setTermsForm((previous) => ({
                  ...previous,
                  frequency: event.target.value,
                }))
              }
              className="border border-gray-300 px-3 py-2 font-normal text-gray-900"
            >
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Quarterly</option>
              <option>Yearly</option>
            </select>
          </label>
          <TextInput
            label="Due day"
            value={termsForm.dueDay}
            onChangeHandler={(value) =>
              setTermsForm((previous) => ({ ...previous, dueDay: value }))
            }
            inputType="number"
          />
          <TextInput
            label="Repayment start date"
            value={termsForm.emiStartDate}
            onChangeHandler={(value) =>
              setTermsForm((previous) => ({ ...previous, emiStartDate: value }))
            }
            inputType="date"
          />
          <Button type="submit" className="w-full">
            Save terms
          </Button>
        </form>
      </Modal>
      <Modal
        show={modal === "document"}
        onClose={() => {
          setModal("");
          setEditingDocument(null);
        }}
        title={editingDocument ? "Edit document link" : "Add document link"}
      >
        <form onSubmit={handleDocument} className="space-y-4">
          <TextInput
            label="Document name"
            value={documentForm.name}
            onChangeHandler={(value) =>
              setDocumentForm((previous) => ({ ...previous, name: value }))
            }
            placeholder="Sanction letter"
            isRequired
          />
          <TextInput
            label="Secure URL"
            value={documentForm.url}
            onChangeHandler={(value) =>
              setDocumentForm((previous) => ({ ...previous, url: value }))
            }
            inputType="url"
            placeholder="https://..."
            isRequired
          />
          <Button type="submit" className="w-full">
            {editingDocument ? "Save document changes" : "Add link"}
          </Button>
          <p className="text-xs text-gray-500">
            Links are stored with this loan. Use a private, access-controlled
            file location.
          </p>
        </form>
      </Modal>
    </main>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-3 text-sm">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-right font-medium text-gray-900">{value}</dd>
    </div>
  );
}

export default LoanTracker;
