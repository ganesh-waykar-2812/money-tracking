import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  getTrips,
  createTrip,
  getTrip,
  addTripExpense,
  joinTrip,
} from "../services/api";
import { Button } from "../components/reusable/Button";
import Modal from "../components/reusable/Modal";
import TextInput from "../components/reusable/TextInput";

/* =========================
   UTILS
========================= */
function equalSplit(amount, memberIds) {
  const cents = Math.round(Number(amount) * 100);
  const per = Math.floor(cents / memberIds.length);
  let remainder = cents - per * memberIds.length;

  return memberIds.map((id) => {
    const extra = remainder-- > 0 ? 1 : 0;
    return { userId: id, amount: (per + extra) / 100 };
  });
}

function computeBalances(data) {
  if (!data?.trip || !data?.expenses) return [];

  const members = data.trip.members.map((m) => ({
    id: m.userId._id,
    name: m.userId.name,
  }));

  const balances = {};
  members.forEach((m) => {
    balances[m.id] = { user: m, paid: 0, owed: 0 };
  });

  const memberIds = members.map((m) => m.id);

  data.expenses.forEach((e) => {
    const amount = Number(e.amount);
    balances[e.paidBy._id].paid += amount;

    const splits = equalSplit(amount, memberIds);
    splits.forEach((s) => {
      balances[s.userId].owed += s.amount;
    });
  });

  return Object.values(balances).map((b) => ({
    ...b,
    balance: Number((b.paid - b.owed).toFixed(2)),
  }));
}

function computeSettlements(balances) {
  const creditors = [];
  const debtors = [];

  balances.forEach((b) => {
    const cents = Math.round(b.balance * 100);
    if (cents > 0) creditors.push({ ...b, cents });
    if (cents < 0) debtors.push({ ...b, cents: -cents });
  });

  const result = [];
  let i = 0,
    j = 0;

  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].cents, creditors[j].cents);

    result.push({
      from: debtors[i].user.name,
      to: creditors[j].user.name,
      amount: (pay / 100).toFixed(2),
    });

    debtors[i].cents -= pay;
    creditors[j].cents -= pay;

    if (debtors[i].cents === 0) i++;
    if (creditors[j].cents === 0) j++;
  }

  return result;
}

/* =========================
   COMPONENT
========================= */

