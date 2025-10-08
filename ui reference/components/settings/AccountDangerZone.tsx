import React, { useState } from "react";
import { Modal } from "../Modal";

interface AccountDangerZoneProps {
  userEmail: string;
  onLogout: () => void;
}

export const AccountDangerZone: React.FC<AccountDangerZoneProps> = ({
  userEmail,
  onLogout
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");

  const isConfirmed = confirmationText === userEmail;

  const handleDeleteAccount = () => {
    if (isConfirmed) {
      console.log("Account deleted!");
      onLogout();
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-red-600">Danger Zone</h2>
      <div className="mt-8 p-6 border-2 border-red-500 rounded-2xl">
        <h3 className="text-xl font-bold text-[#212121]">Delete Account</h3>
        <p className="mt-2 text-[#555555]">
          Once you delete your account, there is no going back. All of your
          projects and personal data will be permanently removed. Please be
          certain.
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-4 bg-red-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-red-700"
        >
          Delete My Account
        </button>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Are you absolutely sure?"
      >
        <p>
          This action cannot be undone. This will permanently delete your
          account and remove your data from our servers.
        </p>
        <p className="mt-4">
          Please type <strong className="text-[#212121]">{userEmail}</strong> to
          confirm.
        </p>
        <input
          type="text"
          value={confirmationText}
          onChange={(e) => setConfirmationText(e.target.value)}
          className="mt-2 block w-full px-4 py-3 bg-white border border-[#D0D0D0] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
        />
        <button
          onClick={handleDeleteAccount}
          disabled={!isConfirmed}
          className="w-full mt-4 bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          I understand the consequences, delete my account
        </button>
      </Modal>
    </div>
  );
};
