import React, { useEffect } from "react";
import { getAllUsers } from "../services/api";

function UserManagement() {
  const [users, setUsers] = React.useState([]);

  const fetchUsers = async () => {
    // await getAllUsers().then((response) => {
    //   setUsers(response.data);
    // });
    try {
      const response = await getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };
  useEffect(() => {
    // fetch users from backend
    fetchUsers();
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
              <tr key={user._id} className="hover:bg-gray-50 transition-colors">
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
    </div>
  );
}

export default UserManagement;