function JoinTripForm({ onJoined, openTrip }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!code) return;
    setLoading(true);
    try {
      const res = await joinTrip({ inviteCode: code });
      const tripId = res?.data?.trip?._id || res?.data?._id;
      setCode("");
      onJoined();
      if (tripId) {
        openTrip(tripId);
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to join trip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 p-4 border rounded-lg bg-gray-50">
      <h3 className="font-semibold mb-2">Join a Trip</h3>
      <div className="flex gap-2">
        <TextInput
          value={code}
          onChangeHandler={setCode}
          placeholder="Enter invite code"
        />
        <Button
          onClick={handleJoin}
          disabled={loading}
          variant="primary"
          loading={loading}
        >
          {loading ? "Joining..." : "Join"}
        </Button>
      </div>
    </div>
  );
}

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [creatingTrip, setCreatingTrip] = useState(false);

  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    if (params.id) openTrip(params.id);
  }, [params.id]);

  const fetchTrips = async () => {
    const res = await getTrips();
    setTrips(res.data || []);
  };

  const openTrip = async (id) => {
    navigate(`/trips/${id}`);
    const res = await getTrip(id);
    const data = res.data;

    data.balances = computeBalances(data);
    setSelectedTrip(data);
    setShowModal(true);
  };

  const createTripHandler = async () => {
    if (!name || creatingTrip) return;
    setCreatingTrip(true);
    try {
      await createTrip({ name });
      setName("");
      fetchTrips();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create trip");
    } finally {
      setCreatingTrip(false);
    }
  };

  const [addingExpense, setAddingExpense] = useState(false);

  const addExpenseHandler = async () => {
    if (!amount || addingExpense) return;

    setAddingExpense(true);
    try {
      await addTripExpense(selectedTrip.trip._id, {
        amount: Number(amount),
        description: desc,
      });

      await openTrip(selectedTrip.trip._id); // refresh data
      setAmount("");
      setDesc("");
    } catch (err) {
      console.error(err);
      alert("Failed to add expense");
    } finally {
      setAddingExpense(false);
    }
  };

  const settlements = selectedTrip
    ? computeSettlements(selectedTrip.balances)
    : [];

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">Trips</h2>

      <div className="flex gap-2 mb-4">
        <TextInput
          value={name}
          onChangeHandler={setName}
          placeholder="Trip name"
        />
        <Button
          onClick={createTripHandler}
          disabled={creatingTrip || !name}
          variant="primary"
          loading={creatingTrip}
        >
          {creatingTrip ? "Creating..." : "Create"}
        </Button>
      </div>
      <JoinTripForm onJoined={fetchTrips} openTrip={openTrip} />
      <ul className="divide-y divide-gray-200">
        {trips.map((t) => (
          <li key={t._id} className="flex justify-between py-2 text-gray-800">
            <span>{t.name}</span>
            <Button
              size="sm"
              onClick={() => openTrip(t._id)}
              variant="secondary"
            >
              Open
            </Button>
          </li>
        ))}
      </ul>

      {showModal && selectedTrip && (
        <Modal
          show={showModal}
          onClose={() => {
            setShowModal(false);
            navigate("/trips");
          }}
          title={selectedTrip.trip.name}
        >
          {/* INVITE SECTION */}
          <div className="mb-4 p-3 rounded-lg border bg-indigo-50">
            <div className="text-sm text-indigo-700 mb-1">
              Invite others to this trip
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              {/* Invite Code */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Code:</span>
                <span className="font-mono font-semibold bg-white px-3 py-1 rounded border">
                  {selectedTrip.trip.inviteCode}
                </span>
                <Button
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedTrip.trip.inviteCode);
                    alert("Invite code copied");
                  }}
                >
                  Copy Code
                </Button>
              </div>

              {/* Invite Link */}
              <Button
                size="sm"
                onClick={() => {
                  const link = `${window.location.origin}/trips/${selectedTrip.trip._id}`;
                  navigator.clipboard.writeText(link);
                  alert("Invite link copied");
                }}
              >
                Copy Invite Link
              </Button>
            </div>
          </div>

          {/* TOTAL TRIP EXPENSE */}
          <div className="mb-4 p-3 rounded-lg bg-indigo-50 border border-indigo-200">
            <div className="text-sm text-indigo-700">Total Trip Expense</div>
            <div className="text-2xl font-bold text-indigo-900">
              ₹{getTotalTripExpense(selectedTrip.expenses).toFixed(2)}
            </div>
          </div>

          {/* USER-WISE EXPENSE DETAILS */}
          <h4 className="font-semibold mb-2">User-wise Expense Details</h4>

          <div className="space-y-4 mb-6">
            {Object.values(groupExpensesByUser(selectedTrip.expenses)).map(
              (u) => (
                <div
                  key={u.user._id}
                  className="border rounded-lg p-3 bg-gray-50"
                >
                  <div className="font-semibold text-gray-800 mb-1">
                    {u.user.name}
                  </div>

                  <ul className="text-sm space-y-1">
                    {u.items.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between text-gray-700"
                      >
                        <span>• {item.description}</span>
                        <span>₹{item.amount.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex justify-between font-semibold mt-2 border-t pt-1">
                    <span>Total</span>
                    <span>₹{u.total.toFixed(2)}</span>
                  </div>
                </div>
              ),
            )}
          </div>

          {/* BALANCES */}
          <h4 className="font-semibold mb-2">Balances</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {selectedTrip.balances.map((b) => (
              <div key={b.user.id} className="border rounded-lg p-3 bg-white">
                <div className="font-semibold">{b.user.name}</div>
                <div className="text-sm text-gray-600">
                  Share: ₹{b.owed.toFixed(2)}
                </div>
                <div
                  className={`mt-1 font-semibold ${
                    b.balance === 0
                      ? "text-gray-700"
                      : b.balance > 0
                        ? "text-green-600"
                        : "text-red-600"
                  }`}
                >
                  {b.balance === 0
                    ? "Settled"
                    : b.balance > 0
                      ? `Gets ₹${b.balance}`
                      : `Pays ₹${Math.abs(b.balance)}`}
                </div>
              </div>
            ))}
          </div>

          {/* SETTLEMENTS */}
          {settlements.length > 0 && (
            <>
              <h4 className="mt-4 font-semibold">Settlements</h4>
              {settlements.map((s, i) => (
                <div key={i} className="text-sm">
                  {s.from} pays <b>{s.to}</b> ₹{s.amount}
                </div>
              ))}
            </>
          )}

          {/* ADD EXPENSE */}
          <h4 className="mt-4 font-semibold">Add Expense</h4>
          <input
            className="border p-2 w-full mb-2"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input
            className="border p-2 w-full mb-2"
            placeholder="Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <Button
            onClick={addExpenseHandler}
            disabled={addingExpense || !amount}
            variant="success"
            loading={addingExpense}
          >
            {addingExpense ? "Adding..." : "Add Expense"}
          </Button>
        </Modal>
      )}
    </div>
  );
}

function groupExpensesByUser(expenses = []) {
  return expenses.reduce((acc, e) => {
    const userId = e.paidBy._id;
    if (!acc[userId]) {
      acc[userId] = {
        user: e.paidBy,
        items: [],
        total: 0,
      };
    }
    acc[userId].items.push({
      description: e.description || "—",
      amount: Number(e.amount),
    });
    acc[userId].total += Number(e.amount);
    return acc;
  }, {});
}

function getTotalTripExpense(expenses = []) {
  return expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
}
