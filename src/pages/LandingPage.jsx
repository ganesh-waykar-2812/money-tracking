import { Link } from "react-router-dom";
import { Button } from "../components/reusable/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-700">Money Tracker</h1>
          <Link to="/register">
            <Button variant="primary">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Track Your Money, Simplify Your Life
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Free online money tracker to manage personal expenses, track lend & borrow 
          transactions, organize trip expenses, and monitor your financial health.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/register">
            <Button variant="primary" className="text-lg px-8 py-3">
              Start Free Today
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="outline" className="text-lg px-8 py-3">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">
          Everything You Need to Manage Your Finances
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-4">📋</div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">
              Lend & Borrow Tracking
            </h4>
            <p className="text-gray-600">
              Keep track of money you lend to others and borrow from friends. 
              Never forget who owes you what.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-4">🧾</div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">
              Personal Expenses
            </h4>
            <p className="text-gray-600">
              Log and categorize your daily expenses. Get insights into your 
              spending patterns with detailed summaries.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-4">✈️</div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">
              Trip Expenses
            </h4>
            <p className="text-gray-600">
              Split expenses with friends during trips. Calculate who owes what 
              and settle up easily.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Why Choose Money Tracker?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🔒</div>
              <h4 className="font-semibold text-gray-900 mb-1">Secure</h4>
              <p className="text-gray-600 text-sm">
                Your data is encrypted and secure
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🆓</div>
              <h4 className="font-semibold text-gray-900 mb-1">Free Forever</h4>
              <p className="text-gray-600 text-sm">
                No hidden fees or subscriptions
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📱</div>
              <h4 className="font-semibold text-gray-900 mb-1">Works Everywhere</h4>
              <p className="text-gray-600 text-sm">
                Access from any device, anytime
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="font-semibold text-gray-900 mb-1">Easy to Use</h4>
              <p className="text-gray-600 text-sm">
                Simple interface, powerful features
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h3 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to Take Control of Your Finances?
        </h3>
        <p className="text-xl text-gray-600 mb-8">
          Join thousands of users who trust Money Tracker for their financial management.
        </p>
        <Link to="/register">
          <Button variant="primary" className="text-lg px-8 py-3">
            Create Free Account
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            Money Tracker &copy; 2026 Ganesh Waykar. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
