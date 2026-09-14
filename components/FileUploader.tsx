"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileUp, X } from "lucide-react";

import { convertFileToUrl } from "@/lib/utils";

type FileUploaderProps = {
  files: File[] | undefined;
  onChange: (files: File[]) => void;
};

/**
 * Identification document upload.
 *
 * Three real fixes over the previous version:
 *
 *  1. `onChange` is now in the useCallback dependency array. It was
 *     omitted, which captures the first render's callback forever. React
 *     Hook Form re-creates field callbacks on re-render, so an upload
 *     after any other field changed could write into a stale closure.
 *
 *  2. The object URL from convertFileToUrl was never revoked. Each file a
 *     patient selected leaked a blob for the lifetime of the page.
 *
 *  3. The preview was requested at 1000x1000 for a box that renders around
 *     400px tall, and there was no way to remove a wrongly chosen file
 *     short of reloading the form.
 */
const FileUploader = ({ files, onChange }: FileUploaderProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => onChange(acceptedFiles),
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const file = files?.[0];

  useEffect(() => {
    if (!file || file.type === "application/pdf") {
      setPreviewUrl(null);
      return;
    }
    const url = convertFileToUrl(file);
    setPreviewUrl(url);
    // Release the blob when the file changes or the component unmounts.
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (file) {
    return (
      <div className="rounded-md border border-line bg-surface p-3">
        <div className="flex items-start gap-3">
          {previewUrl ? (
            <Image
              src={previewUrl}
              width={96}
              height={96}
              alt="Preview of the uploaded identification document"
              className="size-24 shrink-0 rounded-md border border-line object-cover"
              unoptimized
            />
          ) : (
            <span className="flex size-24 shrink-0 items-center justify-center rounded-md border border-line bg-raised text-ink-subtle">
              <FileUp className="size-6" aria-hidden />
            </span>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.875rem] font-semibold text-ink">
              {file.name}
            </p>
            <p className="mt-0.5 text-[0.75rem] text-ink-subtle">
              {(file.size / 1024).toFixed(0)} KB
            </p>
            <button
              type="button"
              onClick={() => onChange([])}
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-md border border-line-strong px-2.5 py-1.5 text-[0.75rem] font-semibold text-ink hover:bg-raised"
            >
              <X className="size-3" aria-hidden />
              Remove
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`file-upload ${isDragActive ? "border-brand-500 bg-brand-50" : ""}`}
    >
      <input {...getInputProps()} aria-label="Upload identification document" />
      <FileUp className="size-6 text-ink-subtle" aria-hidden />
      <div className="file-upload_label">
        <p className="text-[0.875rem] text-ink">
          <span className="font-semibold text-brand-600">Click to upload</span>{" "}
          or drag and drop
        </p>
        <p className="text-[0.75rem] text-ink-subtle">
          PNG, JPG, WEBP or PDF, up to 5 MB
        </p>
      </div>
    </div>
  );
};

export default FileUploader;
