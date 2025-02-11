import { useEffect, useState } from "react";
// import axios from "axios";
import { FaUserShield,  FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { PiChefHatThin } from "react-icons/pi";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
const UserList = () => {
  const [users, setUsers] = useState([]);
  const axiosSecure = useAxiosSecure();

  // Fetch all users
  useEffect(() => {
    axiosSecure
      .get("/users") // Adjust the URL if needed
      .then((response) => setUsers(response.data))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  // Update user role
  const updateRole = (email, role) => {
    Swal.fire({
      title: `Are you sure you want to make this user ${role}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosSecure
          .put(`/users/update/${email}`, { role })
          .then(() => {
            Swal.fire("Updated!", `User role updated to ${role}`, "success");
            setUsers((prevUsers) =>
              prevUsers.map((user) =>
                user.email === email ? { ...user, role } : user
              )
            );
          })
          .catch((error) => console.error("Error updating role:", error));
      }
    });
  };

  // Delete user
  const deleteUser = (email) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosSecure
          .delete(`/users/${email}`)
          .then(() => {
            Swal.fire("Deleted!", "User has been deleted.", "success");
            setUsers((prevUsers) =>
              prevUsers.filter((user) => user.email !== email)
            );
          })
          .catch((error) => console.error("Error deleting user:", error));
      }
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User List</h1>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="py-2 px-4 border">Email</th>
            <th className="py-2 px-4 border">Name</th>
            <th className="py-2 px-4 border">Role</th>
            <th className="py-2 px-4 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.email}>
              <td className="py-2 px-4 border">{user.email}</td>
              <td className="py-2 px-4 border">{user.name || "N/A"}</td>
              <td className="py-2 px-4 border">{user.role || "User"}</td>
              <td className="py-2 px-4 border flex gap-4 items-center">
                <button
                  className="text-blue-500 border-r border-black pr-2"
                  onClick={() => updateRole(user.email, "Admin")}
                  title="Make Admin"
                >
                  <FaUserShield size={20} />
                </button>
                <button
                  className="text-green-500 border-r border-black pr-2"
                  onClick={() => updateRole(user.email, "Chef")}
                  title="Make Chef"
                >
                  <PiChefHatThin size={20} />
                </button>
                <button
                  className="text-black "
                  onClick={() => deleteUser(user.email)}
                  title="Delete User"
                >
                  <FaTrashAlt size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
