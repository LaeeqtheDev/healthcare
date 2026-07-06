"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export const PasskeyModal = () => {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [passkey, setPasskey] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const accessKey = window.localStorage.getItem("accessKey");
    if (accessKey === process.env.NEXT_PUBLIC_ADMIN_PASSKEY) {
      setOpen(false);
    }
  }, []);

  const closeModal = () => {
    setOpen(false);
    router.push("/");
  };

  const validatePasskey = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    if (passkey === process.env.NEXT_PUBLIC_ADMIN_PASSKEY) {
      window.localStorage.setItem("accessKey", passkey);
      setOpen(false);
    } else {
      setError("Invalid passkey. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="shad-dialog sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Admin Access Verification
          </DialogTitle>
          <DialogDescription>
            To access the admin page, please enter the passkey.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Input
            type="password"
            value={passkey}
            className="shad-input"
            placeholder="Enter passkey"
            onChange={(e) => setPasskey(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                validatePasskey(e as unknown as React.MouseEvent<HTMLButtonElement, MouseEvent>);
              }
            }}
          />
          {error && (
            <p className="shad-error text-14-regular mt-4 flex justify-center">
              {error}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="shad-gray-btn w-full"
            onClick={closeModal}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="shad-primary-btn w-full"
            onClick={validatePasskey}
          >
            Enter Admin Passkey
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PasskeyModal;
