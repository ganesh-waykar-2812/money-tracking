import { useEffect, useMemo, useState } from "react";
import {
  login,
  migrateUserDataAPI,
  register,
  updateMasterKey,
} from "../services/api";
import { useNavigate } from "react-router-dom";
import TextInput from "../components/reusable/TextInput";
import LoadingPopup from "../components/reusable/LoadingPopup";
import { REQUIRED_TOKEN_VERSION } from "../constants/globle";
import { decryptMasterKey, encryptMasterKey } from "../utils/cryptoUtils";
import CryptoJS from "crypto-js";
import Modal from "../components/reusable/Modal";
import { Button } from "../components/reusable/Button";
import WhatsNew from "../components/WhatsNew";
import MessageModal from "../components/reusable/MessageModal";

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

  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [migrationLoading, setMigrationLoading] = useState(false);
  const [msgModal, setMsgModal] = useState({
    show: false,
    type: "success",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // <-- Start loading
    const form = activeTab === "Sign Up" ? registerForm : loginForm;
    const createEncryptedMasterKey = () => {
      const mk = CryptoJS.lib.WordArray.random(32).toString(); // generate master key

      return encryptMasterKey(mk, form.password);
    };
    if (activeTab === "Login") {
      try {
        const res = await login(form);
        if (res.data.isMigrationRequired) {
          setShowMigrationModal(true);
          localStorage.setItem("token", res.data.token);

          // Store any info needed for migration (e.g., encryptedMasterKey, etc.)
        } else {
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
        }
      } catch (error) {
        setMsgModal({
          show: true,
          type: "error",
          message:
            error?.response?.data?.message || "Login failed. Please try again.",
        });
      }
      setLoading(false); // <-- Stop loading
      return;
    }

    // Handle registration logic here
    try {
      const encryptedMasterKey = createEncryptedMasterKey();

      const payload = {
        ...form,
        encryptedMasterKey,
      };
      await register(payload);

      setMsgModal({
        show: true,
        type: "success",
        message: "Registered successfully. Please log in.",
      });
      setActiveTab("Login");
    } catch (error) {
      setMsgModal({
        show: true,
        type: "error",
        message:
          error?.response?.data?.message ||
          "Registration failed. Please try again.",
      });
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

  // Migration handler
  const handleMigrateData = async () => {
    setMigrationLoading(true);
    try {
      // Call migration API (implement in backend)
      await migrateUserDataAPI({
        password: loginForm.password,
        email: loginForm.email,
      }); // You need to implement this

      setMsgModal({
        show: true,
        type: "success",
        message: "Migration successful! Please log in again.",
      });
      setShowMigrationModal(false);

      // Reload or redirect as needed
    } catch (error) {
      setMsgModal({
        show: true,
        type: "error",
        message:
          error?.response?.data?.message ||
          "Migration failed. Please try again.",
      });
    }
    setMigrationLoading(false);
  };

  return (
    <>
      {" "}
      <MessageModal
        show={msgModal.show}
        message={msgModal.message}
        type={msgModal.type}
        onClose={() => setMsgModal({ ...msgModal, show: false })}
      />
      <Modal
        show={showMigrationModal}
        onClose={() => setShowMigrationModal(false)}
        title="Data Migration Required"
      >
        <p className="mb-4">
          Your account's data needs to be migrated for improved security. This
          process will re-encrypt your data with your new master key.
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <Button onClick={handleMigrateData} disabled={migrationLoading}>
            {migrationLoading ? "Migrating..." : "Migrate Now"}
          </Button>
          <Button
            onClick={() => setShowMigrationModal(false)}
            disabled={migrationLoading}
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      </Modal>
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
          <Button
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
                  decryptMasterKey(
                    response?.data?.user.masterKey,
                    pendingMasterKey.password
                  )
                );
                setShowUpgradeModal(false);
                setLoading(false);

                setUserName(response?.data?.user.name);
                navigate("/");
              } catch (error) {
                setLoading(false);

                setMsgModal({
                  show: true,
                  type: "error",
                  message:
                    error?.response?.data?.message ||
                    "Failed to upgrade. Please try again.",
                });
              }
            }}
          >
            Yes, Upgrade
          </Button>
          <Button
            onClick={() => {
              setShowUpgradeModal(false);

              setMsgModal({
                show: true,
                type: "error",
                message: "You need to upgrade your account to continue.",
              });
            }}
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      </Modal>
      <div className="flex flex-1 items-center justify-center ">
        <LoadingPopup show={loading} />
        {/* Help Modal */}
        <Modal
          show={showHelp}
          onClose={() => setShowHelp(false)}
          title="How to Use Your Dashboard"
        >
          <WhatsNew />
        </Modal>

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
          <Button type="submit" className=" w-full">
            {activeTab === "Sign Up" ? "Register" : "Login"}
          </Button>
        </form>
      </div>
    </>
  );
}
