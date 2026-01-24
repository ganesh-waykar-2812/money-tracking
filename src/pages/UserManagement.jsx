import React, { useEffect, useState } from "react";
import { getAllUsers } from "../services/api";
import { Button } from "../components/reusable/Button";
import LoadingPopup from "../components/reusable/LoadingPopup";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      const sortedUser = response?.data?.sort((a, b) => {
        const date1 = a?.lastFilledDate
          ? new Date(a?.lastFilledDate)
          : new Date(0); // Use epoch date for users without lastFilledDate
        const date2 = b?.lastFilledDate
          ? new Date(b?.lastFilledDate)
          : new Date(0); // Use epoch date for users without lastFilledDate

        // Sort in descending order (latest first)
        return date2 - date1;
      });
      setUsers(sortedUser);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
      <LoadingPopup show={loading} message="Loading users..." />
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex flex-1 rounded-lg shadow border border-gray-200 overflow-auto">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-auto">
            <table className="divide-y divide-gray-200 bg-white min-w-full">
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
                    Admin
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">
                    Migrated
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">
                    Notification Subscribed
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Created At
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Last Expenses Filled
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">{user.name}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3 text-center">
                      {user.isAdmin ? (
                        <span className="px-2 py-1 rounded-md bg-green-100 text-green-700 text-xs font-medium">
                          Yes
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs font-medium">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.isDataMigrated ? (
                        <span className="px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-medium">
                          ✅
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-md bg-gray-200 text-gray-700 text-xs font-medium">
                          ❌
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.isNotificationSubscribed ? (
                        <span className="px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-medium">
                          ✅
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-md bg-gray-200 text-gray-700 text-xs font-medium">
                          ❌
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {user.lastFilledDate
                        ? new Date(user.lastFilledDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden flex flex-col items-center  p-4">
            <div className="w-full  space-y-3">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="w-full bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-300 p-4 shadow-md"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0 ">
                      <h3 className="font-bold text-gray-900 text-lg truncate">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-700 font-medium truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0 ml-2">
                      {user.isAdmin && (
                        <span className="px-3 py-1 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold shadow-sm whitespace-nowrap">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="gap-3 flex flex-wrap">
                    <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg gap-3">
                      <span className="text-gray-600 font-medium text-sm">
                        Migrated
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                          user.isDataMigrated
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                            : "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                        }`}
                      >
                        {user.isDataMigrated ? "✅ Yes" : "❌ No"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg gap-3">
                      <span className="text-gray-600 font-medium text-sm">
                        Notifications
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                          user.isNotificationSubscribed
                            ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                            : "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                        }`}
                      >
                        {user.isNotificationSubscribed ? "✅ Yes" : "❌ No"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 px-3 bg-blue-50 rounded-lg border border-blue-200 gap-3">
                      <span className="text-blue-700 font-semibold text-sm">
                        Created
                      </span>
                      <span className="text-blue-900 font-bold text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 px-3 bg-amber-50 rounded-lg border border-amber-200 gap-3">
                      <span className="text-amber-700 font-semibold text-sm">
                        Last Filled
                      </span>
                      <span className="text-amber-900 font-bold text-sm">
                        {user.lastFilledDate
                          ? new Date(user.lastFilledDate).toLocaleDateString()
                          : "Never"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {!loading && users.length === 0 && (
          <div className="text-center py-8 text-gray-500">No users found</div>
        )}
      </div>
    </>
  );
}

export default UserManagement;
