import React from "react";

export const DataHubSettings: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white">Data Hub (AI-Powered)</h2>
      <p className="text-[#aaa] mt-1">
        Manage your project's static data with natural language.
      </p>

      <div className="mt-8 p-4 bg-[#2a2a2a] border border-[#3c3c3c] rounded-lg">
        <h3 className="font-semibold text-white">Detected Data Structure</h3>
        <p className="text-sm text-[#aaa] mt-1">
          Vektraio has analyzed your project and detected the following
          potential data structures. You can edit them below.
        </p>
        <div className="mt-4 p-4 bg-[#191919] rounded font-mono text-xs text-[#ccc] overflow-x-auto">
          <pre>
            {`- Product List
  - item
    - name: string
    - price: string
    - image_url: string
- Team Members
  - member
    - name: string
    - role: string
    - avatar_url: string`}
          </pre>
        </div>
      </div>

      <div className="mt-8">
        <label
          htmlFor="data-prompt"
          className="block text-sm font-medium text-[#ccc]"
        >
          Describe your data changes
        </label>
        <div className="mt-2 relative">
          <textarea
            id="data-prompt"
            rows={3}
            placeholder="e.g., 'Add a new product called AI-Powered T-Shirt with a price of $29.99'"
            className="block w-full bg-[#2a2a2a] border border-[#3c3c3c] rounded-lg text-white placeholder-[#888] p-3 pr-24 focus:outline-none focus:ring-2 focus:ring-[#C87550]/50"
          />
          <button className="absolute right-2 bottom-2 bg-[#C87550] text-white font-semibold py-2 px-4 rounded-lg hover:bg-opacity-90">
            Update Data
          </button>
        </div>
      </div>
    </div>
  );
};
