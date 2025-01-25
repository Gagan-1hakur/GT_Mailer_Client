import React, { useState, useEffect } from "react";
import axios from "axios";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import {
  HiOutlineMail,
  // HiOutlineUserGroup,
  // HiOutlineDocumentAdd,
} from "react-icons/hi";

const EmailCampaign = () => {
  const [campaignName, setCampaignName] = useState("");
  const [groups, setGroups] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [subjectLine, setSubjectLine] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");

  const API_BASE_URL = "http://localhost:8000";

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/groups`);
        console.log(response.data);
        setGroups(response.data);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    const fetchTemplates = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/templates`);
        setTemplates(response.data);
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };

    fetchGroups();
    fetchTemplates();
  }, []);

  useEffect(() => {
    const fetchContacts = async () => {
      if (selectedGroup) {
        try {
          const response = await axios.get(
            `http://localhost:8000/contact/contacts-by-group/${
              !selectedGroup ? "all" : selectedGroup
            }`
          );
          setContacts(response.data.data);
        } catch (error) {
          console.error("Error fetching contacts:", error);
          setContacts([]);
        }
      } else {
        setContacts([]);
      }
    };

    fetchContacts();
  }, [selectedGroup]);

  const handleSendEmail = async () => {
    if (
      !campaignName ||
      !senderEmail ||
      !subjectLine ||
      !selectedGroup ||
      !selectedTemplate
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSending(true);
    setMessage("");

    console.log({
      campaignName,
      senderEmail,
      subjectLine,
      groupId: selectedGroup,
      templateId: selectedTemplate,
    });
    try {
      const response = await axios.post(`${API_BASE_URL}/campaign/send-mail`, {
        campaignName,
        senderEmail,
        subjectLine,
        groupId: selectedGroup,
        templateId: selectedTemplate,
      });

      setMessage(response.data.message || "Emails sent successfully!");
    } catch (error) {
      console.error("Error sending emails:", error);
      setMessage("Failed to send emails. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Breadcrumb pageName="Email Campaign" />
      <div className="p-8 sm:p-10 bg-gray-100">
        <h1 className="text-3xl font-bold text-blue-600 mb-6 flex items-center gap-2">
          <HiOutlineMail size={28} />
          Create and Send Email Campaign
        </h1>

        {/* Campaign Name */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Campaign Name</h2>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your campaign name"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
          />
        </div>

        {/* Sender Email */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Sender Email</h2>
          <input
            type="email"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter sender email"
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
          />
        </div>

        {/* Subject Line */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Subject Line</h2>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter subject line"
            value={subjectLine}
            onChange={(e) => setSubjectLine(e.target.value)}
          />
        </div>

        {/* Select Group */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Select Contact Group</h2>
          <select
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            // multiple
          >
            <option value="">-- Select a Group --</option>
            {groups?.map((group) => (
              <option key={group._id} value={group._id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        {/* Display Contacts */}
        {/* {contacts.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              Contacts in Selected Group
            </h2>
            <ul className="list-disc pl-5">
              {contacts.map((contact) => (
                <li key={contact._id}>{contact.email}</li>
              ))}
            </ul>
          </div>
        )} */}

        {/* Select Template */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Select Email Template</h2>
          <select
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
          >
            <option value="">-- Select a Template --</option>
            {templates.map((template) => (
              <option key={template._id} value={template._id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        {/* Send Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSendEmail}
            disabled={isSending}
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            {isSending ? "Sending..." : "Send Email"}
          </button>
        </div>

        {/* Message */}
        {message && (
          <p className="mt-4 text-center text-lg font-semibold text-green-600">
            {message}
          </p>
        )}
      </div>
    </>
  );
};

export default EmailCampaign;
