import React, { forwardRef, useEffect, useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import Button from "../../ui/button/Button";
import TextField from "../../ui/textfeild/textFeild.jsx";
import Select from "../../ui/select/selectFeild.jsx";
import Card from "../../ui/card/Basic.jsx";
import Loader from "../../ui/loader/Loader";
import Modal from "../../ui/modal/basicModal.jsx";
import Notification from "../../ui/notification/notificationmenu.jsx";
import BasicSwitch from "../../ui/switch/basicSwitch.jsx";
import { useSubscriptions } from "../../../hooks/useSubscriptions";
import {
  INITIAL_FORM_VALUES,
  buildSubscriptionFormValues,
} from "../../../types/subscription.type.js";
import {
  SUBSCRIPTION_TYPES,
  PRESET_SUBSCRIPTION_MONTHS,
} from "../../../constant/subscription.jsx";

const subscriptionSchema = Yup.object({
  subscriptionName: Yup.string().trim().min(2).max(80).required("Subscription name is required"),
  subscriptionType: Yup.string().oneOf(SUBSCRIPTION_TYPES).required("Subscription type is required"),
  months: Yup.number().typeError("Enter a valid month count").integer().min(1).required("Months are required"),
  amount: Yup.number().typeError("Enter a valid amount").min(0).required("Amount is required"),
  description: Yup.string().max(250).optional(),
  isActive: Yup.boolean().optional(),
});

function RHFTextField({ name, label, required, hint, type = "text", placeholder, span, ...rest }) {
  return (
    <div style={{ gridColumn: span ? "1/-1" : undefined }}>
      <TextField
        name={name}
        label={label}
        type={type}
        placeholder={placeholder}
        helperText={hint}
        required={required}
        fullWidth
        {...rest}
      />
    </div>
  );
}

function RHFSelect({ name, label, required, hint, placeholder, options, span, onValueChange }) {
  return (
    <div style={{ gridColumn: span ? "1/-1" : undefined }}>
      <Select
        name={name}
        label={label}
        placeholder={placeholder}
        options={options}
        helperText={hint}
        required={required}
        fullWidth
        onChange={onValueChange}
      />
    </div>
  );
}

const subscriptionTypeLabel = (value) => {
  if (value === "Quarterly") return "Quarterly";
  if (value === "Half Yearly") return "Half Yearly";
  if (value === "Yearly") return "Yearly";
  return value || "Custom";
};

const SubscriptionForm = forwardRef(function SubscriptionForm(
  { onClose, onSaved, subscription: defaultValues = null, subscriptionId = null },
  ref,
) {
  const { registerSubscription, updateSubscription } = useSubscriptions();
  const isEdit = !!defaultValues && Object.keys(defaultValues).length > 0;
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const methods = useForm({
    defaultValues: isEdit ? buildSubscriptionFormValues(defaultValues) : INITIAL_FORM_VALUES,
    resolver: yupResolver(subscriptionSchema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const { handleSubmit, watch, setValue, getValues, reset } = methods;
  const subscriptionType = watch("subscriptionType");
  const months = watch("months");

  useEffect(() => {
    if (!isEdit) {
      reset(INITIAL_FORM_VALUES);
      return;
    }

    reset(buildSubscriptionFormValues(defaultValues));
  }, [defaultValues, isEdit, reset]);

  useEffect(() => {
    const presetMonths = PRESET_SUBSCRIPTION_MONTHS[subscriptionType];
    if (presetMonths && Number(months) !== presetMonths) {
      setValue("months", presetMonths, { shouldValidate: true });
    }
    if (subscriptionType !== "Custom" && !getValues("subscriptionName")) {
      setValue("subscriptionName", subscriptionTypeLabel(subscriptionType), { shouldValidate: true });
    }
  }, [subscriptionType, months, getValues, setValue]);

  React.useImperativeHandle(ref, () => ({
    submitForm: handleSubmit(doSubmit),
  }));

  const isCustom = subscriptionType === "Custom";
  const typeOptions = useMemo(() => SUBSCRIPTION_TYPES, []);

  const doSubmit = async (data) => {
    setLoading(true);
    setSubmitError("");
    try {
      const payload = {
        ...data,
        subscriptionName: String(data.subscriptionName || "").trim() || subscriptionTypeLabel(data.subscriptionType),
        months: Number(data.months),
        amount: Number(data.amount),
        isActive: Boolean(data.isActive),
      };

      if (isEdit) {
        if (!subscriptionId) throw new Error("Subscription ID missing");
        await updateSubscription({ id: subscriptionId, payload });
      } else {
        await registerSubscription(payload);
      }

      try {
        await onSaved?.(isEdit);
      } catch {
        // keep closing even if the refresh fails
      }
      setSuccess(true);
    } catch (error) {
      setSubmitError(error?.response?.data?.message || error?.message || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Modal open onClose={onClose} maxWidth={420}>
        <div style={{ textAlign: "center", padding: "44px 36px" }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "#f0fdf4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 18px",
            fontSize: 34,
          }}>
            ✓
          </div>
          <h2 style={{ fontSize: 24, color: "#0f2044", margin: "0 0 10px", fontWeight: 600 }}>
            {isEdit ? "Subscription Updated!" : "Subscription Created!"}
          </h2>
          <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, margin: "0 0 26px" }}>
            {isEdit
              ? <>Updated <strong>{getValues("subscriptionName")}</strong> successfully.</>
              : <>Created <strong>{getValues("subscriptionName")}</strong> successfully.</>}
          </p>
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open onClose={!loading ? onClose : undefined} maxWidth={760}>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", maxHeight: "92vh", overflow: "hidden" }}>
        {loading && (
          <div style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            background: "rgba(15,32,68,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Loader size={36} color="inherit" />
          </div>
        )}

        <div style={{
          padding: "16px 22px",
          background: "linear-gradient(135deg,#0f2044 0%,#1a3460 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}>
          <div>
            <h1 style={{ fontSize: 20, color: "#fff", margin: 0, fontWeight: 600 }}>
              {isEdit ? "Edit Subscription" : "Create Subscription"}
            </h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.55)", margin: "2px 0 0" }}>
              Manage quarterly, half-yearly, yearly and custom plans
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { if (!loading) onClose(); }}
            disabled={loading}
            aria-label="Close"
            style={{ color: "#fff", borderRadius: "50%", border: "1.5px solid rgba(255,255,255,.28)" }}
          >
            ×
          </Button>
        </div>

        <div style={{ padding: "22px 24px 24px", overflowY: "auto" }}>
          <FormProvider {...methods}>
            <form onSubmit={(e) => e.preventDefault()} noValidate>
              <Card style={{ padding: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                  <RHFSelect
                    name="subscriptionType"
                    label="Subscription Type"
                    required
                    placeholder="Select plan type"
                    options={typeOptions}
                    onValueChange={(value) => {
                      if (PRESET_SUBSCRIPTION_MONTHS[value]) {
                        setValue("months", PRESET_SUBSCRIPTION_MONTHS[value], { shouldValidate: true });
                        setValue("subscriptionName", value, { shouldValidate: true });
                      }
                    }}
                  />
                  <RHFTextField
                    name="subscriptionName"
                    label="Subscription Name"
                    required
                    placeholder="Quarterly"
                    hint="Shown to colleges during registration"
                  />
                  <RHFTextField
                    name="months"
                    label="Months"
                    required
                    type="number"
                    placeholder="3"
                    disabled={!isCustom && Boolean(PRESET_SUBSCRIPTION_MONTHS[subscriptionType])}
                    hint={isCustom ? "Choose your own month count" : "Preset plans lock this value"}
                  />
                  <RHFTextField
                    name="amount"
                    label="Amount (₹)"
                    required
                    type="number"
                    placeholder="3000"
                    hint="Payment amount shown on the college registration page"
                  />
                  <div style={{ gridColumn: "1/-1" }}>
                    <RHFTextField
                      name="description"
                      label="Description"
                      multiline
                      rows={3}
                      placeholder="Short note for this subscription"
                      hint="Optional, max 250 characters"
                      span
                    />
                  </div>
                  <div style={{ gridColumn: "1/-1", paddingTop: 4 }}>
                    <BasicSwitch name="isActive" label="Active" />
                  </div>
                </div>
              </Card>

              {submitError && (
                <Notification type="error" message={submitError} style={{ marginTop: 14 }} />
              )}

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                marginTop: 22,
                paddingTop: 18,
                borderTop: "1px solid #e2e8f4",
              }}>
                <Button variant="outline" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit(doSubmit)}
                  disabled={loading}
                  loading={loading}
                >
                  {isEdit ? "Save Changes" : "Create Subscription"}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </Modal>
  );
});

export default SubscriptionForm;
