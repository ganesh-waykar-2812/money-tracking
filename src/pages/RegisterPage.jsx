import { useEffect, useMemo, useState } from "react";
import { login, register, updateMasterKey } from "../services/api";
import { useNavigate } from "react-router-dom";
import TextInput from "../components/reusable/TextInput";
import LoadingPopup from "../components/reusable/LoadingPopup";
import { REQUIRED_TOKEN_VERSION } from "../constants/globle";
import { decryptMasterKey, encryptMasterKey } from "../utils/cryptoUtils";
import CryptoJS from "crypto-js";
import Modal from "../components/reusable/Modal";

export default function RegisterPage({ setUserName }) {
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const tabs = useMemo(() => ["Sign Up", "Login"], []);
  const [activeTab, setActiveTab] = useState("Sign Up");
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [pendingMasterKey, setPendingMasterKey] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // <-- Start loading
    const form = activeTab === "Sign Up" ? registerForm : loginForm;
    const createEncryptedMasterKey = () => {
      const mk = CryptoJS.lib.WordArray.random(32).toString(); // generate master key
      console.log("Generated Master Key:", mk);
      console.log("Password:", form.password);
      return encryptMasterKey(mk, form.password);
    };
    if (activeTab === "Login") {
      try {
        const res = await login(form);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userName", res.data.user.name); // Save user name
        localStorage.setItem("tokenVersion", REQUIRED_TOKEN_VERSION);
        if (res.data.user.masterKey) {
          localStorage.setItem(
            "masterKey",
            decryptMasterKey(res.data.user.masterKey, form.password)
          );
        } else if (res.data) {
          // Existing user without master key: prompt to generate and save one
          setPendingMasterKey({
            mk: CryptoJS.lib.WordArray.random(32).toString(),
            password: form.password,
          });
          setShowUpgradeModal(true);
          setLoading(false);
          return;
        }
        setUserName(res.data.user.name); // Update state in App
        navigate("/");
      } catch (error) {
        alert(error?.response?.data?.message);
      }
      setLoading(false); // <-- Stop loading
      return;
    }

    // Handle registration logic here
    try {
      const encryptedMasterKey = createEncryptedMasterKey();
      console.log("Encrypted Master Key: register", encryptedMasterKey);
      const payload = {
        ...form,
        encryptedMasterKey,
      };
      await register(payload);
      alert("Registered. Now login.");
      setActiveTab("Login");
    } catch (error) {
      alert(error?.response?.data?.message);
    }
    setLoading(false); // <-- Stop loading
  };

  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const hasSeenHelp = localStorage.getItem("hasSeenHelpModal");
    if (!hasSeenHelp) {
      setShowHelp(true);
      localStorage.setItem("hasSeenHelpModal", "true");
    }
  }, []);

  return (
    <>
      <Modal
        show={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Security Upgrade Required"
      >
        <p className="mb-4">
          Your account needs to be upgraded for enhanced security. Generate a
          master key now?
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <button
            className="button-custom px-6 py-2"
            onClick={async () => {
              setLoading(true);
              try {
                const encryptedMasterKey = encryptMasterKey(
                  pendingMasterKey.mk,
                  pendingMasterKey.password
                );
                const response = await updateMasterKey({ encryptedMasterKey });

                localStorage.setItem(
                  "masterKey",
                  response?.data?.user.masterKey
                );
                setShowUpgradeModal(false);
                setLoading(false);

                setUserName(response?.data?.user.name);
                navigate("/");
              } catch (error) {
                console.log("error", error);
                setLoading(false);
                alert(
                  error?.response?.data?.message ||
                    "Upgrade failed. Please try again."
                );
              }
            }}
          >
            Yes, Upgrade
          </button>
          <button
            className="button-custom bg-gray-200 text-gray-700 px-6 py-2"
            onClick={() => {
              setShowUpgradeModal(false);
              alert("You need to upgrade your account to continue.");
            }}
          >
            Cancel
          </button>
        </div>
      </Modal>
      <div className="flex flex-1 items-center justify-center ">
        <LoadingPopup show={loading} />
        {/* Help Modal */}
        {showHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40  overflow-y-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full text-left text-black mt-8 relative max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-black"
                onClick={() => setShowHelp(false)}
                aria-label="Close"
              >
                ×
              </button>
              <h2 className="text-xl font-bold mb-2">
                How to Use Your Dashboard
              </h2>
              {/* What's New Section */}
              <div className="mb-4 p-3 rounded bg-indigo-50 border border-indigo-200 ">
                <h3 className="font-semibold text-indigo-700 mb-1">
                  🚀 What's New
                </h3>
                <ul className="list-disc ml-5 text-indigo-800 text-base space-y-1">
                  <li>
                    <b>UI Improvement</b> for transactions list and expense list
                  </li>
                  <li>
                    <b>Sorting</b> Now transaction and expenses sorted by
                    decending order of date.
                  </li>
                </ul>
              </div>
              <ul className="list-disc ml-5 space-y-2 text-base">
                <li>
                  <b>Welcome Screen:</b> When you log in, you'll see a welcome
                  message. Use the sidebar to select a feature and get started.
                </li>
                <li>
                  <b>Lend & Borrow:</b> Add people, record money you lend,
                  borrow, receive, or repay. View summaries and all
                  transactions.
                </li>
                <li>
                  <b>Personal Expenses:</b> Track your own expenses by category,
                  see monthly lists and summaries.
                </li>
                <li>
                  <b>Export as PDF:</b> You can export both transactions and
                  personal expenses as PDF files, including summaries and
                  applied filters.
                </li>
                <li>Use the sidebar to switch between features and tabs.</li>
                <li>
                  All your data is securely saved and only visible to you.
                </li>
              </ul>
            </div>
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
        >
          <div className="grid grid-cols-2 justify-between items-center mb-6 bg-[#EDEEEF] rounded-xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`text-gray-800 px-1 text-center cursor-pointer ${
                  activeTab === tab ? "bg-white rounded-xl" : ""
                }`}
                onClick={() => {
                  handleTabChange(tab);
                }}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>{" "}
          {activeTab === "Sign Up" ? (
            <>
              <div className="mb-4">
                <TextInput
                  value={registerForm.name}
                  placeholder={"Name"}
                  onChangeHandler={(value) => {
                    setRegisterForm({ ...registerForm, name: value });
                  }}
                />
              </div>
              <div className="mb-4">
                <TextInput
                  value={registerForm.email}
                  placeholder={"Email"}
                  onChangeHandler={(value) => {
                    setRegisterForm({ ...registerForm, email: value });
                  }}
                  inputType="email"
                />
              </div>
              <div className="mb-6">
                <TextInput
                  value={registerForm.password}
                  placeholder={"Password"}
                  onChangeHandler={(value) => {
                    setRegisterForm({ ...registerForm, password: value });
                  }}
                  inputType="password"
                />
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <TextInput
                  value={loginForm.email}
                  placeholder={"Email"}
                  onChangeHandler={(value) => {
                    setLoginForm({ ...loginForm, email: value });
                  }}
                  inputType="email"
                />
              </div>
              <div className="mb-6">
                <TextInput
                  value={loginForm.password}
                  placeholder={"Password"}
                  onChangeHandler={(value) => {
                    setLoginForm({ ...loginForm, password: value });
                  }}
                  inputType="password"
                />
              </div>
            </>
          )}
          <button type="submit" className="button-custom w-full">
            {activeTab === "Sign Up" ? "Register" : "Login"}
          </button>
        </form>
      </div>
    </>
  );
}
