import { useState } from "react";
import { FiPlus, FiEdit, FiTrash, FiDownload, FiArrowDownCircle } from "react-icons/fi";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";

let contactIdCounter = 1; // Counter for unique numerical ID

const AddContact = () => {
  const [groupName, setGroupName] = useState("");
  const [groupList, setGroupList] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    group: "",
  });
  const [editContact, setEditContact] = useState(null);
  const [filterGroup, setFilterGroup] = useState("");
  const [sortOption, setSortOption] = useState("name-asc");

  const handleAddGroup = () => {
    if (groupName.trim() === "") {
      alert("Group name cannot be empty.");
      return;
    }
    if (groupList.includes(groupName)) {
      alert("This group name already exists.");
      return;
    }
    setGroupList([...groupList, groupName]);
    setGroupName(""); // Clear input after adding
  };

  const isDuplicateContact = (email, mobile) => {
    return contacts.some(
      (contact) => contact.email === email || contact.mobile === mobile
    );
  };

  const handleAddContact = () => {
    const { email, mobile, group } = newContact;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      alert("Please enter a valid email.");
      return;
    }

    // Validate mobile (if provided)
    if (mobile && (!/^\d{10}$/.test(mobile) || mobile.length !== 10)) {
      alert("Mobile number must be exactly 10 digits.");
      return;
    }

    // Validate group
    if (!group) {
      alert("Please select a group.");
      return;
    }

    // Check for duplicates
    if (isDuplicateContact(email, mobile)) {
      alert("This email or mobile number already exists in the contact list.");
      return;
    }

    // Add new contact with a unique numerical ID
    const creationDate = new Date().toLocaleString();
    const contactWithId = { ...newContact, id: contactIdCounter++, creationDate };
    setContacts([...contacts, contactWithId]);
    setNewContact({ firstName: "", lastName: "", email: "", mobile: "", group: "" }); // Clear the form
  };

  const openEditModal = (contact) => {
    setEditContact(contact);
  };

  const closeEditModal = () => {
    setEditContact(null);
  };

  const handleSaveEdit = () => {
    const updatedContacts = contacts.map((contact) =>
      contact.id === editContact.id ? editContact : contact
    );
    setContacts(updatedContacts);
    closeEditModal();
  };

  const handleDeleteContact = (index) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        const rows = content.split("\n");
        const uploadedContacts = rows.map((row) => {
          const [firstName, lastName, email, mobile, group] = row.split(",");
          
          // Validate fields and check for duplicates
          if (
            email &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
            (!mobile || /^\d{10}$/.test(mobile)) &&
            group &&
            !isDuplicateContact(email, mobile)
          ) {
            return {
              id: contactIdCounter++, // Assign a numerical unique ID to each uploaded contact
              firstName: firstName?.trim() || "",
              lastName: lastName?.trim() || "",
              email: email?.trim(),
              mobile: mobile?.trim() || "",
              group: group?.trim(),
              creationDate: new Date().toLocaleString(),
            };
          } else if (isDuplicateContact(email, mobile)) {
            alert(`Duplicate entry found for email: ${email} or mobile: ${mobile}`);
          }
          return null;
        });
        setContacts([...contacts, ...uploadedContacts.filter((contact) => contact !== null)]);
      };
      reader.readAsText(file);
    }
  };

  const downloadSampleFile = () => {
    const sampleData = `First Name,Last Name,Email,Mobile,Group\nJohn,Doe,john.doe@example.com,1234567890,Friends\nJane,Smith,jane.smith@example.com,,Family`;
    const blob = new Blob([sampleData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sample_contacts.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filtering and Sorting Contacts
  const filteredContacts = filterGroup
    ? contacts.filter((contact) => contact.group === filterGroup)
    : contacts;

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    switch (sortOption) {
      case "name-asc":
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      case "name-desc":
        return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
      case "group-asc":
        return a.group.localeCompare(b.group);
      case "group-desc":
        return b.group.localeCompare(a.group);
      case "date-asc":
        return new Date(a.creationDate) - new Date(b.creationDate);
      case "date-desc":
        return new Date(b.creationDate) - new Date(a.creationDate);
      default:
        return 0;
    }
  });

  // Export Contacts to CSV
  const exportContacts = () => {
    const headers = "ID,First Name,Last Name,Email,Mobile,Group,Creation Date\n";
    const csvContent =
      headers +
      sortedContacts
        .map(
          (contact) =>
            `${contact.id},${contact.firstName},${contact.lastName},${contact.email},${contact.mobile},${contact.group},${contact.creationDate}`
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "contacts.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Breadcrumb pageName="Add Contact" />
      <div className="p-8 sm:p-10">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">Manage Your Contacts</h1>

        {/* Step 1: Create Group */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3">Step 1: Create a Group</h2>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleAddGroup}
              className="bg-blue-600 text-white font-medium py-2 px-3 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 flex items-center gap-1"
            >
              <FiPlus size={16} /> Add Group
            </button>
          </div>
        </div>

        {/* Step 2: Add Contact */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3">Step 2: Add a New Contact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="First Name"
              value={newContact.firstName}
              onChange={(e) =>
                setNewContact({ ...newContact, firstName: e.target.value })
              }
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={newContact.lastName}
              onChange={(e) =>
                setNewContact({ ...newContact, lastName: e.target.value })
              }
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
            <input
              type="email"
              placeholder="Email"
              value={newContact.email}
              onChange={(e) =>
                setNewContact({ ...newContact, email: e.target.value })
              }
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Mobile Number"
              value={newContact.mobile}
              onChange={(e) =>
                setNewContact({ ...newContact, mobile: e.target.value })
              }
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <select
              value={newContact.group}
              onChange={(e) =>
                setNewContact({ ...newContact, group: e.target.value })
              }
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select Group</option>
              {groupList.map((group, index) => (
                <option key={index} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAddContact}
            className="mt-3 bg-blue-600 text-white font-medium py-2 px-3 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 flex items-center gap-1"
          >
            <FiPlus size={16} /> Add Contact
          </button>
        </div>

        {/* Additional Option: Upload Contacts */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3">Upload Contacts via CSV</h2>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={downloadSampleFile}
              className="bg-gray-600 text-white font-medium py-2 px-3 rounded-lg shadow-md hover:bg-gray-700 transition-all duration-200 flex items-center gap-1"
            >
              <FiDownload size={16} /> Download Sample
            </button>
          </div>
        </div>

        {/* Contacts List */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-3">Contacts</h2>
          <div className="flex items-center gap-2 mb-3">
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Filter by Group</option>
              {groupList.map((group, index) => (
                <option key={index} value={group}>
                  {group}
                </option>
              ))}
            </select>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="name-asc">Sort by Name (A-Z)</option>
              <option value="name-desc">Sort by Name (Z-A)</option>
              <option value="group-asc">Sort by Group (A-Z)</option>
              <option value="group-desc">Sort by Group (Z-A)</option>
              <option value="date-asc">Sort by Date (Oldest First)</option>
              <option value="date-desc">Sort by Date (Newest First)</option>
            </select>
            <button
              onClick={exportContacts}
              className="bg-gray-600 text-white font-medium py-2 px-3 rounded-lg shadow-md hover:bg-gray-700 transition-all duration-200 flex items-center gap-1"
            >
              <FiArrowDownCircle size={16} /> Export
            </button>
          </div>

          {/* Contacts Table */}
          <table className="w-full border border-gray-300 rounded-md shadow-md text-sm">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-2">ID</th>
                <th className="p-2">First Name</th>
                <th className="p-2">Last Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Mobile</th>
                <th className="p-2">Group</th>
                <th className="p-2">Date</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedContacts.map((contact, index) => (
                <tr key={index} className="border-t hover:bg-gray-100 transition-colors">
                  <td className="p-2">{contact.id}</td>
                  <td className="p-2">{contact.firstName}</td>
                  <td className="p-2">{contact.lastName}</td>
                  <td className="p-2">{contact.email}</td>
                  <td className="p-2">{contact.mobile}</td>
                  <td className="p-2">{contact.group}</td>
                  <td className="p-2">{contact.creationDate}</td>
                  <td className="p-2 flex gap-2">
                    <button
                      onClick={() => openEditModal(contact)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <FiEdit size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteContact(index)}
                      className="text-red-600 hover:text-red-800 flex items-center gap-1"
                    >
                      <FiTrash size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Contact Modal */}
      {editContact && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-8 shadow-lg w-3/4 sm:w-1/2">
            <h2 className="text-2xl font-semibold mb-4">Edit Contact</h2>
            <div className="flex flex-col gap-4 mb-4">
              <input
                type="text"
                placeholder="First Name"
                value={editContact.firstName}
                onChange={(e) => setEditContact({ ...editContact, firstName: e.target.value })}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={editContact.lastName}
                onChange={(e) => setEditContact({ ...editContact, lastName: e.target.value })}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={editContact.email}
                onChange={(e) => setEditContact({ ...editContact, email: e.target.value })}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Mobile Number"
                value={editContact.mobile}
                onChange={(e) => setEditContact({ ...editContact, mobile: e.target.value })}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <select
                value={editContact.group}
                onChange={(e) => setEditContact({ ...editContact, group: e.target.value })}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select Group</option>
                {groupList.map((group, index) => (
                  <option key={index} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={closeEditModal}
                className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddContact;
