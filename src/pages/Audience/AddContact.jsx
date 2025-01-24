import React, { useState, useEffect, useRef } from "react";
import { FiPlus, FiDownload, FiUpload } from "react-icons/fi";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import axios from "axios";

const AddContact = () => {
  const [groupName, setGroupName] = useState("");
  const [groupList, setGroupList] = useState([]);
  const [newContact, setNewContact] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    group: "",
  });
  const [csvFile, setCsvFile] = useState(null);
  const [skipReport, setSkipReport] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  // Fetch groups from backend
  const fetchGroups = async () => {
    try {
      const response = await axios.get("http://localhost:8000/groups");
      const groups = response.data;
      console.log(groups);
      setGroupList(groups);
    } catch (error) {
      console.error("Error fetching groups:", error.message);
    }
  };

  // Handle adding a new group
  const handleAddGroup = async () => {
    try {
      // Validate that groupName is not empty
      if (!groupName.trim()) {
        alert("Group name cannot be empty.");
        return;
      }

      // Check if the group name already exists
      const isDuplicate = groupList.some(
        (group) => group.name === groupName.trim()
      );
      if (isDuplicate) {
        alert("This group name already exists.");
        return;
      }

      // Send request to the server to add the new group
      await axios.post("http://localhost:8000/groups", {
        name: groupName.trim(),
      });

      // Clear the input field and fetch updated groups
      setGroupName("");
      fetchGroups();
    } catch (error) {
      console.error("Error adding group:", error.message);
      alert("Failed to add group. Please try again.");
    }
  };

  // Handle adding a new contact
  const handleAddContact = async () => {
    const { firstName, lastName, email, mobile, group } = newContact;

    if (!email || !group) {
      alert("Email and Group are required.");
      return;
    }

    if (mobile && (!/^\d{10}$/.test(mobile) || mobile.length !== 10)) {
      alert("Invalid mobile number.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/contact/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          mobile,
          group: { id: JSON.parse(group)._id, name: JSON.parse(group).name },
        }),
      });

      if (response.ok) {
        alert("Contact added successfully!");
        setNewContact({
          firstName: "",
          lastName: "",
          email: "",
          mobile: "",
          group: "",
        });
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error adding contact:", error.message);
      alert("Failed to add contact. Please try again.");
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCsvFile(file);
    }
  };

  // Validate CSV rows
  const validateCsvRow = (row) => {
    const [firstName, lastName, email, mobile, group] = row.map((col) =>
      col.trim()
    );

    if (!email || !group) {
      return { valid: false, reason: "Missing required fields" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, reason: "Invalid email format" };
    }

    if (mobile && (!/^\d{10}$/.test(mobile) || mobile.length !== 10)) {
      return { valid: false, reason: "Invalid mobile number" };
    }

    return {
      valid: true,
      contact: { firstName, lastName, email, mobile, group },
    };
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!csvFile) {
      alert("Please select a CSV file first.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const rows = event.target.result.split("\n").map((row) => row.split(","));
      const validContacts = [];
      const skippedRows = [];

      for (const row of rows.slice(1)) {
        const validation = validateCsvRow(row);
        if (validation.valid) {
          validContacts.push(validation.contact);
        } else {
          skippedRows.push({ row, reason: validation.reason });
        }
      }

      if (validContacts.length === 0) {
        alert("No valid contacts found in the CSV file.");
        return;
      }

      // Upload valid contacts to the backend
      try {
        for (const contact of validContacts) {
          const response = await fetch("http://localhost:8000/contact/add", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(contact),
          });

          if (!response.ok) {
            const error = await response.json();
            skippedRows.push({
              row: Object.values(contact),
              reason: error.message,
            });
          }
        }

        alert("Upload complete.");
        setSkipReport(skippedRows); // Update skip report
      } catch (error) {
        console.error("Error uploading contacts:", error.message);
        alert("Failed to upload contacts. Please try again.");
      } finally {
        fileInputRef.current.value = ""; // Reset the file input field
        setCsvFile(null); // Clear the file state
      }
    };

    reader.readAsText(csvFile);
  };

  // Generate and download skip report
  const downloadSkipReport = () => {
    if (skipReport.length === 0) {
      alert("No skipped rows to download.");
      return;
    }

    const csvContent = `Row,Reason\n${skipReport
      .map((entry) => `${entry.row.join(",")},${entry.reason}`)
      .join("\n")}`;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "skip_report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download sample CSV
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

  return (
    <>
      <Breadcrumb pageName="Add Contact" />
      <div className="p-8 sm:p-10 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">
          Manage Your Contacts
        </h1>

        {/* Step 1: Create Group */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create a Group</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="flex-grow p-3 border border-gray-300 rounded-md"
            />
            <button
              onClick={handleAddGroup}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FiPlus size={16} /> Add Group
            </button>
          </div>
        </div>

        {/* Step 2: Add Contact */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add a New Contact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="First Name"
              value={newContact.firstName}
              onChange={(e) =>
                setNewContact({ ...newContact, firstName: e.target.value })
              }
              className="p-3 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={newContact.lastName}
              onChange={(e) =>
                setNewContact({ ...newContact, lastName: e.target.value })
              }
              className="p-3 border border-gray-300 rounded-md"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <input
              type="email"
              placeholder="Email"
              value={newContact.email}
              onChange={(e) =>
                setNewContact({ ...newContact, email: e.target.value })
              }
              className="p-3 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              placeholder="Mobile Number"
              value={newContact.mobile}
              onChange={(e) =>
                setNewContact({ ...newContact, mobile: e.target.value })
              }
              className="p-3 border border-gray-300 rounded-md"
            />
            <select
              value={newContact.group}
              onChange={(e) =>
                setNewContact({ ...newContact, group: e.target.value })
              }
              className="p-3 border border-gray-300 rounded-md"
            >
              <option value="">Select Group</option>
              {console.log(groupList)}
              {groupList.map((group, index) => (
                <option key={index} value={JSON.stringify(group)}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAddContact}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 flex items-center gap-2"
          >
            <FiPlus size={16} /> Add Contact
          </button>
        </div>

        {/* Upload Contacts */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Upload Contacts via CSV
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="p-3 border border-gray-300 rounded-md w-full sm:w-auto"
              ref={fileInputRef}
            />
            <button
              onClick={handleFileUpload}
              className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <FiUpload size={16} /> Upload
            </button>
            <button
              onClick={downloadSampleFile}
              className="bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <FiDownload size={16} /> Download Sample
            </button>
            <button
              onClick={downloadSkipReport}
              className="bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <FiDownload size={16} /> Download Skip Report
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddContact;
