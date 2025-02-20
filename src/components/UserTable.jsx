// UserTable.js
import React, { useEffect, useState } from "react";

const UserTable = () => {
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const data = [
          {
            id: 1,
            name: "Ivan Dela Cruz",
            role: "Student",
            email: "a.kelley@gmail.com",
          },
          {
            id: 2,
            name: "Lara Santos",
            role: "Teacher",
            email: "larasantos@gmail.com",
          },
          {
            id: 3,
            name: "Miguel Rivera",
            role: "Student",
            email: "miguelrivera@gmail.com",
          },
          {
            id: 4,
            name: "Jasmine Cruz",
            role: "Student",
            email: "jasminecruz@gmail.com",
          },
          {
            id: 5,
            name: "Andrei Bautista",
            role: "Student",
            email: "andreibautista@gmail.com",
          },
          {
            id: 6,
            name: "Carmen Villanueva",
            role: "Student",
            email: "carmenvillanueva@gmail.com",
          },
          {
            id: 7,
            name: "Dylan Reyes",
            role: "Student",
            email: "dylanreyes@gmail.com",
          },
        ];

        setUsersData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsersData();
  }, []);

  return (
    <div className="overflow-x-auto">
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-lg text-gray-500">Loading users...</p>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200 rounded-3xl">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {" "}
                #{" "}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {" "}
                Full Name{" "}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {" "}
                Role{" "}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {" "}
                E-Mail{" "}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usersData.length > 0 ? (
              usersData.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-6 py-4 text-sm text-gray-500"
                  colSpan="4"
                  align="center"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserTable;
