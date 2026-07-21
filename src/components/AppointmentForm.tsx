import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
} from "lucide-react";
import {
  appointmentSchema,
  type AppointmentFormData,
  tattooLocations,
} from "../schemas/appointmentSchema";
import { FileUpload } from "./FileUpload";

export const AppointmentForm: React.FC = () => {
  const [submittedData, setSubmittedData] =
    useState<AppointmentFormData | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      tattooLocation: "Arm",
      name: "",
      email: "",
      number: "",
      appointmentTime: "",
      appointmentDate: "",
      referenceFile: null,
      notes: "",
    },
    mode: "onTouched",
  });

  const onSubmit = (data: AppointmentFormData) => {
    // Purely local submission handling as requested
    console.log("Locally submitted appointment data:", data);
    setSubmittedData(data);
  };

  const handleBookAnother = () => {
    setSubmittedData(null);
    reset();
  };

  return (
    <div className="bg-[#f2f2f2] rounded-3xl p-6 sm:p-10 shadow-xl border border-black/5">
      {submittedData ? (
        <div className="text-center py-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-[#ffecd0] text-[#ff7b01] rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#2e0249]">
              Appointment Booked!
            </h3>
            <p className="text-gray-600 mt-2">
              Thank you,{" "}
              <span className="font-semibold text-[#ff7b01]">
                {submittedData.name}
              </span>
              ! Your request has been recorded locally.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 text-left max-w-md mx-auto space-y-3 shadow-sm border border-orange-100 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Placement:</span>
              <span className="font-bold text-[#2e0249]">
                {submittedData.tattooLocation}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Date & Time:</span>
              <span className="font-bold text-[#2e0249]">
                {submittedData.appointmentDate} at{" "}
                {submittedData.appointmentTime}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Contact:</span>
              <span className="font-bold text-[#2e0249]">
                {submittedData.number} ({submittedData.email})
              </span>
            </div>
            {submittedData.referenceFile && (
              <div className="flex justify-between items-center pt-1">
                <span className="text-gray-500">Reference:</span>
                <span className="font-medium text-[#ff7b01] truncate max-w-[200px]">
                  {submittedData.referenceFile.name}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleBookAnother}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#ff7b01] text-white font-semibold shadow-lg hover:bg-[#e06c00] transition-colors"
          >
            Book Another Session
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-8"
        >
          {/* Tattoo Location Radio Selector */}
          <div className="space-y-3">
            <label className="block text-base font-semibold text-gray-800">
              I wanna have tattoo in...
            </label>
            <Controller
              name="tattooLocation"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {tattooLocations.map((location) => {
                    const isSelected = field.value === location;
                    return (
                      <button
                        key={location}
                        type="button"
                        onClick={() => field.onChange(location)}
                        className={`px-6 py-2.5 rounded-xl border text-sm sm:text-base font-semibold transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "bg-[#ff7b01] text-white border-[#ff7b01] shadow-md shadow-[#ff7b01]/30 scale-105"
                            : "bg-transparent text-[#ff7b01] border-[#ff7b01] hover:bg-[#ffecd0]"
                        }`}
                      >
                        {location}
                      </button>
                    );
                  })}
                </div>
              )}
            />
            {errors.tattooLocation && (
              <p className="text-xs font-semibold text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.tattooLocation.message}
              </p>
            )}
          </div>

          {/* Text Inputs */}
          <div className="space-y-6">
            {/* Name Input */}
            <div>
              <div className="relative">
                <User className="absolute left-0 top-3 w-5 h-5 text-[#ffbd5b]" />
                <input
                  type="text"
                  placeholder="Your Name"
                  {...register("name")}
                  className={`w-full bg-transparent pl-8 pr-3 py-2.5 border-b-2 text-[#2e0249] placeholder-[#ffbd5b] transition-colors focus:outline-none ${
                    errors.name
                      ? "border-red-500 focus:border-red-600"
                      : "border-[#ffbd5b] focus:border-[#ff7b01]"
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-xs font-semibold text-red-500 flex items-center gap-1 mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email and Phone number row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Email */}
              <div>
                <div className="relative">
                  <Mail className="absolute left-0 top-3 w-5 h-5 text-[#ffbd5b]" />
                  <input
                    type="email"
                    placeholder="Your Email"
                    {...register("email")}
                    className={`w-full bg-transparent pl-8 pr-3 py-2.5 border-b-2 text-[#2e0249] placeholder-[#ffbd5b] transition-colors focus:outline-none ${
                      errors.email
                        ? "border-red-500 focus:border-red-600"
                        : "border-[#ffbd5b] focus:border-[#ff7b01]"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs font-semibold text-red-500 flex items-center gap-1 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone number */}
              <div>
                <div className="relative">
                  <Phone className="absolute left-0 top-3 w-5 h-5 text-[#ffbd5b]" />
                  <input
                    type="tel"
                    placeholder="Your Phone No."
                    {...register("number")}
                    className={`w-full bg-transparent pl-8 pr-3 py-2.5 border-b-2 text-[#2e0249] placeholder-[#ffbd5b] transition-colors focus:outline-none ${
                      errors.number
                        ? "border-red-500 focus:border-red-600"
                        : "border-[#ffbd5b] focus:border-[#ff7b01]"
                    }`}
                  />
                </div>
                {errors.number && (
                  <p className="text-xs font-semibold text-red-500 flex items-center gap-1 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.number.message}
                  </p>
                )}
              </div>
            </div>

            {/* Time and Date row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Time */}
              <div>
                <div className="relative">
                  <Clock className="absolute left-0 top-3 w-5 h-5 text-[#ffbd5b]" />
                  <input
                    type="time"
                    placeholder="Appointment Time"
                    {...register("appointmentTime")}
                    className={`w-full bg-transparent pl-8 pr-3 py-2.5 border-b-2 text-[#2e0249] transition-colors focus:outline-none ${
                      errors.appointmentTime
                        ? "border-red-500 focus:border-red-600"
                        : "border-[#ffbd5b] focus:border-[#ff7b01]"
                    }`}
                  />
                </div>
                {errors.appointmentTime && (
                  <p className="text-xs font-semibold text-red-500 flex items-center gap-1 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.appointmentTime.message}
                  </p>
                )}
              </div>

              {/* Date */}
              <div>
                <div className="relative">
                  <Calendar className="absolute left-0 top-3 w-5 h-5 text-[#ffbd5b]" />
                  <input
                    type="date"
                    placeholder="Appointment Date"
                    {...register("appointmentDate")}
                    className={`w-full bg-transparent pl-8 pr-3 py-2.5 border-b-2 text-[#2e0249] transition-colors focus:outline-none ${
                      errors.appointmentDate
                        ? "border-red-500 focus:border-red-600"
                        : "border-[#ffbd5b] focus:border-[#ff7b01]"
                    }`}
                  />
                </div>
                {errors.appointmentDate && (
                  <p className="text-xs font-semibold text-red-500 flex items-center gap-1 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.appointmentDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Reference Image Upload Section */}
            <Controller
              name="referenceFile"
              control={control}
              render={({ field }) => (
                <FileUpload
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.referenceFile?.message}
                />
              )}
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 rounded-2xl bg-[#ff7b01] text-white font-bold text-base shadow-lg shadow-[#ff7b01]/30 hover:bg-[#e66f00] active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              <span>{isSubmitting ? "Booking..." : "Book Appointment"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
