/**
 * Worklist skeleton. Mirrors the real layout so the page does not reflow
 * when data arrives, which is the entire reason to have one.
 */
export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="h-16 border-b border-line bg-surface" />
      <div className="shell py-8 sm:py-10">
        <div className="skeleton mb-2 h-8 w-64" />
        <div className="skeleton mb-8 h-5 w-80" />

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card p-5">
              <div className="skeleton mb-4 h-3 w-20" />
              <div className="skeleton mb-4 h-10 w-16" />
              <div className="skeleton h-4 w-full" />
            </div>
          ))}
        </div>

        <div className="card overflow-hidden">
          <div className="panel-header">
            <div className="skeleton h-5 w-36" />
          </div>
          <div className="space-y-px">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-4">
                <div className="skeleton h-5 flex-1" />
                <div className="skeleton h-6 w-24 rounded-full" />
                <div className="skeleton hidden h-5 w-32 sm:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <span className="sr-only" role="status">
        Loading appointments
      </span>
    </div>
  );
}
