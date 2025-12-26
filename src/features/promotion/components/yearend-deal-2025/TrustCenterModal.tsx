import { useFormik } from "formik";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import * as Yup from "yup";
const TrustCenterModal = ({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const RequestSchema = Yup.object().shape({
    fullName: Yup.string()
      .min(2, "Name too short")
      .required("Full Name is required"),
    email: Yup.string()
      .email("Invalid email")
      .required("Work Email is required"),
    companyUrl: Yup.string()
      .url("Must be https://...")
      .required("Company URL is required")
  });
  const [isLoading, setIsLoading] = useState(false);
  const formik = useFormik({
    initialValues: { fullName: "", email: "", companyUrl: "" },
    validationSchema: RequestSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `https://haigs.cognitiveview.com/api/cv/v1/public/generate-trust-center?recipient_email=${values.email}&recipient_name=${values.fullName}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              urls_for_scraping: [values.companyUrl],
              company_name: ""
            })
          }
        );
        if (res?.status === 201) {
          const resData = await res.json();
          // Replace the toast.success with:
          Swal.fire({
            icon: "success",
            title: "Trust center generation started successfully!",
            text: `${resData?.data?.note || ""}`,
            confirmButtonText: "Okay"
          });
          resetForm();
          onClose();
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="bg-gradient-to-r from-blue-600 to-tertiary-600 p-6 text-white">
              <h3 className="text-2xl font-bold">
                Get Your Free RAI Trustscore + Trustcenter
              </h3>
              <p className="mt-2 text-sm text-blue-100">
                See your score in under 2 minutes. No credit card required.
              </p>
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full bg-white/20 p-1.5 text-white transition hover:bg-white/30"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={formik.handleSubmit} className="space-y-5 p-6">
              <div>
                <input
                  {...formik.getFieldProps("fullName")}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-4 text-base placeholder:text-slate-400"
                  placeholder="Full Name"
                />
                {formik.touched.fullName && formik.errors.fullName && (
                  <div className="mt-1 text-xs text-red-500">
                    {formik.errors.fullName}
                  </div>
                )}
              </div>
              <div>
                <input
                  {...formik.getFieldProps("email")}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-4 text-base"
                  placeholder="Work Email"
                />
                {formik.touched.email && formik.errors.email && (
                  <div className="mt-1 text-xs text-red-500">
                    {formik.errors.email}
                  </div>
                )}
              </div>
              <div>
                <input
                  {...formik.getFieldProps("companyUrl")}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-4 text-base"
                  placeholder="Company Website (https://...)"
                />
                {formik.touched.companyUrl && formik.errors.companyUrl && (
                  <div className="mt-1 text-xs text-red-500">
                    {formik.errors.companyUrl}
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-tertiary-600 py-4 text-lg font-bold text-white transition-all hover:shadow-xl"
              >
                {isLoading ? "Generating..." : "Generate My Free TrustCenter"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default TrustCenterModal;
