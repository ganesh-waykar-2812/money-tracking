import { useEffect, useState } from "react";
import PersonalExpenseList from "../components/PersonalExpenseList";
import { Button } from "../components/reusable/Button";
import Modal from "../components/reusable/Modal";
import TransactionList from "../components/TransactionList";
import WhatsNew from "../components/WhatsNew";
import { VAPID_PUBLIC_KEY } from "../constants/globle";
import { saveSubscription, sendFeedback } from "../services/api";
import MessageModal from "../components/reusable/MessageModal";

export default function Dashboard({
  activeTab,
  setActiveTab,
  tabs,
  expandedSection,
  setExpandedSection,
}) {
  const [feedback, setFeedback] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [msgModal, setMsgModal] = useState({
    show: false,
    type: "success",
    message: "",
  });

  const handleSendFeedback = async () => {
    if (!feedback.trim()) {
      setMsgModal({
        show: true,
        type: "error",
        message: "Please enter your feedback.",
      });
      return;
    }
    setFeedbackLoading(true);
    try {
      await sendFeedback({ message: feedback });

      setMsgModal({
        show: true,
        type: "success",
        message: "Thank you for your feedback!",
      });
      setFeedback("");
    } catch (error) {
      setMsgModal({
        show: true,
        type: "error",
        message: error?.response?.data?.message || "Failed to send feedback",
      });
    }
    setFeedbackLoading(false);
  };

  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  }

  async function subscribeUser() {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      const reg = await navigator.serviceWorker.register("../sw.js");
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      // Send subscription and userId to backend

      await saveSubscription({ subscription });
    }
  }

  const checkNotificationStatus = () => {
    if (!("Notification" in window)) {
      setMsgModal({
        show: true,
        type: "error",
        message: "This browser does not support desktop notification",
      });
      return;
    }
    return Notification.permission; // "granted", "denied", or "default"
  };

  const enableNotification = async () => {
    const currentStatus = checkNotificationStatus();

    if (currentStatus === "granted") {
      subscribeUser();
      return;
    }
    if (currentStatus === "denied") {
      setMsgModal({
        show: true,
        type: "error",
        message:
          "You have denied notifications. You can enable them in your browser settings.",
      });
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      subscribeUser();
    }
  };
  const [isNotificationConfirmationOpen, setIsNotificationConfirmationOpen] =
    useState(false);

  useEffect(() => {
    const registerAndCheck = async () => {
      if ("serviceWorker" in navigator) {
        await navigator.serviceWorker.register("/sw.js");

        const readyReg = await navigator.serviceWorker.ready;

        const existingSubscription =
          await readyReg.pushManager.getSubscription();

        if (!existingSubscription) {
          setIsNotificationConfirmationOpen(true);
        }
      }
    };
    registerAndCheck();
  }, []);

  return (
    <>
      <MessageModal
        show={msgModal.show}
        message={msgModal.message}
        type={msgModal.type}
        onClose={() => setMsgModal({ ...msgModal, show: false })}
      />
      <Modal
        show={isNotificationConfirmationOpen}
        onClose={() => {
          setIsNotificationConfirmationOpen(false);
        }}
        title="Enable Notifications?"
      >
        <div>
          <p>
            We&apos;d like to send you daily reminders at 9 PM to fill your
            expenses. Do you want to enable notifications?
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              onClick={() => {
                setIsNotificationConfirmationOpen(false);
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                const response = await enableNotification();
                if (response) {
                  setMsgModal({
                    show: true,
                    type: "success",
                    message: "Notifications enabled successfully!",
                  });
                }

                setIsNotificationConfirmationOpen(false);
              }}
            >
              Yes
            </Button>
          </div>
        </div>
      </Modal>
      <div className="flex-1 overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex font-sans relative">
        <aside
          className={`
          fixed top-16 hidden left-0 h-[calc(100vh-4rem)] z-20 bg-white shadow-lg rounded-r-2xl p-4 min-w-[180px] max-w-[260px]
          flex-col gap-2 transition-transform duration-300 sm:static sm:translate-x-0 sm:flex sm:mt-8 sm:ml-4 sm:h-fit 
        `}
        >
          <div className="flex flex-col gap-2">
            {tabs.map((section) => (
              <div key={section.key}>
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition text-left w-full ${
                    expandedSection === section.key
                      ? "bg-indigo-500 text-white shadow"
                      : "bg-gray-100 text-gray-700 hover:bg-indigo-100"
                  }`}
                  onClick={() => {
                    setExpandedSection(
                      expandedSection === section.key ? null : section.key
                    );
                    setActiveTab(null); // default to first sub-tab
                  }}
                >
                  <span>{section.icon}</span>
                  <span>{section.label}</span>
                  {section.children && section.children.length > 0 ? (
                    <span className="ml-auto">
                      {expandedSection === section.key ? "▲" : "▼"}
                    </span>
                  ) : null}
                </button>
                {/* Sub-tabs: only show if this section is expanded */}
                {expandedSection === section.key &&
                  section.children &&
                  section.children.length > 0 && (
                    <div className="flex flex-col gap-2 pl-4 pt-4">
                      {section?.children?.map((tabItem) => (
                        <button
                          key={tabItem.key}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition text-left ${
                            activeTab === tabItem.key
                              ? "bg-indigo-400 text-white shadow"
                              : "bg-gray-100 text-gray-700 hover:bg-indigo-100"
                          }`}
                          onClick={() => {
                            setActiveTab(tabItem.key);
                          }}
                        >
                          <span>{tabItem.icon}</span>
                          <span>{tabItem.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col   overflow-auto ">
          <div className=" bg-white/90    flex-1 relative">
            <div className="flex-1 flex flex-col  p-2 sm:p-4 md:p-8">
              {expandedSection === "dashboard" && (
                <div className="">
                  <h1 className="text-2xl font-semibold mb-4 text-indigo-700">
                    Welcome to your Dashboard!
                  </h1>
                  <p className="text-lg text-gray-700 mb-2">
                    The Lend & Borrow and Personal Expenses sections now offer a
                    unified, modern experience. Add, filter, and export your
                    data with ease.
                  </p>
                  <p className="text-md text-gray-500">
                    Use the sidebar to switch between features and get started.
                  </p>
                  <WhatsNew />
                </div>
              )}

              {expandedSection === "transactions" && (
                <>
                  <TransactionList />
                </>
              )}

              {expandedSection === "personalExpenses" && (
                <PersonalExpenseList />
              )}
              {activeTab === "feedbackForm" && (
                <>
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 tracking-tight">
                    Feedback
                  </h2>
                  <div className="bg-white p-4 rounded shadow text-black">
                    <p>
                      We would love to hear your feedback! Please type your
                      message and send it.
                    </p>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded mt-2"
                      rows="4"
                      placeholder="Type your feedback here..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      disabled={feedbackLoading}
                    />
                    <button
                      className="mt-2 button-custom"
                      onClick={handleSendFeedback}
                      disabled={feedbackLoading || !feedback.trim()}
                    >
                      {feedbackLoading ? "Sending..." : "Send Feedback"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
