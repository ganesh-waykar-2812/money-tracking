import React, { useState } from "react";
import Dropdown from "../reusable/Dropdown";
import TextInput from "../reusable/TextInput";
import { Button } from "../reusable/Button";
import { addLoan, updateLoan } from "../../services/api";

const LOAN_TYPES = [
  "Personal Loan",
  "Home Loan",
  "Car Loan",
  "Education Loan",
  "Business Loan",
  "Gold Loan",
  "Credit Card Debt",
  "Friends & Family",
  "Other",
];

// A. Basic information
// Field	Example
// Loan Name	Home Loan – BOB
// Loan Type	Home Loan
// Direction	Borrowed / Lent
// Lender / Borrower	Bank of Baroda
// Loan Account Number	Optional
// Description	Home purchase
// Start Date	01-Nov-2026

// B. Financial details
// Field	Example
// Principal Amount	₹30,00,000
// Interest Rate	7.55%
// Interest Type	Fixed / Floating
// Interest Calculation	Reducing Balance / Flat
// Loan Tenure	180 months
// Currency	INR
// Processing Fee	₹10,000

// C. Repayment configuration
// Field	Example
// Repayment Method	EMI
// EMI Amount	₹32,313
// Frequency	Monthly
// EMI Start Date	05-Dec-2026
// Due Day	5
// Auto Payment	Yes / No
// End Date	Calculated

// Important: Not every loan has an EMI. Therefore, repayment configuration should depend on the selected repayment method.

const toOptions = (values) =>
  values.map((value) => ({ _id: value, name: value }));

const dateInputValue = (value) =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

const createInitialForm = (loan = {}) => ({
  loanName: loan.loanName || "",
  loanType: loan.loanType || "",
  direction: loan.direction || "",
  lenderBorrower: loan.lenderBorrower || "",
  loanAccountNumber: loan.loanAccountNumber || "",
  description: loan.description || "",
  startDate: dateInputValue(loan.startDate),
  initialDisbursementDate: "",
  principalAmount: loan.principalAmount ?? "",
  interestRate: loan.interestRate ?? "",
  interestType: loan.interestType || "",
  interestCalculation: loan.interestCalculation || "",
  loanTenure: loan.loanTenure ?? "",
  currency: loan.currency || "INR",
  processingFee: loan.processingFee ?? "",
  repaymentMethod: loan.repaymentMethod || "",
  emiAmount: loan.emiAmount ?? "",
  frequency: loan.frequency || "",
  emiStartDate: dateInputValue(loan.emiStartDate),
  interestPeriodStartDate: dateInputValue(
    loan.interestPeriodStartDate || loan.startDate,
  ),
  dueDay: loan.dueDay ?? "",
  autoPayment: loan.autoPayment ?? false,
  offsetFacilityEnabled: loan.offsetFacilityEnabled ?? false,
  endDate: dateInputValue(loan.endDate),
});

