"use client";

import React, { useState } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  Brain,
  Check,
  Edit3,
  FlaskConical,
  Info,
  Pill,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  UserCheck,
  X,
} from "lucide-react";
import { ClinicalAssessment, MedicationOption } from "@/types";
import { ClinicalAssessmentApi } from "@/lib/api";

interface ClinicalAssessmentPanelProps {
  assessment: ClinicalAssessment | null;
  onAssessmentUpdated: (updated: ClinicalAssessment) => void;
  onApplyApprovedMedications?: (meds: any[]) => void;
  onRunFreshAssessment?: () => void;
  isLoading?: boolean;
}

export function ClinicalAssessmentPanel({
  assessment,
  onAssessmentUpdated,
  onApplyApprovedMedications,
  onRunFreshAssessment,
  isLoading = false,
}: ClinicalAssessmentPanelProps) {
  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [editDosage, setEditDosage] = useState("");
  const [editFrequency, setEditFrequency] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [savingReview, setSavingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  if (!assessment) {
    return (
      <div className="p-4 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-indigo-600 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-indigo-950">
              Intelligent Clinical Assessment & Medication Decision Support
            </h4>
            <p className="text-[11px] text-slate-600">
              Run patient-specific differential assessment, allergy screening, and drug interaction checks.
            </p>
          </div>
        </div>
        {onRunFreshAssessment && (
          <button
            type="button"
            onClick={onRunFreshAssessment}
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shrink-0 disabled:opacity-50"
          >
            {isLoading ? "Analyzing..." : "Run AI Assessment"}
          </button>
        )}
      </div>
    );
  }

  const snapshot = assessment.patient_snapshot || {};

  const handleReviewAction = async (
    itemType: "medication" | "investigation",
    itemId: string,
    action: "approve" | "edit" | "reject",
    editedData?: Record<string, string>
  ) => {
    setSavingReview(true);
    setReviewError(null);
    try {
      const updated = await ClinicalAssessmentApi.review(assessment.assessment_id, {
        items: [
          {
            item_type: itemType,
            item_id: itemId,
            action,
            edited_data: editedData,
          },
        ],
      });
      onAssessmentUpdated(updated);
      setEditingMedId(null);

      if (onApplyApprovedMedications && updated?.medication_options) {
        const approvedForRx = updated.medication_options
          .filter((m: MedicationOption) => m.review_status === "approved" || m.review_status === "edited")
          .map((m: MedicationOption) => ({
            drug_name: m.kannada_name || m.generic_name,
            dosage: m.doctor_edited_dosage || m.suggested_dosage_reference || "",
            frequency: m.doctor_edited_frequency || m.suggested_frequency_reference || "",
            duration: m.doctor_edited_duration || m.suggested_duration_reference || "",
          }));
        onApplyApprovedMedications(approvedForRx);
      }
    } catch (err: any) {
      setReviewError(err.message || "Failed to save doctor review");
    } finally {
      setSavingReview(false);
    }
  };

  const startEditMed = (med: MedicationOption) => {
    setEditingMedId(med.option_id);
    setEditDosage(med.doctor_edited_dosage || med.suggested_dosage_reference || "");
    setEditFrequency(med.doctor_edited_frequency || med.suggested_frequency_reference || "");
    setEditDuration(med.doctor_edited_duration || med.suggested_duration_reference || "");
  };

  return (
    <div className="p-5 rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/30 space-y-5">
      {/* Header & Disclaimer Banner (Visually Distinct from Approved Rx) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">
              <Sparkles className="w-3 h-3" />
              AI Clinical Decision Support (Advisory Draft)
            </span>
            <span className="text-[11px] font-mono text-slate-500">{assessment.assessment_id}</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">
            Intelligent Clinical Assessment & Medication Safety Review
          </h4>
        </div>

        <span className="text-[11px] font-bold px-3 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 w-fit">
          Status: {assessment.status}
        </span>
      </div>

      {/* Mandatory Non-Diagnostic Disclaimer */}
      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-950 flex items-start gap-2">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <span>
          <strong>Clinical Safety Notice:</strong> {assessment.disclaimer}
        </span>
      </div>

      {/* Emergency Warning Signs */}
      {assessment.has_emergency_flags && assessment.emergency_warning_signs?.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-400 space-y-2">
          <div className="flex items-center gap-2 text-rose-900 font-extrabold text-xs uppercase tracking-wide">
            <AlertOctagon className="w-4 h-4 text-rose-600" />
            <span>Emergency Warning Signs Detected</span>
          </div>
          {assessment.emergency_warning_signs.map((flag, i) => (
            <div key={i} className="text-xs text-rose-950 bg-white/80 p-2.5 rounded-lg border border-rose-200">
              <div className="font-bold">{flag.sign} ({flag.kannada_sign})</div>
              <div className="text-[11px] text-rose-800 mt-0.5">{flag.action_required}</div>
            </div>
          ))}
        </div>
      )}

      {/* Allergy Warnings & Drug Interaction Alerts */}
      {(assessment.allergy_warnings?.length > 0 || assessment.drug_interaction_alerts?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {assessment.allergy_warnings?.length > 0 && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Allergy Warnings ({assessment.allergy_warnings.length})</span>
              </div>
              {assessment.allergy_warnings.map((al, i) => (
                <p key={i} className="text-[11px] text-rose-900 bg-white p-2 rounded border border-rose-200">
                  {al.message}
                </p>
              ))}
            </div>
          )}

          {assessment.drug_interaction_alerts?.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Drug Interaction Alerts ({assessment.drug_interaction_alerts.length})</span>
              </div>
              {assessment.drug_interaction_alerts.map((iw, i) => (
                <div key={i} className="text-[11px] text-amber-950 bg-white p-2 rounded border border-amber-200">
                  <div className="font-bold">
                    {iw.drug} + {iw.interacting_drug} ({iw.severity})
                  </div>
                  <div className="text-slate-700 mt-0.5">{iw.recommendation}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 1. Patient Information & Extracted Symptoms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-sky-600" />
            <span>Patient Clinical Snapshot</span>
          </div>
          <div className="text-[11px] text-slate-700 space-y-0.5">
            <p>
              <strong>Age/Gender:</strong> {snapshot.age ?? "Unknown"} / {snapshot.gender || "Unknown"}
            </p>
            <p>
              <strong>Allergies:</strong>{" "}
              {snapshot.allergies?.length ? snapshot.allergies.join(", ") : "None documented"}
            </p>
            <p>
              <strong>Existing Conditions:</strong>{" "}
              {snapshot.existing_conditions?.length ? snapshot.existing_conditions.join(", ") : "None documented"}
            </p>
            <p>
              <strong>Current Meds:</strong>{" "}
              {snapshot.current_medications?.length ? snapshot.current_medications.join(", ") : "None documented"}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4 text-indigo-600" />
            <span>Clinical Assessment Summary</span>
          </div>
          <p className="text-[11px] text-slate-700 leading-relaxed">{assessment.clinical_assessment_summary}</p>
          {assessment.kannada_summary && (
            <p className="text-[11px] text-indigo-900 bg-indigo-50/60 p-2 rounded border border-indigo-100">
              {assessment.kannada_summary}
            </p>
          )}
        </div>
      </div>

      {/* 2. Possible Diseases & Differential Diagnosis */}
      <div className="space-y-2">
        <h5 className="text-xs font-bold text-slate-800">
          Possible Conditions & Differential Diagnosis (Preliminary — Not Confirmed)
        </h5>
        {assessment.possible_conditions?.length === 0 && assessment.differential_diagnosis?.length === 0 ? (
          <p className="text-xs text-slate-500 italic bg-white p-3 rounded-xl border border-slate-200">
            Insufficient specific symptom/vital triggers for a ranked differential. Gather missing clinical details below.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {[...(assessment.possible_conditions || []), ...(assessment.differential_diagnosis || [])].map((cond) => (
              <div key={cond.condition_id} className="p-3 rounded-xl bg-white border border-indigo-200 text-xs space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900">{cond.condition_name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 uppercase">
                    {cond.likelihood} {cond.confidence_score ? `(${Math.round(cond.confidence_score * 100)}%)` : ""}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">{cond.kannada_name}</p>
                <p className="text-[11px] text-slate-700">{cond.rationale}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Supporting Findings, Missing Info & Recommended Investigations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
          <span className="font-bold text-slate-800 block">Supporting Findings & Missing Information</span>
          {assessment.supporting_clinical_findings?.length > 0 && (
            <ul className="list-disc pl-4 text-[11px] text-slate-700 space-y-0.5">
              {assessment.supporting_clinical_findings.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          )}
          {assessment.missing_clinical_information?.length > 0 && (
            <div className="pt-1.5 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase text-amber-800">Missing Clinical Info:</span>
              <ul className="list-disc pl-4 text-[11px] text-amber-900 space-y-0.5 mt-0.5">
                {assessment.missing_clinical_information.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <FlaskConical className="w-4 h-4 text-sky-600" />
            <span>Recommended Investigations</span>
          </span>
          <div className="space-y-1.5">
            {(assessment.recommended_investigations || []).map((inv) => (
              <div key={inv.investigation_id} className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-[11px] text-slate-900">{inv.test_name}</div>
                  <div className="text-[10px] text-slate-600">{inv.rationale}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={savingReview}
                    onClick={() => handleReviewAction("investigation", inv.investigation_id, "approve")}
                    className={`p-1 rounded border text-[10px] ${
                      inv.review_status === "approved"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                    }`}
                    title="Approve investigation"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    disabled={savingReview}
                    onClick={() => handleReviewAction("investigation", inv.investigation_id, "reject")}
                    className={`p-1 rounded border text-[10px] ${
                      inv.review_status === "rejected"
                        ? "bg-rose-600 text-white border-rose-600"
                        : "bg-white text-rose-700 border-rose-300 hover:bg-rose-50"
                    }`}
                    title="Reject investigation"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Medication Decision Support Options (Doctor Edit / Approve / Reject) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Pill className="w-4 h-4 text-indigo-600" />
            <span>Verified Medication Options (Requires Doctor Approval)</span>
          </span>
          {reviewError && <span className="text-[11px] text-rose-600 font-semibold">{reviewError}</span>}
        </div>

        {assessment.unsupported_requests?.length > 0 && (
          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-[11px] text-amber-950">
            {assessment.unsupported_requests.map((u, i) => (
              <div key={i}>• {u}</div>
            ))}
          </div>
        )}

        <div className="space-y-2.5">
          {(assessment.medication_options || []).map((med) => {
            const isContraindicated = med.safety_status === "contraindicated";
            const isCaution = med.safety_status === "caution_required";
            const isEditing = editingMedId === med.option_id;

            return (
              <div
                key={med.option_id}
                className={`p-3.5 rounded-xl border bg-white space-y-2 ${
                  med.review_status === "rejected"
                    ? "opacity-60 border-slate-200 bg-slate-50"
                    : med.review_status === "approved" || med.review_status === "edited"
                    ? "border-emerald-400 ring-1 ring-emerald-200"
                    : isContraindicated
                    ? "border-rose-300"
                    : "border-slate-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{med.generic_name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {med.drug_class}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          isContraindicated
                            ? "bg-rose-100 text-rose-800 border border-rose-300"
                            : isCaution
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {med.safety_status.replace("_", " ")}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 uppercase">
                        {med.review_status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      <strong>Indication:</strong> {med.indication} •{" "}
                      <strong>Ref Dose:</strong> {med.doctor_edited_dosage || med.suggested_dosage_reference} •{" "}
                      {med.doctor_edited_frequency || med.suggested_frequency_reference} •{" "}
                      {med.doctor_edited_duration || med.suggested_duration_reference}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={savingReview || isContraindicated}
                      onClick={() => handleReviewAction("medication", med.option_id, "approve")}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-[11px] font-semibold flex items-center gap-1"
                      title={isContraindicated ? "Contraindicated for this patient" : "Approve medication"}
                    >
                      <Check className="w-3 h-3" />
                      <span>Approve</span>
                    </button>
                    <button
                      type="button"
                      disabled={savingReview}
                      onClick={() => startEditMed(med)}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      disabled={savingReview}
                      onClick={() => handleReviewAction("medication", med.option_id, "reject")}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-[11px] font-semibold flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>

                {isEditing && (
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600">Dosage</label>
                      <input
                        value={editDosage}
                        onChange={(e) => setEditDosage(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600">Frequency</label>
                      <input
                        value={editFrequency}
                        onChange={(e) => setEditFrequency(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600">Duration</label>
                      <input
                        value={editDuration}
                        onChange={(e) => setEditDuration(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleReviewAction("medication", med.option_id, "edit", {
                          dosage: editDosage,
                          frequency: editFrequency,
                          duration: editDuration,
                        })
                      }
                      className="bg-sky-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                    >
                      Save Edit
                    </button>
                  </div>
                )}

                {/* Safety, Contraindications & Evidence */}
                <div className="text-[10px] text-slate-600 space-y-0.5">
                  {med.precautions?.length > 0 && (
                    <p className="text-amber-800">
                      <strong>Precautions:</strong> {med.precautions.join(" | ")}
                    </p>
                  )}
                  <p>
                    <strong>Evidence:</strong> {med.evidence_references?.join("; ")} •{" "}
                    <strong>Local Availability:</strong> {med.local_availability?.essential_medicine_list || "India Formulary"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
