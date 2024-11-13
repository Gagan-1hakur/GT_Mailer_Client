import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";

const AddContact = () => {
  return (
    <>
      <Breadcrumb pageName="Add Contact" />
      <div className="p-8 sm:p-12">
        <h1 className="text-2xl font-semibold mb-6">Add a New Contact</h1>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="text"
            placeholder="Enter the name"
            className="w-full sm:w-1/3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Enter the email"
            className="w-full sm:w-1/3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            className="w-full sm:w-auto bg-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </>
  );
};

export default AddContact;
