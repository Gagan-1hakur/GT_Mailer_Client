import { useState, useEffect } from "react";
import {
  FiEdit,
  FiTrash,
  FiArrowUp,
  FiArrowDown,
  FiDownload,
} from "react-icons/fi";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";

const ViewContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [editContact, setEditContact] = useState(null);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [sortOption, setSortOption] = useState({ field: "name", order: "asc" });
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [newGroup, setNewGroup] = useState(""); // New group for selected contacts
  const itemsPerPage = 50;

  // Fetch contacts and groups from the backend
  useEffect(() => {
    fetchContacts();
    fetchGroups();

    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      fetchContacts();
      fetchGroups();
    }, 30000); // 30 seconds

    return () => clearInterval(interval); // Clear interval on unmount
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch("http://localhost:8000/contact/all");
      const data = await response.json();
      setContacts(data.contacts || []);
      setFilteredContacts(data.contacts || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch("http://localhost:8000/contact/groups");
      const data = await response.json();
      setGroups(data.groups || []);
      console.log(data);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const handleGroupFilter = (group) => {
    setSelectedGroup(group);
    const filtered = group
      ? contacts.filter((contact) => contact.group === group)
      : contacts;
    setFilteredContacts(filtered);
    setCurrentPage(1);
  };

  const handleEditContact = (contact) => {
    setEditContact({ ...contact });
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/contact/edit/${editContact._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editContact),
        }
      );
      if (response.ok) {
        const updatedContacts = contacts.map((contact) =>
          contact._id === editContact._id ? editContact : contact
        );
        setContacts(updatedContacts);
        setFilteredContacts(updatedContacts);
        setEditContact(null);
        alert("Contact updated successfully!");
      } else {
        alert("Failed to update contact.");
      }
    } catch (error) {
      console.error("Error updating contact:", error);
    }
  };

  const handleDeleteContact = async (id) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        const response = await fetch(
          `http://localhost:8000/contact/delete/${id}`,
          {
            method: "DELETE",
          }
        );
        if (response.ok) {
          fetchContacts(); // Refresh contacts
        } else {
          alert("Failed to delete contact.");
        }
      } catch (error) {
        console.error("Error deleting contact:", error);
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (window.confirm("Are you sure you want to delete selected contacts?")) {
      try {
        for (const id of selectedContacts) {
          await fetch(`http://localhost:8000/contact/delete/${id}`, {
            method: "DELETE",
          });
        }
        fetchContacts(); // Refresh contacts
        setSelectedContacts([]);
        alert("Selected contacts deleted successfully!");
      } catch (error) {
        console.error("Error deleting selected contacts:", error);
      }
    }
  };

  const handleChangeGroup = async () => {
    if (!newGroup.trim()) {
      alert("Please select a valid group.");
      return;
    }

    if (window.confirm("Are you sure you want to change the group?")) {
      try {
        for (const id of selectedContacts) {
          await fetch(`http://localhost:8000/contact/edit/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ group: newGroup }),
          });
        }
        fetchContacts(); // Refresh contacts
        setSelectedContacts([]);
        setNewGroup(""); // Reset new group
        alert("Group updated successfully!");
      } catch (error) {
        console.error("Error updating group:", error);
        alert("Failed to update group.");
      }
    }
  };

  const handleSelectContact = (id) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map((contact) => contact._id));
    }
  };

  const handleSort = (field) => {
    const newOrder =
      sortOption.field === field && sortOption.order === "asc" ? "desc" : "asc";
    setSortOption({ field, order: newOrder });
  };

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    if (sortOption.field === "name") {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return sortOption.order === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    }
    if (sortOption.field === "date") {
      return sortOption.order === "asc"
        ? new Date(a.creationDate) - new Date(b.creationDate)
        : new Date(b.creationDate) - new Date(a.creationDate);
    }
    if (sortOption.field === "group") {
      return sortOption.order === "asc"
        ? a.group.localeCompare(b.group)
        : b.group.localeCompare(a.group);
    }
    return 0;
  });

  const paginatedContacts = sortedContacts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedContacts.length / itemsPerPage);

  const handlePageChange = (direction) => {
    setCurrentPage((prev) =>
      Math.max(1, Math.min(prev + direction, totalPages))
    );
  };

  const handleExportCSV = () => {
    const csvData = [
      ["First Name", "Last Name", "Email", "Mobile", "Group", "Date"],
    ];
    filteredContacts.forEach((contact) => {
      csvData.push([
        contact.firstName,
        contact.lastName,
        contact.email,
        contact.mobile || "N/A",
        contact.group,
        new Date(contact.creationDate).toLocaleString(),
      ]);
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvData.map((row) => row.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `contacts_${selectedGroup || "all"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Breadcrumb pageName="View Contacts" />
      <div className="p-6 sm:p-10">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">
          Manage Contacts
        </h1>
        <div className="flex items-center justify-between mb-6">
          <select
            value={selectedGroup}
            onChange={(e) => handleGroupFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="">All Groups</option>
            {groups.map((group, index) => (
              <option key={index} value={group}>
                {group}
              </option>
            ))}
          </select>
          <p className="text-lg font-medium">
            Total Contacts: {contacts.length} | Filtered:{" "}
            {filteredContacts.length}
          </p>
          <button
            onClick={handleExportCSV}
            className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 flex items-center gap-2"
          >
            <FiDownload />
            Export CSV
          </button>
        </div>

        {selectedContacts.length > 0 && (
          <div className="flex items-center gap-4 mb-6">
            <select
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="">Change Group</option>
              {groups.map((group, index) => (
                <option key={index} value={group}>
                  {group}
                </option>
              ))}
            </select>
            <button
              onClick={handleChangeGroup}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              Change Group
            </button>
            <button
              onClick={handleDeleteSelected}
              className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
            >
              Delete Selected
            </button>
          </div>
        )}

        <table className="w-full border border-gray-300 rounded-md shadow-md text-sm">
          <thead>
            <tr className="bg-blue-100 text-left">
              <th className="p-4">
                <input
                  type="checkbox"
                  checked={selectedContacts.length === filteredContacts.length}
                  onChange={handleSelectAll}
                />
              </th>
              {/* icon */}
              <th
                className="p-4 cursor-pointer flex items-center"
                onClick={() => handleSort("name")}
              >
                Name{" "}
                {sortOption.field === "name" &&
                  (sortOption.order === "asc" ? (
                    <FiArrowUp />
                  ) : (
                    <FiArrowDown />
                  ))}
              </th>
              {/* name */}
              <th className="p-4">Email</th>
              <th className="p-4">Mobile</th>
              <th
                className="p-4 cursor-pointer flex items-center"
                onClick={() => handleSort("group")}
              >
                Group{" "}
                {sortOption.field === "group" &&
                  (sortOption.order === "asc" ? (
                    <FiArrowUp />
                  ) : (
                    <FiArrowDown />
                  ))}
              </th>
              {/* Group */}
              <th
                className="p-4 cursor-pointer"
                onClick={() => handleSort("date")}
              >
                Date{" "}
                {sortOption.field === "date" &&
                  (sortOption.order === "asc" ? (
                    <FiArrowUp />
                  ) : (
                    <FiArrowDown />
                  ))}
              </th>
              {/* Date */}
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedContacts.map((contact) => (
              <tr key={contact._id} className="border-t">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(contact._id)}
                    onChange={() => handleSelectContact(contact._id)}
                  />
                </td>
                <td className="p-4">{`${contact.firstName} ${contact.lastName}`}</td>
                <td className="p-4">{contact.email}</td>
                <td className="p-4">{contact.mobile || "N/A"}</td>
                <td className="p-4">{contact.group || "N/A"}</td>
                <td className="p-4">
                  {new Date(contact.creationDate).toLocaleString()}
                </td>
                <td className="p-4 flex gap-4">
                  <button
                    onClick={() => handleEditContact(contact)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteContact(contact._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FiTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => handlePageChange(-1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
          >
            Next
          </button>
        </div>
      </div>

      {editContact && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Edit Contact</h2>
            <input
              type="text"
              value={editContact.firstName}
              onChange={(e) =>
                setEditContact({ ...editContact, firstName: e.target.value })
              }
              placeholder="First Name"
              className="w-full p-2 border border-gray-300 rounded-md mb-2"
            />
            <input
              type="text"
              value={editContact.lastName}
              onChange={(e) =>
                setEditContact({ ...editContact, lastName: e.target.value })
              }
              placeholder="Last Name"
              className="w-full p-2 border border-gray-300 rounded-md mb-2"
            />
            <input
              type="email"
              value={editContact.email}
              onChange={(e) =>
                setEditContact({ ...editContact, email: e.target.value })
              }
              placeholder="Email"
              className="w-full p-2 border border-gray-300 rounded-md mb-2"
            />
            <input
              type="text"
              value={editContact.mobile}
              onChange={(e) =>
                setEditContact({ ...editContact, mobile: e.target.value })
              }
              placeholder="Mobile"
              className="w-full p-2 border border-gray-300 rounded-md mb-2"
            />
            <select
              value={editContact.group}
              onChange={(e) =>
                setEditContact({ ...editContact, group: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
            >
              <option value="">Select Group</option>
              {groups.map((group, index) => (
                <option key={index} value={group}>
                  {group}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setEditContact(null)}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewContacts;