function AddNewLoanForm({ onSubmit, initialData, loanId }) {
  const isEditing = Boolean(initialData?._id || loanId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState(() => createInitialForm(initialData));

  const updateField = (field, value) =>
    setForm((previous) => ({ ...previous, [field]: value }));
  const hasScheduledRepayment =
    form.repaymentMethod !== "No scheduled repayment";
  const endDate = (() => {
    const months = Number(form.loanTenure);
    if (!form.startDate || !Number.isInteger(months) || months <= 0) return "";
    const [year, month, day] = form.startDate.split("-").map(Number);
    const targetMonth = month - 1 + months;
    const targetYear = year + Math.floor(targetMonth / 12);
    const normalizedMonth = (targetMonth % 12) + 1;
    const lastDay = new Date(
      Date.UTC(targetYear, normalizedMonth, 0),
    ).getUTCDate();
    const endDay = Math.min(day, lastDay);
    return `${targetYear}-${String(normalizedMonth).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;
  })();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const optionalNumber = (value) =>
      value === "" || value === undefined || value === null
        ? undefined
        : Number(value);
    const payload = {
      ...form,
      principalAmount: Number(form.principalAmount),
      disbursedAmount: optionalNumber(form.disbursedAmount),
      interestRate: optionalNumber(form.interestRate),
      loanTenure: optionalNumber(form.loanTenure),
      processingFee: optionalNumber(form.processingFee),
      emiAmount: optionalNumber(form.emiAmount),
      dueDay: optionalNumber(form.dueDay),
      emiStartDate: form.emiStartDate || undefined,
      interestPeriodStartDate:
        form.interestPeriodStartDate || form.startDate || undefined,
      endDate: endDate || undefined,
      initialDisbursementDate: form.initialDisbursementDate || form.startDate,
    };

    try {
      const response = isEditing
        ? await updateLoan(loanId || initialData._id, payload)
        : await addLoan(payload);
      if (!isEditing) setForm(createInitialForm());
      onSubmit?.(response.data);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Failed to save loan. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-black">
      <section className="space-y-3">
        <h3 className="border-b pb-2 text-base font-semibold text-gray-800">
          Basic information
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextInput
            label="Loan name"
            value={form.loanName}
            onChangeHandler={(value) => updateField("loanName", value)}
            placeholder="e.g. Home Loan - BOB"
            isRequired
          />
          <Dropdown
            label="Loan type"
            value={{ _id: form.loanType, name: form.loanType }}
            onChangeHandler={(selected) =>
              updateField("loanType", selected._id)
            }
            options={toOptions(LOAN_TYPES)}
            placeholder="Select loan type"
            required
          />
          <Dropdown
            label="Direction"
            value={{ _id: form.direction, name: form.direction }}
            onChangeHandler={(selected) =>
              updateField("direction", selected._id)
            }
            options={toOptions(["Borrowed", "Lent"])}
            placeholder="Select direction"
            required
          />
          <TextInput
            label={form.direction === "Lent" ? "Borrower" : "Lender"}
            value={form.lenderBorrower}
            onChangeHandler={(value) => updateField("lenderBorrower", value)}
            placeholder={
              form.direction === "Lent"
                ? "Who borrowed the money?"
                : "Who provided the loan?"
            }
            isRequired
          />
          <TextInput
            label="Loan account number"
            value={form.loanAccountNumber}
            onChangeHandler={(value) => updateField("loanAccountNumber", value)}
            placeholder="Optional"
          />
          <TextInput
            label="Start date"
            value={form.startDate}
            onChangeHandler={(value) => updateField("startDate", value)}
            inputType="date"
            isRequired
          />
          <TextInput
            label="Description"
            value={form.description}
            onChangeHandler={(value) => updateField("description", value)}
            placeholder="What is this loan for?"
            className="md:col-span-2"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="border-b pb-2 text-base font-semibold text-gray-800">
          Financial details
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextInput
            label="Principal amount"
            value={form.principalAmount}
            onChangeHandler={(value) => updateField("principalAmount", value)}
            inputType="number"
            placeholder="0.00"
            isRequired
          />
          {!isEditing && (
            <TextInput
              label="Initially disbursed amount"
              value={form.disbursedAmount || ""}
              onChangeHandler={(value) => updateField("disbursedAmount", value)}
              inputType="number"
              placeholder="Defaults to the full sanctioned amount"
            />
          )}
          {!isEditing && (
            <TextInput
              label="Initial disbursement date"
              value={form.initialDisbursementDate || form.startDate}
              onChangeHandler={(value) =>
                updateField("initialDisbursementDate", value)
              }
              inputType="date"
              isRequired
            />
          )}
          <TextInput
            label="Interest rate (%)"
            value={form.interestRate}
            onChangeHandler={(value) => updateField("interestRate", value)}
            inputType="number"
            placeholder="e.g. 7.55"
          />
          <Dropdown
            label="Interest type"
            value={{ _id: form.interestType, name: form.interestType }}
            onChangeHandler={(selected) =>
              updateField("interestType", selected._id)
            }
            options={toOptions(["Fixed", "Floating"])}
            placeholder="Select interest type"
          />
          <Dropdown
            label="Interest calculation"
            value={{
              _id: form.interestCalculation,
              name: form.interestCalculation,
            }}
            onChangeHandler={(selected) =>
              updateField("interestCalculation", selected._id)
            }
            options={toOptions(["Reducing Balance", "Flat"])}
            placeholder="Select calculation"
          />
          <TextInput
            label="Loan tenure (months)"
            value={form.loanTenure}
            onChangeHandler={(value) => updateField("loanTenure", value)}
            inputType="number"
            placeholder="e.g. 180"
          />
          <TextInput
            label="Currency"
            value={form.currency}
            onChangeHandler={(value) =>
              updateField("currency", value.toUpperCase())
            }
            placeholder="INR"
            isRequired
          />
          <TextInput
            label="Processing fee"
            value={form.processingFee}
            onChangeHandler={(value) => updateField("processingFee", value)}
            inputType="number"
            placeholder="0.00"
          />
        </div>
      </section>

      {(form.direction === "Borrowed" || form.offsetFacilityEnabled) && (
        <section className="space-y-3">
          <h3 className="border-b pb-2 text-base font-semibold text-gray-800">
            Interest offset facility
          </h3>
          <label className="flex items-start gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.offsetFacilityEnabled}
              onChange={(event) =>
                updateField("offsetFacilityEnabled", event.target.checked)
              }
              className="mt-0.5 h-4 w-4 accent-emerald-700"
            />
            <span>
              <span className="block font-medium">
                Track surplus balance for daily interest offset
              </span>
              <span className="mt-1 block text-gray-500">
                Daily interest is estimated on the outstanding principal less
                the dated surplus balance. Deposits do not repay principal.
              </span>
            </span>
          </label>
        </section>
      )}

      <section className="space-y-3">
        <h3 className="border-b pb-2 text-base font-semibold text-gray-800">
          Repayment configuration
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Dropdown
            label="Repayment method"
            value={{ _id: form.repaymentMethod, name: form.repaymentMethod }}
            onChangeHandler={(selected) =>
              updateField("repaymentMethod", selected._id)
            }
            options={toOptions([
              "EMI",
              "Interest-only",
              "Bullet repayment",
              "No scheduled repayment",
            ])}
            placeholder="Select repayment method"
            required
          />
          {form.repaymentMethod === "EMI" && (
            <TextInput
              label="EMI amount"
              value={form.emiAmount}
              onChangeHandler={(value) => updateField("emiAmount", value)}
              inputType="number"
              placeholder="0.00"
              isRequired
            />
          )}
          {hasScheduledRepayment && form.repaymentMethod && (
            <>
              <Dropdown
                label="Frequency"
                value={{ _id: form.frequency, name: form.frequency }}
                onChangeHandler={(selected) =>
                  updateField("frequency", selected._id)
                }
                options={toOptions([
                  "Weekly",
                  "Monthly",
                  "Quarterly",
                  "Yearly",
                ])}
                placeholder="Select frequency"
                required
              />
              <TextInput
                label="Repayment start date"
                value={form.emiStartDate}
                onChangeHandler={(value) => updateField("emiStartDate", value)}
                inputType="date"
                isRequired
              />
              <TextInput
                label="Previous interest cycle date"
                value={form.interestPeriodStartDate || form.startDate}
                onChangeHandler={(value) =>
                  updateField("interestPeriodStartDate", value)
                }
                inputType="date"
              />
              <TextInput
                label="Due day"
                value={form.dueDay}
                onChangeHandler={(value) => updateField("dueDay", value)}
                inputType="number"
                placeholder="1-31"
              />
              <label className="flex items-center gap-2 self-end pb-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.autoPayment}
                  onChange={(event) =>
                    updateField("autoPayment", event.target.checked)
                  }
                  className="h-4 w-4 accent-blue-600"
                />
                Auto payment
              </label>
            </>
          )}
          <TextInput
            label="End date (calculated)"
            value={endDate}
            onChangeHandler={() => {}}
            inputType="date"
            disabled
          />
        </div>
      </section>

      {errorMessage && (
        <p role="alert" className="text-sm text-red-600">
          {errorMessage}
        </p>
      )}
      <Button type="submit" className="w-full" loading={isSubmitting}>
        {isSubmitting
          ? isEditing
            ? "Updating loan..."
            : "Saving loan..."
          : isEditing
            ? "Save changes"
            : "Save loan"}
      </Button>
    </form>
  );
}

export default AddNewLoanForm;
