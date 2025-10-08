import React from "react";

interface FilePillProps {
  fileName: string;
  onRemove: () => void;
}

export const FilePill: React.FC<FilePillProps> = ({ fileName, onRemove }) => {
  return (
    <div className="inline-flex items-center py-1 px-2 bg-[#333] text-white rounded-full text-sm mr-2 flex-shrink-0">
      <span>{fileName}</span>
      <button
        onClick={onRemove}
        className="ml-2 cursor-pointer text-[#aaa] hover:text-white"
      >
        &times;
      </button>
    </div>
  );
};
