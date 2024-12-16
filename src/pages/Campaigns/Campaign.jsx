import React, { useState, useEffect } from "react";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import axios from "axios";

const CampaignNamePage = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [campaignType, setCampaignType] = useState("Regular");
  const [campaigns, setCampaigns] = useState([]);
  const [activeStep, setActiveStep] = useState(null);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get("http://localhost:8000/contact/all");
        const data = Array.isArray(response.data) ? response.data : [];
        setContacts(data);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        setContacts([]); // Default to an empty array in case of an error
      }
    };

    fetchContacts();
  }, []);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get("http://localhost:8000/templates");
        setTemplates(response.data);
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };

    fetchTemplates();
  }, []);

  const steps = [
    {
      id: 1,
      title: "Sender",
      description: "Who is sending this email campaign?",
      content: (
        <div>
          <p className="text-sm text-red-500 mb-4">
            The campaign cannot be sent now because your DMARC policy requires
            sender domain authentication. To send your campaign, first,
            authenticate your sender domain or use another sender with an
            authenticated domain.
          </p>
          <div className="mb-4">
            <label htmlFor="emailAddress" className="block text-gray-700 mb-2">
              Email address
            </label>
            <input
              id="emailAddress"
              type="email"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter sender email address"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="senderName" className="block text-gray-700 mb-2">
              Name
            </label>
            <input
              id="senderName"
              type="text"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter sender name"
            />
          </div>
          <div className="flex justify-end">
            <button className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
              Save
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: "Recipients",
      description: "The people who receive your campaign",
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-4">Select Recipients</h3>
          {Array.isArray(contacts) && contacts.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {contacts.map((contact) => (
                <li
                  key={contact.id}
                  className="py-4 flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {contact.name}
                    </h4>
                    <p className="text-sm text-gray-500">{contact.email}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No contacts found.</p>
          )}
        </div>
      ),
    },
    {
      id: 3,
      title: "Subject",
      description: "Add a subject line for this campaign",
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-4">Add Subject</h3>
          <div className="mb-4">
            <label htmlFor="subjectLine" className="block text-gray-700 mb-2">
              Subject line
            </label>
            <input
              id="subjectLine"
              type="text"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter subject line"
              maxLength={200}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="previewText" className="block text-gray-700 mb-2">
              Preview text
            </label>
            <input
              id="previewText"
              type="text"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter preview text"
              maxLength={200}
            />
          </div>
          <div className="flex justify-end">
            <button className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
              Save
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: "Design",
      description: "Create your email content",
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-4">Select Template</h3>
          <div className="mb-4">
            <label
              htmlFor="templateSelect"
              className="block text-gray-700 mb-2"
            >
              Choose Template
            </label>
            <select
              id="templateSelect"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a Template --</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            <button className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
              Save
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: "Additional settings",
      description: "Configure additional campaign settings",
      content: "Additional settings form content",
    },
  ];

  const handleCreateClick = () => {
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingCampaign(null);
    setCampaignType("Regular");
    setCampaignName("");
  };

  const handleSave = () => {
    if (!campaignName) {
      alert("Please enter a campaign name.");
      return;
    }

    if (editingCampaign) {
      setCampaigns((prev) =>
        prev.map((campaign) =>
          campaign.id === editingCampaign.id
            ? {
                ...campaign,
                name: campaignName,
                type: campaignType,
                lastEdited: new Date().toLocaleString(),
              }
            : campaign
        )
      );
      setEditingCampaign(null);
    } else {
      const newCampaign = {
        id: campaigns.length + 1,
        name: campaignName,
        type: campaignType,
        status: "Draft",
        lastEdited: new Date().toLocaleString(),
      };
      setCampaigns([...campaigns, newCampaign]);
    }

    setCampaignName("");
    setCampaignType("Regular");
    setIsCreating(false);
  };

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign);
    setCampaignName(campaign.name);
    setCampaignType(campaign.type);
    setIsCreating(true);
  };

  return (
    <>
      <Breadcrumb pageName="Campaigns" />
      <div className="p-8 sm:p-10 bg-gray-100">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">Campaigns</h1>

        {!isCreating ? (
          <>
            <button
              onClick={handleCreateClick}
              className="mb-6 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              Create Campaign
            </button>

            {campaigns.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-10 flex flex-col items-center justify-center text-center">
                <h2 className="text-xl font-medium text-gray-600 mb-4">
                  You have not created any email campaigns
                </h2>
                <p className="text-gray-500 mb-6">
                  Click on "Create campaign" and start designing your first
                  email campaign.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Your Campaigns</h2>
                <ul className="divide-y divide-gray-200">
                  {campaigns.map((campaign) => (
                    <li
                      key={campaign.id}
                      className="py-4 flex justify-between items-center"
                    >
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {campaign.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Type: {campaign.type}
                        </p>
                        <p className="text-sm text-gray-500">
                          Last edited: {campaign.lastEdited}
                        </p>
                        <p className="text-sm text-gray-500">
                          Status: {campaign.status}
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <button
                          className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                          onClick={() => setActiveStep(steps[0].id)}
                        >
                          Continue Setup
                        </button>
                        <button
                          className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                          onClick={() => handleEdit(campaign)}
                        >
                          Edit
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-10">
            <h2 className="text-xl font-medium text-gray-600 mb-4">
              {editingCampaign ? "Edit Campaign" : "Create an email campaign"}
            </h2>
            <div className="flex mb-6">
              <button
                onClick={() => setCampaignType("Regular")}
                className={`mr-4 px-4 py-2 rounded-lg border ${
                  campaignType === "Regular"
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-600 border-gray-300"
                }`}
              >
                Regular
              </button>
              <button
                onClick={() => setCampaignType("A/B Test")}
                className={`px-4 py-2 rounded-lg border ${
                  campaignType === "A/B Test"
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-600 border-gray-300"
                }`}
              >
                A/B Test
              </button>
            </div>
            {campaignType === "A/B Test" && (
              <p className="text-sm text-gray-500 mb-4">
                Choose an element to A/B test. Recipients in your test group
                will receive either version A or B. The version with the best
                engagement will be sent to your remaining recipients.
              </p>
            )}
            <div className="mb-6">
              <label
                htmlFor="campaignName"
                className="block text-left text-gray-700 mb-2"
              >
                Campaign name
              </label>
              <input
                id="campaignName"
                type="text"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your campaign name"
                maxLength={128}
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                {editingCampaign ? "Save Changes" : "Create Campaign"}
              </button>
            </div>
          </div>
        )}

        {activeStep && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            {steps.map((step) => (
              <div key={step.id} className="mb-4">
                <button
                  onClick={() => setActiveStep(step.id)}
                  className="flex justify-between items-center w-full p-4 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                  <span>{activeStep === step.id ? "-" : "+"}</span>
                </button>
                {activeStep === step.id && (
                  <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                    {step.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CampaignNamePage;
