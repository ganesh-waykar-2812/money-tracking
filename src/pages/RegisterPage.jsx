import { useMemo, useState } from "react";
import { login, register } from "../services/api";
import { useNavigate } from "react-router-dom";
import TextInput from "../components/reusable/TextInput";
import LoadingPopup from "../components/reusable/LoadingPopup";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // <-- Start loading
    const form = activeTab === "Sign Up" ? registerForm : loginForm;
    if (activeTab === "Login") {
      try {
        const res = await login(form);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userName", res.data.user.name); // Save user name
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
      await register(form);
      alert("Registered. Now login.");
      setActiveTab("Login");
    } catch (error) {
      alert(error?.response?.data?.message);
    }
    setLoading(false); // <-- Stop loading
  };

  return (
    <div className="flex flex-1 items-center justify-center ">
      <LoadingPopup show={loading} />
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
  );
}
