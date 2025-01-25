import React, { useState, useEffect } from "react";
import axios from "axios";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import { HiOutlineMail } from "react-icons/hi";
import Select from "react-select";

const EmailCampaign = () => {
  const [campaignName, setCampaignName] = useState("");
  const [groups, setGroups] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [subjectLine, setSubjectLine] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");
  const [emailCount, setEmailCount] = useState(0);

  const API_BASE_URL = "http://localhost:8000";

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/groups`);
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

  // useEffect(() => {
  //   const fetchContacts = async () => {
  //     if (selectedGroupIds.length > 0) {
  //       try {
  //         const response = await axios.get(
  //           `${API_BASE_URL}/contact/contacts-by-group/${selectedGroup}`
  //         );
  //         console.log(selectedGroup);
  //         setGroups(
  //           groups.map((group) => {
  //             if (group._id === selectedGroup) {
  //               return {
  //                 ...group,
  //                 contactCount: response.data.data.length,
  //               };
  //             }
  //             return group;
  //           })
  //         );
  //         setEmailCount(response.data.data.length);
  //       } catch (error) {
  //         console.error("Error fetching contacts:", error);
  //         setEmailCount(0);
  //       }
  //     } else {
  //       setEmailCount(0);
  //     }
  //   };

  //   fetchContacts();
  // }, [selectedGroupIds]);

  const handleSendEmail = async () => {
    console.log(selectedGroupIds);
    if (
      !campaignName ||
      !senderEmail ||
      !subjectLine ||
      !selectedGroupIds ||
      !selectedTemplate
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSending(true);
    setMessage("");

    try {
      const response = await axios.post(`${API_BASE_URL}/campaign/send-mail`, {
        campaignName,
        senderEmail,
        subjectLine,
        groupIds: selectedGroupIds?.map((group) => group.value),
        templateId: selectedTemplate,
      });

      setMessage(response.data.message || "Emails sent successfully!");
      // Reset form fields
      setCampaignName("");
      setSelectedGroup("");
      setSelectedTemplate("");
      setSenderEmail("");
      setSubjectLine("");
      setSelectedGroupIds([]);
    } catch (error) {
      console.error("Error sending emails:", error);
      setMessage("Failed to send emails. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleGroupChange = (selectedOptions) => {
    console.log(selectedOptions);

    setSelectedGroupIds(selectedOptions);
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

          <Select
            options={groups?.map((group) => ({
              value: group._id, // Correctly set 'value' for the option
              label: group.name,
            }))}
            isMulti // Enable multi-select
            value={selectedGroupIds} // Controlled component
            onChange={handleGroupChange}
            placeholder="Select groups..."
            className="basic-multi-select"
            classNamePrefix="select"
          />

          {/* {selectedGroupIds.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              Total emails in this group: {emailCount}
            </p>
          )} */}
        </div>

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
