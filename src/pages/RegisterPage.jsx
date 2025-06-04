import { useMemo, useState } from "react";
import { login, register } from "../services/api";
import { useNavigate } from "react-router-dom";
import TextInput from "../components/reusable/TextInput";

export default function RegisterPage() {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = activeTab === "Sign Up" ? registerForm : loginForm;
    if (activeTab === "Login") {
      // Handle login logic here
      // You can call a login function from your API service
      try {
        const res = await login(form);
        localStorage.setItem("token", res.data.token);
        navigate("/");
      } catch (error) {
        console.log("error", error?.response?.data?.message);
        alert(error?.response?.data?.message);
      }
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
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Lend & Borrow
        </h2>
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
