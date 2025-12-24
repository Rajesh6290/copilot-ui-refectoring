"use client";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import { Dialog, DialogActions, DialogTitle } from "@mui/material";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { Check, X } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { NewIncidentValidationSchema } from "../../schema/incident.schema";
interface NewIncident {
  title: string;
  description: string;
  root_cause_summary: string;
  status: string;
  tags: string[];
  impact_scope: string;
  incident_report_date: string;
  due_date: string;
}
const TagInput = ({
  field,
  form
}: {
  field: { name: string; value: string[] };
  form: { setFieldValue: (field: string, value: string[]) => void };
}) => {
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    if (tagInput.trim() !== "") {
      const updatedTags = [...field.value, tagInput.trim()];
      form.setFieldValue(field.name, updatedTags);
      setTagInput("");
    }
  };

  const handleRemoveTag = (index: number) => {
    const updatedTags = [...field.value];
    updatedTags.splice(index, 1);
    form.setFieldValue(field.name, updatedTags);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const isInputEmpty = tagInput.trim() === "";

  return (
    <div className="w-full">
      <div className="flex">
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-l-xl border border-[#e2e8f0] px-4 py-3 outline-none transition-colors duration-200 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] dark:border-neutral-600 dark:bg-darkMainBackground dark:text-white"
          placeholder="Add a tag"
        />
        <button
          type="button"
          onClick={handleAddTag}
          disabled={isInputEmpty}
          className={`rounded-r-xl px-4 py-3 text-white focus:outline-none ${
            isInputEmpty
              ? "cursor-not-allowed bg-gray-400"
              : "bg-[#4f46e5] hover:bg-[#4338ca]"
          }`}
        >
          +
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {field.value.map((tag: string, index: number) => (
          <div
            key={index}
            className="relative flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-1 dark:bg-gray-700"
          >
            <span className="text-sm capitalize text-gray-700 dark:text-white">
              {tag}
            </span>
            <X
              onClick={() => handleRemoveTag(index)}
              className="h-4 w-4 cursor-pointer text-gray-500 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400"
            />
          </div>
        ))}
      </div>
      <ErrorMessage
        name={field.name}
        component="div"
        className="mt-1 text-sm text-red-500"
      />
    </div>
  );
};

const AddNewIncident = ({
  open,
  onClose,
  mutate
}: {
  open: boolean;
  onClose: () => void;
  mutate: () => void;
}) => {
  const { isLoading, mutation } = useMutation();

  const handleAddNew = async (
    values: NewIncident,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const res = await mutation("incident", {
        method: "POST",
        isAlert: false,
        body: {
          ...values,
          incident_report_date: values.incident_report_date
            ? new Date(values.incident_report_date).toISOString()
            : "",
          due_date: values.due_date
            ? new Date(values.due_date).toISOString()
            : ""
        }
      });

      if (res?.status === 201) {
        mutate();
        resetForm();
        onClose();
        toast.success("Incident added successfully");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const initialValues: NewIncident = {
    title: "",
    description: "",
    root_cause_summary: "",
    status: "",
    tags: [],
    impact_scope: "",
    incident_report_date: "",
    due_date: ""
  };

  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      PaperProps={{
        className: "bg-white dark:bg-gray-900 rounded-lg"
      }}
    >
      <DialogTitle className="border-b border-gray-200 dark:border-gray-700 dark:bg-darkSidebarBackground">
        <span className="text-gray-900 dark:text-white">Add New Incident</span>
      </DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={NewIncidentValidationSchema}
        onSubmit={handleAddNew}
      >
        {({ isSubmitting }) => (
          <Form className="dark:bg-darkSidebarBackground">
            <div className="p-6">
              <div className="grid grid-cols-1 gap-3 sm:gap-6 md:grid-cols-2">
                {/* Title */}
                <div>
                  <label
                    htmlFor="title"
                    className="mb-1 block text-sm font-medium text-[#475569] dark:text-white"
                  >
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Field
                    type="text"
                    id="title"
                    name="title"
                    className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 outline-none transition-colors duration-200 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] dark:border-neutral-800 dark:bg-darkMainBackground dark:text-white"
                    placeholder="Enter incident title..."
                  />
                  <ErrorMessage
                    name="title"
                    component="div"
                    className="mt-1 text-sm text-red-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="mb-1 block text-sm font-medium text-[#475569] dark:text-white"
                  >
                    Description <span className="text-red-500">*</span>
                  </label>
                  <Field
                    as="textarea"
                    id="description"
                    name="description"
                    rows={1}
                    className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 outline-none transition-colors duration-200 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] dark:border-neutral-800 dark:bg-darkMainBackground dark:text-white"
                    placeholder="Enter incident description..."
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="mt-1 text-sm text-red-500"
                  />
                </div>

                {/* Root Cause Summary */}
                <div>
                  <label
                    htmlFor="root_cause_summary"
                    className="mb-1 block text-sm font-medium text-[#475569] dark:text-white"
                  >
                    Root Cause Summary
                  </label>
                  <Field
                    as="textarea"
                    id="root_cause_summary"
                    name="root_cause_summary"
                    rows={1}
                    className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 outline-none transition-colors duration-200 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] dark:border-neutral-800 dark:bg-darkMainBackground dark:text-white"
                    placeholder="Enter root cause summary..."
                  />
                  <ErrorMessage
                    name="root_cause_summary"
                    component="div"
                    className="mt-1 text-sm text-red-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label
                    htmlFor="status"
                    className="mb-1 block text-sm font-medium text-[#475569] dark:text-white"
                  >
                    Status <span className="text-red-500">*</span>
                  </label>
                  <Field
                    as="select"
                    id="status"
                    name="status"
                    className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 outline-none transition-colors duration-200 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] dark:border-neutral-800 dark:bg-darkMainBackground dark:text-white"
                  >
                    <option value="" disabled>
                      Select status
                    </option>
                    <option value="investigating">Investigating</option>
                    <option value="mitigating">Mitigating</option>
                    <option value="resolved">Resolved</option>
                    {/* <option value="closed">Closed</option> */}
                  </Field>
                  <ErrorMessage
                    name="status"
                    component="div"
                    className="mt-1 text-sm text-red-500"
                  />
                </div>

                {/* Impact Scope */}
                <div>
                  <label
                    htmlFor="impact_scope"
                    className="mb-1 block text-sm font-medium text-[#475569] dark:text-white"
                  >
                    Impact Scope <span className="text-red-500">*</span>
                  </label>
                  <Field
                    as="select"
                    id="impact_scope"
                    name="impact_scope"
                    className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 outline-none transition-colors duration-200 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] dark:border-neutral-800 dark:bg-darkMainBackground dark:text-white"
                  >
                    <option value="" disabled>
                      Select impact scope
                    </option>
                    <option value="internal">Internal</option>
                    <option value="customer">Customer</option>
                    <option value="regulatory">Regulatory</option>
                  </Field>
                  <ErrorMessage
                    name="impact_scope"
                    component="div"
                    className="mt-1 text-sm text-red-500"
                  />
                </div>

                {/* Incident Report Date */}
                <div>
                  <label
                    htmlFor="incident_report_date"
                    className="mb-1 block text-sm font-medium text-[#475569] dark:text-white"
                  >
                    Incident Report Date
                  </label>
                  <Field
                    type="date"
                    id="incident_report_date"
                    name="incident_report_date"
                    className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 outline-none transition-colors duration-200 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] dark:border-neutral-800 dark:bg-darkMainBackground dark:text-white"
                  />
                  <ErrorMessage
                    name="incident_report_date"
                    component="div"
                    className="mt-1 text-sm text-red-500"
                  />
                </div>
                {/*  Due  Date */}
                <div>
                  <label
                    htmlFor="due_date"
                    className="mb-1 block text-sm font-medium text-[#475569] dark:text-white"
                  >
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <Field
                    type="date"
                    id="due_date"
                    name="due_date"
                    className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 outline-none transition-colors duration-200 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] dark:border-neutral-800 dark:bg-darkMainBackground dark:text-white"
                  />
                  <ErrorMessage
                    name="due_date"
                    component="div"
                    className="mt-1 text-sm text-red-500"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label
                    htmlFor="tags"
                    className="mb-1 block text-sm font-medium text-[#475569] dark:text-white"
                  >
                    Tags
                  </label>
                  <Field name="tags" component={TagInput} />
                </div>
              </div>
            </div>
            <DialogActions className="border-t border-gray-200 p-4 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <div className="w-fit">
                <CustomButton
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  loading={isLoading}
                  startIcon={<Check className="h-4 w-4" />}
                  loadingText="Saving..."
                >
                  Save Incident
                </CustomButton>
              </div>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default AddNewIncident;
