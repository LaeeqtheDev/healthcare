"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AppointmentForm } from "@/components/ui/forms/AppointmentForm";
import { Appointment } from "@/types/appwrite.types";

export const AppointmentModal = ({
  type,
  patientId,
  userId,
  appointment,
}: {
  type: "schedule" | "cancel";
  patientId: string;
  userId: string;
  appointment?: Appointment;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={
            type === "schedule"
              ? "h-8 rounded-md border border-line-strong bg-surface px-3 text-[0.8125rem] font-semibold text-ink hover:bg-raised"
              : "h-8 rounded-md px-3 text-[0.8125rem] font-semibold text-crit-500 hover:bg-crit-50"
          }
          aria-label={`${type === "schedule" ? "Confirm or reschedule" : "Cancel"} appointment for ${
            appointment?.patient?.name ?? "this patient"
          }`}
        >
          {type === "schedule" ? "Confirm" : "Cancel"}
        </Button>
      </DialogTrigger>
      <DialogContent className="shad-dialog sm:max-w-md">
        <DialogHeader className="mb-4 space-y-3">
          <DialogTitle>
            {type === "schedule" ? "Confirm appointment" : "Cancel appointment"}
          </DialogTitle>
          <DialogDescription>
            {type === "schedule"
              ? "Confirm the time and add a note for the patient. They will be notified by SMS."
              : "The patient will be notified by SMS. Give a reason so staff can see why later."}
          </DialogDescription>
        </DialogHeader>

        <AppointmentForm
          userId={userId}
          patientId={patientId}
          type={type}
          appointment={appointment}
          setOpen={setOpen}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentModal;
