import React, { useEffect } from "react";
import { getAllFeedbacks } from "../services/api";

function FeedbackManagement() {
  const [feedbacks, setFeedbacks] = React.useState([]);

  const fetchFeedbacks = async () => {
    // await getAllUsers().then((response) => {
    //   setUsers(response.data);
    // });
    try {
      const response = await getAllFeedbacks();
      setFeedbacks(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };
  useEffect(() => {
    // fetch users from backend
    fetchFeedbacks();
  }, []);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex flex-1  rounded-lg shadow border border-gray-200 overflow-auto">
        <table className="divide-y divide-gray-200 bg-white">
          {/* Table Head */}
          <thead className="bg-gray-100 text-gray-800 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Email
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold">
                Feedback
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold">
                Created At
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-200 text-gray-700">
            {feedbacks.map((feedback) => (
              <tr
                key={feedback._id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3">{feedback.userId.name}</td>
                <td className="px-4 py-3">{feedback.userId.email}</td>
                <td className="px-4 py-3">{feedback.message}</td>

                <td className="px-4 py-3">
                  {new Date(feedback.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FeedbackManagement;
