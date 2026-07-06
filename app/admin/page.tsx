import Image from "next/image";
import Link from "next/link";

import { AppointmentModal } from "@/components/AppointmentModal";
import { PasskeyModal } from "@/components/PasskeyModal";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";
import { formatDateTime } from "@/lib/utils";
import { Appointment } from "@/types/appwrite.types";

const AdminPage = async ({ searchParams }: SearchParamProps) => {
  const appointments = await getRecentAppointmentList();

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-14">
      <PasskeyModal />

      <header className="admin-header">
        <Link href="/" className="cursor-pointer">
          <Image
            src="/assets/icons/logo-full.svg"
            height={32}
            width={162}
            alt="logo"
            className="h-8 w-fit"
          />
        </Link>

        <p className="text-16-semibold">Admin Dashboard</p>
      </header>

      <main className="admin-main">
        <section className="w-full space-y-4">
          <h1 className="header">Welcome 👋</h1>
          <p className="text-dark-700">
            Start the day with managing new appointments
          </p>
        </section>

        <section className="admin-stat">
          <StatCard
            type="appointments"
            count={appointments?.scheduledCount ?? 0}
            label="Scheduled appointments"
            icon="/assets/icons/appointments.svg"
          />
          <StatCard
            type="pending"
            count={appointments?.pendingCount ?? 0}
            label="Pending appointments"
            icon="/assets/icons/pending.svg"
          />
          <StatCard
            type="cancelled"
            count={appointments?.cancelledCount ?? 0}
            label="Cancelled appointments"
            icon="/assets/icons/cancelled.svg"
          />
        </section>

        <section className="data-table w-full">
          <table className="w-full">
            <thead>
              <tr className="shad-table-row-header">
                <th className="p-4 text-left text-14-medium">Patient</th>
                <th className="p-4 text-left text-14-medium">Status</th>
                <th className="p-4 text-left text-14-medium">Doctor</th>
                <th className="p-4 text-left text-14-medium">Appointment</th>
                <th className="p-4 text-left text-14-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments?.documents?.length ? (
                appointments.documents.map((appointment: Appointment) => (
                  <tr key={appointment.$id} className="shad-table-row">
                    <td className="p-4">{appointment.patient?.name}</td>
                    <td className="p-4">
                      <StatusBadge status={appointment.status} />
                    </td>
                    <td className="p-4">Dr. {appointment.primaryPhysician}</td>
                    <td className="p-4">
                      {formatDateTime(appointment.schedule).dateTime}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <AppointmentModal
                          type="schedule"
                          patientId={appointment.patient?.$id}
                          userId={appointment.userId}
                          appointment={appointment}
                        />
                        <AppointmentModal
                          type="cancel"
                          patientId={appointment.patient?.$id}
                          userId={appointment.userId}
                          appointment={appointment}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-dark-600">
                    No appointments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default AdminPage;
