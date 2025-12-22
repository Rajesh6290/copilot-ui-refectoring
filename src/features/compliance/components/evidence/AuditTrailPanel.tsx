import moment from "moment";
import { VersionItem } from "./EvidenceTable";

const AuditTrailPanel: React.FC<{ row: VersionItem }> = ({ row }) => {
  const auditTrail = row.audit_trail || [];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "created":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "uploaded":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "evidence_created":
        return "📝";
      case "files_uploaded":
        return "📁";
      case "audit_evidence":
        return "✅";
      case "evidence_rejected":
        return "❌";
      default:
        return "📋";
    }
  };

  return (
    <div className="rounded-lg bg-gray-50 p-6 dark:bg-darkMainBackground">
      <div className="mb-4">
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Audit Trail for Version: {row.version}
        </h3>
        <div className="mb-4 grid grid-cols-1 gap-4 rounded-lg border bg-white p-4 dark:border-neutral-800 dark:bg-darkSidebarBackground md:grid-cols-3">
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Status:
            </span>
            <div className="mt-1">
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${getStatusColor(row.evidence_status || "unknown")}`}
              >
                {row.evidence_status || "Unknown"}
              </span>
            </div>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Reviewed:
            </span>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {row.reviewed_at
                ? moment(row.reviewed_at).format("MMM DD, YYYY HH:mm")
                : "Not reviewed"}
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Collected By:
            </span>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {row.collected_by || "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-md border-b border-tertiary pb-2 font-medium text-gray-900 dark:text-gray-100">
          Audit History ({auditTrail.length} entries)
        </h4>

        {auditTrail.length === 0 ? (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            No audit trail available
          </div>
        ) : (
          <div className="relative">
            <div className="absolute bottom-0 left-6 top-0 w-0.5 bg-tertiary"></div>

            {auditTrail.map((trail, index) => (
              <div
                key={index}
                className="relative flex items-start space-x-4 pb-6"
              >
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-300 bg-white dark:border-neutral-800 dark:bg-darkSidebarBackground">
                  <span className="text-lg">{getActionIcon(trail.action)}</span>
                </div>

                <div className="flex-1 rounded-lg border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-darkSidebarBackground">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {trail.action
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </h5>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${getStatusColor(trail.status)}`}
                      >
                        {trail.status}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {moment(trail.reviewed_at).format("MMM DD, YYYY HH:mm")}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Reviewed by:
                      </span>
                      <p className="text-gray-600 dark:text-gray-400">
                        {trail.reviewed_by}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        IP Address:
                      </span>
                      <p className="font-mono text-gray-600 dark:text-gray-400">
                        {trail.ip}
                      </p>
                    </div>
                  </div>

                  {trail.comments && (
                    <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-600">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Comments:
                      </span>
                      <p className="mt-1 italic text-gray-600 dark:text-gray-400">
                        {`"${trail.comments}"`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default AuditTrailPanel;
