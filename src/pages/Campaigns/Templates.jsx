import React, { useState } from "react";
import {
  HiOutlineDocumentAdd,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineDownload,
} from "react-icons/hi";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";

let templateIdCounter = 1; // Counter for unique numerical ID

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [previewTemplate, setPreviewTemplate] = useState(null); // For preview modal
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/html") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileContent(e.target.result);
        setUploadedFile(file.name);
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid HTML file.");
    }
  };

  // Save uploaded template
  const saveTemplate = () => {
    if (!uploadedFile || !fileContent) {
      alert("No template to save. Please upload a valid HTML file.");
      return;
    }

    const newTemplate = {
      id: templateIdCounter++,
      name: uploadedFile,
      content: fileContent,
    };

    setTemplates((prevTemplates) => [...prevTemplates, newTemplate]);
    setUploadedFile(null);
    setFileContent("");
  };

  // Delete a template
  const deleteTemplate = (id) => {
    const updatedTemplates = templates.filter((template) => template.id !== id);
    setTemplates(updatedTemplates);
  };

  // Export template as an HTML file
  const exportTemplate = (template) => {
    const blob = new Blob([template.content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${template.name}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Open the preview modal
  const openPreview = (template) => {
    setPreviewTemplate(template);
  };

  // Close the preview modal
  const closePreview = () => {
    setPreviewTemplate(null);
  };

  return (
    <>
      {/* Breadcrumb Section */}
      <Breadcrumb pageName="Manage Templates" />
      <div className="p-8 sm:p-10 bg-gray-100">
        <h1 className="text-3xl font-bold text-blue-600 mb-6 flex items-center gap-2">
          <HiOutlineDocumentAdd size={28} />
          Manage Your Templates
        </h1>

        {/* Upload Template */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <HiOutlineDocumentAdd size={20} className="text-green-600" />
            Upload an HTML Template
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <input
              type="file"
              accept=".html"
              onChange={handleFileUpload}
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {uploadedFile && (
              <button
                onClick={saveTemplate}
                className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <HiOutlineDocumentAdd size={16} /> Save Template
              </button>
            )}
          </div>
          {uploadedFile && (
            <p className="mt-2 text-sm text-gray-600">
              Uploaded File: <span className="font-semibold">{uploadedFile}</span>
            </p>
          )}
        </div>

        {/* Saved Templates */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <HiOutlineEye size={20} className="text-blue-600" />
            Saved Templates
          </h2>
          {templates.length === 0 ? (
            <p className="text-gray-500">No templates saved yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="border border-gray-300 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow duration-300 p-4 relative group"
                >
                  {/* Header */}
                  <h3 className="text-lg font-medium text-gray-800 mb-2 truncate">
                    {template.name}
                  </h3>
                  {/* Content Preview */}
                  <div
                    className="overflow-hidden border-t pt-2 mb-4 text-sm text-gray-700"
                    style={{ maxHeight: "150px" }}
                    dangerouslySetInnerHTML={{ __html: template.content }}
                  />
                  {/* Actions */}
                  <div className="flex justify-between">
                    <button
                      className="text-green-500 hover:text-green-700 bg-gray-50 p-2 rounded-md shadow-md flex items-center gap-1"
                      onClick={() => openPreview(template)}
                      title="Preview Template"
                    >
                      <HiOutlineEye size={18} />
                      Preview
                    </button>
                    <div className="flex gap-2">
                      <button
                        className="text-blue-500 hover:text-blue-700 bg-gray-50 p-2 rounded-md shadow-md flex items-center gap-1"
                        onClick={() => exportTemplate(template)}
                        title="Export Template"
                      >
                        <HiOutlineDownload size={18} />
                        Export
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700 bg-gray-50 p-2 rounded-md shadow-md flex items-center gap-1"
                        onClick={() => deleteTemplate(template.id)}
                        title="Delete Template"
                      >
                        <HiOutlineTrash size={18} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-11/12 sm:w-3/4 lg:w-1/2 max-h-[90vh] overflow-auto mt-24">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <HiOutlineEye className="text-green-600" />
              {previewTemplate.name}
            </h2>
            <div
              className="border border-gray-300 rounded-md p-4 bg-gray-50"
              dangerouslySetInnerHTML={{ __html: previewTemplate.content }}
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={closePreview}
                className="bg-gradient-to-r from-gray-500 to-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Templates;
