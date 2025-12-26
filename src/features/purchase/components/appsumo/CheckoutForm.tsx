"use client";
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";
import { motion } from "framer-motion";
import { ArrowRight, Building, Check } from "lucide-react";
import React, { useCallback, useMemo } from "react";
import ValidationSchema from "../../schema/appsumo.schema";
import { FormValues } from "./AppSumo";
export interface Feature {
  name: string;
  description: string;
  features_to_show: string[];
}
interface CheckoutFormProps {
  onSubmit: (
    values: FormValues,
    formikHelpers: FormikHelpers<FormValues>
  ) => void | Promise<void>;
  inputClass: string;
  inputError: string;
  labelClass: string;
  errorClass: string;
  feature: Feature;
  isLoading: boolean;
  frequency: string;
}
const CheckoutForm: React.FC<CheckoutFormProps> = React.memo(
  ({
    onSubmit,
    inputClass,
    inputError,
    labelClass,
    errorClass,
    feature,
    isLoading
  }) => {
    const formVariants = useMemo(
      () => ({
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
      }),
      []
    );
    const initialValues = useMemo<FormValues>(
      () => ({
        name: "",
        companyName: "",
        companyEmail: "",
        companyPhone: "",
        websiteURL: "",
        useCase: "",
        companyAddress: "",
        coupionCode: "",
        agreement: false
      }),
      []
    );
    const handleOpenInvoice = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      const width = 1000;
      const height = 800;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;
      window.open(
        "/terms-and-condition-and-privacy-policy",
        "Terms & Condition | Privacy Policy",
        `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`
      );
    }, []);

    const FeatureItem = useCallback(
      ({ item, index }: { item: string; index: number }) => (
        <div key={index} className="flex items-start space-x-4">
          <div className="mt-1 flex-shrink-0">
            <div className="rounded-full bg-emerald-400 bg-opacity-30 p-1">
              <Check className="h-4 w-4 text-white" />
            </div>
          </div>
          <h6 className="font-medium text-white">{item}</h6>
        </div>
      ),
      []
    );

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex min-h-dvh w-full items-center justify-center px-2 py-4 sm:px-4 sm:py-8"
      >
        <div className="mx-auto w-full max-w-[80%]">
          <div className="relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-xl lg:flex-row">
            <div
              className="relative min-h-[220px] overflow-hidden lg:w-2/5"
              style={{
                background:
                  "linear-gradient(135deg, #bfdbfe 0%, #3b82f6 50%, #4f46e5 100%)"
              }}
            >
              <div className="absolute inset-0 opacity-20">
                <div className="animate-pulse-slow absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
                <div className="animate-rotate-slow absolute -inset-1/2 rotate-12 bg-gradient-to-tr from-white/0 via-white/5 to-white/0"></div>
              </div>
              <div className="relative p-4 text-white sm:p-6 md:p-8 lg:p-10">
                <div className="sticky top-10">
                  <div className="mb-12 flex flex-col gap-3">
                    <div className="">
                      <img
                        src="/images/sideBarLogoDark.png"
                        alt="Cognitiveview"
                        className="h-12"
                      />
                    </div>
                    <h1 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
                      Get started with{" "}
                      <span className="capitalize">{feature?.name} pack</span>
                    </h1>
                    <p className="m text-white/90">{feature?.description}</p>
                    <div className="h-1 w-20 rounded-full bg-white/40"></div>
                  </div>
                  <div className="mb-12 space-y-4">
                    {feature?.features_to_show?.length > 0 && (
                      <>
                        {feature.features_to_show.length > 8
                          ? feature.features_to_show
                              .slice(0, 8)
                              .map((item: string, index: number) => (
                                <FeatureItem
                                  key={index}
                                  item={item}
                                  index={index}
                                />
                              ))
                          : feature.features_to_show.map(
                              (item: string, index: number) => (
                                <FeatureItem
                                  key={index}
                                  item={item}
                                  index={index}
                                />
                              )
                            )}
                        {feature.features_to_show.length > 8 && (
                          <div className="flex items-start space-x-4">
                            <div className="mt-1 flex-shrink-0">
                              <div className="rounded-full bg-emerald-400 bg-opacity-30 p-1">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            </div>
                            <h6 className="font-medium text-white">
                              +{feature.features_to_show.length - 8} more
                            </h6>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="hidden border-t border-white/20 pt-8 md:block">
                    <ul className="list-disc space-y-1 pl-5 font-[family-name:var(--font-geist-sans)] text-sm tracking-wider text-white/80">
                      <li> {'Click on "Redeem AppSumo Coupon"'} </li>
                      <li>
                        Check your inbox for the invitation and accept it.
                      </li>
                      <li>Sign in to our platform using that invitation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative h-fit overflow-y-auto p-8 lg:w-3/5 lg:p-10">
              <div className="mx-auto">
                <Formik
                  initialValues={initialValues}
                  validationSchema={ValidationSchema}
                  onSubmit={onSubmit}
                  validateOnChange={true}
                  validateOnBlur={true}
                >
                  {({ errors, touched, isValid, dirty }) => (
                    <Form className="space-y-8">
                      <motion.div
                        key="combined-form"
                        variants={formVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-8"
                      >
                        {/* Company Information */}
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 sm:rounded-xl sm:p-5 md:rounded-2xl md:p-6">
                          <h3 className="mb-4 flex items-center font-semibold text-gray-800">
                            <Building className="mr-2 h-5 w-5 text-tertiary-600" />
                            Company Information
                          </h3>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                              <div>
                                <label htmlFor="name" className={labelClass}>
                                  Name{" "}
                                  <span className="text-sm text-red-500">
                                    *
                                  </span>
                                </label>
                                <Field
                                  id="name"
                                  name="name"
                                  type="text"
                                  placeholder="Your name"
                                  className={`${inputClass} ${errors.name && touched.name ? inputError : ""}`}
                                />
                                <ErrorMessage
                                  name="name"
                                  component="div"
                                  className={errorClass}
                                />
                              </div>
                              <div>
                                <label
                                  htmlFor="companyEmail"
                                  className={labelClass}
                                >
                                  Email{" "}
                                  <span className="text-sm text-red-500">
                                    *
                                  </span>
                                </label>
                                <Field
                                  id="companyEmail"
                                  name="companyEmail"
                                  type="email"
                                  placeholder="company@example.com"
                                  className={`${inputClass} ${errors.companyEmail && touched.companyEmail ? inputError : ""}`}
                                />
                                <ErrorMessage
                                  name="companyEmail"
                                  component="div"
                                  className={errorClass}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                              <div>
                                <label
                                  htmlFor="companyPhone"
                                  className={labelClass}
                                >
                                  Phone
                                </label>
                                <Field
                                  id="companyPhone"
                                  name="companyPhone"
                                  type="text"
                                  placeholder="+1 (555) 123-4567"
                                  className={`${inputClass} ${errors.companyPhone && touched.companyPhone ? inputError : ""}`}
                                />
                                <ErrorMessage
                                  name="companyPhone"
                                  component="div"
                                  className={errorClass}
                                />
                              </div>
                              <div>
                                <label
                                  htmlFor="companyName"
                                  className={labelClass}
                                >
                                  Company Name{" "}
                                  <span className="text-sm text-red-500">
                                    *
                                  </span>
                                </label>
                                <Field
                                  id="companyName"
                                  name="companyName"
                                  type="text"
                                  placeholder="Your company name"
                                  className={`${inputClass} ${errors.companyName && touched.companyName ? inputError : ""}`}
                                />
                                <ErrorMessage
                                  name="companyName"
                                  component="div"
                                  className={errorClass}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div>
                                <label
                                  htmlFor="websiteURL"
                                  className={labelClass}
                                >
                                  Website URL
                                </label>
                                <Field
                                  id="websiteURL"
                                  name="websiteURL"
                                  type="text"
                                  placeholder="https://yourcompany.com"
                                  className={`${inputClass} ${errors.websiteURL && touched.websiteURL ? inputError : ""}`}
                                />
                                <ErrorMessage
                                  name="websiteURL"
                                  component="div"
                                  className={errorClass}
                                />
                              </div>
                              <div>
                                <label htmlFor="useCase" className={labelClass}>
                                  Primary AI Use Case
                                </label>
                                <Field
                                  type="text"
                                  placeholder="Your usecase type"
                                  id="useCase"
                                  name="useCase"
                                  className={`${inputClass} ${errors.useCase && touched.useCase ? inputError : ""}`}
                                />
                                <ErrorMessage
                                  name="useCase"
                                  component="div"
                                  className={errorClass}
                                />
                              </div>
                            </div>
                            <div>
                              <label
                                htmlFor="companyAddress"
                                className={labelClass}
                              >
                                Company Address
                              </label>
                              <Field
                                id="companyAddress"
                                name="companyAddress"
                                type="text"
                                placeholder="123 Business St, City, Country"
                                className={`${inputClass} ${errors.companyAddress && touched.companyAddress ? inputError : ""}`}
                              />
                              <ErrorMessage
                                name="companyAddress"
                                component="div"
                                className={errorClass}
                              />
                            </div>

                            <div>
                              <label
                                htmlFor="coupionCode"
                                className={labelClass}
                              >
                                AppSumo Coupon Code{" "}
                                <span className="text-sm text-red-500">*</span>
                              </label>
                              <Field
                                id="coupionCode"
                                name="coupionCode"
                                type="text"
                                placeholder="eg: SUMO123..."
                                className={`${inputClass} ${errors.coupionCode && touched.coupionCode ? inputError : ""} uppercase`}
                              />
                              <ErrorMessage
                                name="coupionCode"
                                component="div"
                                className={errorClass}
                              />
                            </div>
                            <div className="flex items-start">
                              <div className="flex h-5 items-center">
                                <Field
                                  id="agreement"
                                  name="agreement"
                                  type="checkbox"
                                  className="h-5 w-5 rounded border-gray-300 text-tertiary-600 focus:ring-tertiary-500"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label
                                  htmlFor="agreement"
                                  className="text-gray-700"
                                >
                                  I agree to the{" "}
                                  <button
                                    type="button"
                                    onClick={handleOpenInvoice}
                                    className="text-tertiary-600 hover:underline"
                                  >
                                    Terms of Service | Privacy Policy
                                  </button>{" "}
                                </label>
                                <ErrorMessage
                                  name="agreement"
                                  component="div"
                                  className={errorClass}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                          <motion.button
                            type="submit"
                            disabled={isLoading || !(isValid && dirty)}
                            whileHover={{
                              scale: isValid && dirty && !isLoading ? 1.02 : 1
                            }}
                            whileTap={{
                              scale: isValid && dirty && !isLoading ? 0.98 : 1
                            }}
                            className={`flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all sm:rounded-xl sm:px-6 sm:py-4 sm:text-base md:px-8 ${
                              isLoading || !(isValid && dirty)
                                ? "cursor-not-allowed bg-gray-400"
                                : "bg-gradient-to-r from-tertiary-600 via-indigo-600 to-violet-500 hover:from-tertiary-700 hover:via-indigo-700 hover:to-violet-600"
                            }`}
                          >
                            {isLoading ? (
                              "Processing..."
                            ) : (
                              <>
                                Redeem AppSumo Coupon
                                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                              </>
                            )}
                          </motion.button>
                        </div>

                        <p className="text-center text-xs text-gray-500 sm:text-sm">
                          {
                            "By signing up, you confirm that you've read and accepted our terms and conditions."
                          }
                        </p>
                      </motion.div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);

CheckoutForm.displayName = "CheckoutForm";
export default CheckoutForm;
