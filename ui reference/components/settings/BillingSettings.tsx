import React from "react";

interface BillingSettingsProps {
  isModal?: boolean;
}

export const BillingSettings: React.FC<BillingSettingsProps> = ({
  isModal
}) => {
  const headerClasses = isModal
    ? "text-2xl font-bold text-white"
    : "text-3xl font-bold text-[#212121]";
  const subheaderClasses = isModal ? "text-[#aaa] mt-1" : "text-[#555555] mt-1";
  const panelClasses = isModal
    ? "mt-8 p-6 bg-[#2a2a2a] border border-[#3c3c3c] rounded-lg flex justify-between items-center"
    : "mt-8 p-6 bg-white border border-[#E0E0E0] rounded-2xl flex justify-between items-center";

  return (
    <div>
      <h2 className={headerClasses}>Subscription & Billing</h2>
      <p className={subheaderClasses}>
        Manage your plan and view billing history.
      </p>
      <div className={panelClasses}>
        <div>
          <p
            className={`font-semibold ${isModal ? "text-white" : "text-black"}`}
          >
            Current Plan: <span className="text-[#C87550]">Pro</span>
          </p>
          <p
            className={`text-sm ${isModal ? "text-[#aaa]" : "text-[#555555]"}`}
          >
            Renews on August 26, 2024
          </p>
        </div>
        <button
          className={
            isModal
              ? "bg-[#333] text-white border border-[#444] py-2 px-4 rounded-lg text-sm font-semibold hover:bg-[#444]"
              : "bg-white border border-[#D0D0D0] py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gray-50"
          }
        >
          Manage Subscription
        </button>
      </div>
      <div className="mt-8">
        <h3
          className={`text-xl font-bold ${isModal ? "text-white" : "text-[#212121]"}`}
        >
          Billing History
        </h3>
        <table className="w-full mt-4 text-left">
          <thead>
            <tr
              className={`border-b ${isModal ? "border-[#3c3c3c]" : "border-[#E0E0E0]"}`}
            >
              <th className="py-2 font-semibold">Date</th>
              <th className="py-2 font-semibold">Amount</th>
              <th className="py-2 font-semibold">Status</th>
              <th className="py-2 font-semibold"></th>
            </tr>
          </thead>
          <tbody className={isModal ? "text-[#ccc]" : "text-[#555555]"}>
            <tr>
              <td className="py-3">July 26, 2024</td>
              <td className="py-3">$29.00</td>
              <td className="py-3">
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                  Paid
                </span>
              </td>
              <td className="py-3 text-right">
                <a
                  href="#"
                  className="font-semibold text-[#C87550] hover:underline"
                >
                  Download
                </a>
              </td>
            </tr>
            <tr>
              <td className="py-3">June 26, 2024</td>
              <td className="py-3">$29.00</td>
              <td className="py-3">
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                  Paid
                </span>
              </td>
              <td className="py-3 text-right">
                <a
                  href="#"
                  className="font-semibold text-[#C87550] hover:underline"
                >
                  Download
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
