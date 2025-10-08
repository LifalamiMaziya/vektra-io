import { useState } from "react";
import type { FileAttachment } from "../types";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/svg+xml",
  "text/plain",
  "text/markdown",
  "application/pdf"
];

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = (error) => reject(error);
  });
};

export const useFileHandler = () => {
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: FileAttachment[] = [];
    for (const file of Array.from(files)) {
      if (ALLOWED_MIME_TYPES.includes(file.type)) {
        try {
          const base64Data = await fileToBase64(file);
          newFiles.push({
            name: file.name,
            mimeType: file.type,
            data: base64Data
          });
        } catch (error) {
          console.error("Error converting file to base64:", error);
        }
      } else {
        console.warn(`Unsupported file type: ${file.type}`);
      }
    }
    setAttachedFiles((prev) => [...prev, ...newFiles]);
    event.target.value = ""; // Reset input
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setAttachedFiles([]);
  };

  return { attachedFiles, handleFileChange, removeFile, clearFiles };
};
