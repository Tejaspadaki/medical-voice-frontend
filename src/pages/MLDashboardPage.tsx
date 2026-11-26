import React, { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Cpu,
  Database,
  FileDown,
  FolderInput,
  Loader2,
  Play,
  Sliders,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { Header } from "@/components/Header";
import { MLExperimentApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { ModelRadarChart, MultiLineTrainingChart, SimpleBarChart } from "@/components/MLCharts";

export function MLDashboardPage() {
  const { success, error: toastError } = useToast();

  // 1. Model Registry & Datasets
  const [models, setModels] = useState<any[]>([]);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<any | null>(null);
  const [selectedModels, setSelectedModels] = useState<string[]>(["sarvam_saaras_v3", "indicwhisper_local", "auradoc_bilingual_nlp"]);

  // 2. Upload & Preprocessing Config
  const [uploadName, setUploadName] = useState("Kannada Clinical Speech Dataset");
  const [uploadLang, setUploadLang] = useState("kn");
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [targetSr, setTargetSr] = useState(16000);
  const [convertMono, setConvertMono] = useState(true);
  const [normalizeAudio, setNormalizeAudio] = useState(true);
  const [silenceDetect, setSilenceDetect] = useState(true);

  // 3. Annotations State (audio_id -> reference_text)
  const [annotationsDraft, setAnnotationsDraft] = useState<Record<string, { text: string; language: string }>>({});

  // 4. Training Config & Job
  const [trainModelId, setTrainModelId] = useState("auradoc_bilingual_nlp");
  const [epochs, setEpochs] = useState(3);
  const [batchSize, setBatchSize] = useState(4);
  const [learningRate, setLearningRate] = useState(0.0001);
  const [trainSplit, setTrainSplit] = useState(0.8);
  const [trainingJob, setTrainingJob] = useState<any | null>(null);

  // 5. Evaluation & History
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [activeEval, setActiveEval] = useState<any | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const loadInitial = async () => {
    try {
      const [reg, dsList, evalList] = await Promise.all([
        MLExperimentApi.getRegistry(),
        MLExperimentApi.listDatasets(),
        MLExperimentApi.listEvaluations(),
      ]);
      setModels(reg.models || []);
      setDatasets(dsList.items || []);
      setEvaluations(evalList.items || []);
      if (dsList.items?.length && !selectedDataset) {
        selectDataset(dsList.items[0]);
      }
      if (evalList.items?.length && !activeEval) {
        setActiveEval(evalList.items[0]);
      }
    } catch (err: any) {
      toastError(err.message || "Failed to load ML Lab data", "Load Error");
    }
  };

  useEffect(() => {
    loadInitial();
  }, []);

  const selectDataset = (ds: any) => {
    setSelectedDataset(ds);
    const draft: Record<string, { text: string; language: string }> = {};
    for (const af of ds?.audio_files || []) {
      draft[af.audio_id] = {
        text: af.corrected_text || af.reference_transcription || "",
        language: af.language_label || "kn",
      };
    }
    setAnnotationsDraft(draft);
  };

  const handleUpload = async () => {
    if (!uploadFiles || uploadFiles.length === 0) {
      toastError("Select WAV, MP3, M4A, or FLAC files first.", "No Files Selected");
      return;
    }
    setBusy("upload");
    try {
      const fd = new FormData();
      fd.append("dataset_name", uploadName);
      fd.append("language", uploadLang);
      Array.from(uploadFiles).forEach((f) => fd.append("files", f));
      const created = await MLExperimentApi.uploadDataset(fd);
      setDatasets((prev) => [created, ...prev]);
      selectDataset(created);
      success(`Uploaded ${created.total_files} audio files.`, "Dataset Created");
    } catch (err: any) {
      toastError(err.message || "Upload failed", "Upload Error");
    } finally {
      setBusy(null);
    }
  };

  const handleImportLocal = async (folder: "submission_kannada_audios" | "sample_audios") => {
    setBusy(`import_${folder}`);
    try {
      const created = await MLExperimentApi.importLocalDataset(folder);
      setDatasets((prev) => [created, ...prev]);
      selectDataset(created);
      success(`Imported ${created.total_files} audio files from ${folder}.`, "Dataset Imported");
    } catch (err: any) {
      toastError(err.message || "Import failed", "Import Error");
    } finally {
      setBusy(null);
    }
  };

  const handleSaveAnnotations = async () => {
    if (!selectedDataset) return;
    setBusy("annotate");
    try {
      const payload = Object.entries(annotationsDraft)
        .filter(([, v]) => v.text.trim().length > 0)
        .map(([audio_id, v]) => ({
          audio_id,
          reference_text: v.text,
          language: v.language,
          annotator: "Doctor/Researcher",
        }));
      if (payload.length === 0) {
        toastError("Enter at least one reference transcript before saving.", "Empty Annotations");
        setBusy(null);
        return;
      }
      const updated = await MLExperimentApi.saveAnnotations(selectedDataset.dataset_id, payload);
      selectDataset(updated);
      setDatasets((prev) => prev.map((d) => (d.dataset_id === updated.dataset_id ? updated : d)));
      success(`Saved ${updated.annotated_count}/${updated.total_files} ground-truth transcripts.`, "Annotations Saved");
    } catch (err: any) {
      toastError(err.message || "Failed to save annotations", "Annotation Error");
    } finally {
      setBusy(null);
    }
  };

  const handleRunEvaluation = async () => {
    if (!selectedDataset || selectedModels.length === 0) {
      toastError("Select a dataset and at least one model.", "Selection Required");
      return;
    }
    setBusy("evaluate");
    try {
      const res = await MLExperimentApi.evaluateModels({
        dataset_id: selectedDataset.dataset_id,
        model_ids: selectedModels,
        preprocessing: {
          target_sample_rate_hz: targetSr,
          convert_to_mono: convertMono,
          normalize_audio: normalizeAudio,
          silence_detection: silenceDetect,
          noise_analysis: true,
        },
        evaluate_clinical_nlp: true,
      });
      setActiveEval(res);
      setEvaluations((prev) => [res, ...prev]);
      success(`Evaluation ${res.evaluation_id} completed across ${selectedModels.length} model(s).`, "Evaluation Complete");
    } catch (err: any) {
      toastError(err.message || "Evaluation failed", "Evaluation Error");
    } finally {
      setBusy(null);
    }
  };

  const handleRunTraining = async () => {
    if (!selectedDataset) return;
    setBusy("train");
    try {
      const job = await MLExperimentApi.trainModel({
        dataset_id: selectedDataset.dataset_id,
        model_id: trainModelId,
        batch_size: batchSize,
        learning_rate: learningRate,
        epochs,
        train_split: trainSplit,
      });
      setTrainingJob(job);
      success(`Training job ${job.job_id}: ${job.status}`, "Training Job");
    } catch (err: any) {
      toastError(err.message || "Training failed", "Training Error");
    } finally {
      setBusy(null);
    }
  };

  const handleDownloadPdfReport = async () => {
    if (!activeEval) return;
    try {
      const token = localStorage.getItem("access_token");
      const resp = await fetch(MLExperimentApi.getReportDownloadUrl(activeEval.evaluation_id), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!resp.ok) throw new Error("Failed to download PDF report");
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `AuraDoc_ML_Evaluation_${activeEval.evaluation_id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toastError(err.message || "PDF download error", "Export Error");
    }
  };

  const handleExportJson = () => {
    if (!activeEval) return;
    const blob = new Blob([JSON.stringify(activeEval, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AuraDoc_Evaluation_${activeEval.evaluation_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const graphs = activeEval?.graphs || {};

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header />

      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Top Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-sky-300 uppercase tracking-wider">
              <BarChart3 className="w-4 h-4" />
              <span>AuraDoc Clinical AI — Multi-Model Audio Experimentation Lab</span>
            </div>
            <h1 className="text-xl font-extrabold mt-1">
              Speech Dataset Management, Model Evaluation, Calibration & Visualization
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Authentic WER/CER calculation against human reference transcripts • Cloud inference vs local calibration clearly separated.
            </p>
          </div>
          {evaluations.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-slate-300">Experiment:</span>
              <select
                value={activeEval?.evaluation_id || ""}
                onChange={(e) => {
                  const found = evaluations.find((ev) => ev.evaluation_id === e.target.value);
                  if (found) setActiveEval(found);
                }}
                className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-white"
              >
                {evaluations.map((ev) => (
                  <option key={ev.evaluation_id} value={ev.evaluation_id}>
                    {ev.evaluation_id} ({ev.total_samples} files)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 1. Model Registry */}
        <section className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-600" />
              <span>1. Centralized Dynamic Model Registry ({models.length} Models Discovered)</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {models.map((m) => (
              <div key={m.model_id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900">{m.model_name}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      m.available ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {m.available ? "Available" : "Key Missing"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">{m.architecture} • v{m.version}</p>
                <p className="text-[11px] text-slate-700">{m.purpose}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 font-semibold">
                    {m.trainable_locally ? "Locally Trainable / Calibratable" : "Cloud Inference Only"}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {m.supported_languages?.join(", ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Audio Dataset Upload & 3. Dataset Overview & 4. Preprocessing */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Upload & Import */}
          <section className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-sky-600" />
              <span>2. Audio Dataset Upload</span>
            </h2>
            <div className="space-y-2 text-xs">
              <input
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                placeholder="Dataset name"
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5"
              />
              <div className="flex gap-2">
                <select
                  value={uploadLang}
                  onChange={(e) => setUploadLang(e.target.value)}
                  className="border border-slate-300 rounded-lg px-2 py-1.5"
                >
                  <option value="kn">Kannada (kn)</option>
                  <option value="en">English (en)</option>
                  <option value="kanglish">Kanglish</option>
                </select>
                <input
                  type="file"
                  multiple
                  accept=".wav,.mp3,.m4a,.flac"
                  onChange={(e) => setUploadFiles(e.target.files)}
                  className="w-full text-[11px]"
                />
              </div>
              <button
                type="button"
                disabled={busy === "upload"}
                onClick={handleUpload}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {busy === "upload" ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                <span>Upload Audio Dataset (WAV/MP3/M4A/FLAC)</span>
              </button>

              <div className="pt-2 border-t border-slate-200 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600 block">Quick Import Project Audio Folders:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => handleImportLocal("submission_kannada_audios")}
                    className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-semibold py-2 px-2 rounded-xl text-[11px] flex items-center justify-center gap-1"
                  >
                    <FolderInput className="w-3.5 h-3.5" />
                    <span>10 Kannada Audios</span>
                  </button>
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => handleImportLocal("sample_audios")}
                    className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 font-semibold py-2 px-2 rounded-xl text-[11px] flex items-center justify-center gap-1"
                  >
                    <FolderInput className="w-3.5 h-3.5" />
                    <span>6 Sample Audios</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Dataset Overview */}
          <section className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>3. Dataset Overview</span>
            </h2>
            {datasets.length > 0 && (
              <select
                value={selectedDataset?.dataset_id || ""}
                onChange={(e) => {
                  const ds = datasets.find((d) => d.dataset_id === e.target.value);
                  if (ds) selectDataset(ds);
                }}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
              >
                {datasets.map((d) => (
                  <option key={d.dataset_id} value={d.dataset_id}>
                    {d.name} ({d.total_files} files)
                  </option>
                ))}
              </select>
            )}
            {selectedDataset ? (
              <div className="text-xs space-y-1.5 text-slate-700">
                <p><strong>Dataset ID:</strong> {selectedDataset.dataset_id}</p>
                <p><strong>Total Audio Files:</strong> {selectedDataset.total_files} {selectedDataset.is_pilot_dataset && <span className="text-amber-700 font-semibold">(Pilot Dataset)</span>}</p>
                <p><strong>Annotated Ground Truth:</strong> {selectedDataset.annotated_count} / {selectedDataset.total_files}</p>
                <p className="text-[11px] text-slate-500">Original audio files are preserved untouched; preprocessed copies are tracked separately.</p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Upload or import a dataset to inspect metadata.</p>
            )}
          </section>

          {/* Audio Preprocessing Config */}
          <section className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>4. Audio Preprocessing Pipeline</span>
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span>Target Sample Rate (Hz)</span>
                <select value={targetSr} onChange={(e) => setTargetSr(Number(e.target.value))} className="border border-slate-300 rounded px-2 py-1">
                  <option value={16000}>16000 Hz</option>
                  <option value={22050}>22050 Hz</option>
                  <option value={44100}>44100 Hz</option>
                </select>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={convertMono} onChange={(e) => setConvertMono(e.target.checked)} />
                <span>Convert to Mono (when supported)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={normalizeAudio} onChange={(e) => setNormalizeAudio(e.target.checked)} />
                <span>Peak Audio Normalization</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={silenceDetect} onChange={(e) => setSilenceDetect(e.target.checked)} />
                <span>Silence Detection & Noise Analysis</span>
              </label>
            </div>
          </section>
        </div>

        {/* 5. Reference Transcript Annotation */}
        {selectedDataset && (
          <section className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  5. Reference Transcript Annotation (Ground Truth for WER / CER)
                </h2>
                <p className="text-[11px] text-slate-500">
                  WER and CER are computed strictly against human-verified reference transcripts — never from model predictions.
                </p>
              </div>
              <button
                type="button"
                disabled={busy === "annotate"}
                onClick={handleSaveAnnotations}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shrink-0"
              >
                {busy === "annotate" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>Save Reference Transcripts</span>
              </button>
            </div>

            <div className="overflow-x-auto max-h-80 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="p-2.5">Audio File</th>
                    <th className="p-2.5">Metadata</th>
                    <th className="p-2.5">Lang</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 w-1/2">Reference Transcription</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(selectedDataset.audio_files || []).map((af: any) => {
                    const draft = annotationsDraft[af.audio_id] || { text: "", language: af.language_label || "kn" };
                    return (
                      <tr key={af.audio_id}>
                        <td className="p-2.5 font-semibold text-slate-900">{af.file_name}</td>
                        <td className="p-2.5 text-[11px] text-slate-600">
                          {af.duration_sec}s • {af.sample_rate}Hz • {af.channels}ch • {af.audio_quality}
                        </td>
                        <td className="p-2.5">
                          <select
                            value={draft.language}
                            onChange={(e) =>
                              setAnnotationsDraft((p) => ({ ...p, [af.audio_id]: { ...draft, language: e.target.value } }))
                            }
                            className="border border-slate-300 rounded px-1.5 py-1 text-[11px]"
                          >
                            <option value="kn">kn</option>
                            <option value="en">en</option>
                            <option value="kanglish">kanglish</option>
                          </select>
                        </td>
                        <td className="p-2.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              af.annotation_status === "ANNOTATED"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-900"
                            }`}
                          >
                            {af.annotation_status}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <input
                            value={draft.text}
                            onChange={(e) =>
                              setAnnotationsDraft((p) => ({ ...p, [af.audio_id]: { ...draft, text: e.target.value } }))
                            }
                            placeholder="Enter actual spoken reference transcript..."
                            className="w-full border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* 6. Model Selection & Execution + 7. Training Config & 8. Training Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Play className="w-4 h-4 text-sky-600" />
              <span>6. Multi-Model Selection & Evaluation</span>
            </h2>
            <div className="space-y-1.5 text-xs">
              {models.map((m) => (
                <label key={m.model_id} className="flex items-center justify-between p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedModels.includes(m.model_id)}
                      onChange={(e) =>
                        setSelectedModels((prev) =>
                          e.target.checked ? [...prev, m.model_id] : prev.filter((id) => id !== m.model_id)
                        )
                      }
                    />
                    <span className="font-semibold text-slate-900">{m.model_name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{m.evaluation_mode}</span>
                </label>
              ))}
            </div>
            <button
              type="button"
              disabled={busy === "evaluate" || !selectedDataset}
              onClick={handleRunEvaluation}
              className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {busy === "evaluate" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Run Multi-Model Evaluation & Generate Graphs</span>
            </button>
          </section>

          <section className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>7 & 8. Training / Calibration Configuration & Progress</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="col-span-2 sm:col-span-3">
                <label className="text-[10px] font-bold text-slate-600">Target Model</label>
                <select value={trainModelId} onChange={(e) => setTrainModelId(e.target.value)} className="w-full border border-slate-300 rounded-lg px-2 py-1.5">
                  {models.map((m) => (
                    <option key={m.model_id} value={m.model_id}>
                      {m.model_name} ({m.trainable_locally ? "Local Trainable" : "Cloud API - Inference Only"})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600">Epochs</label>
                <input type="number" value={epochs} onChange={(e) => setEpochs(Number(e.target.value))} className="w-full border border-slate-300 rounded px-2 py-1" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600">Batch Size</label>
                <input type="number" value={batchSize} onChange={(e) => setBatchSize(Number(e.target.value))} className="w-full border border-slate-300 rounded px-2 py-1" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600">Train Split</label>
                <input type="number" step="0.05" value={trainSplit} onChange={(e) => setTrainSplit(Number(e.target.value))} className="w-full border border-slate-300 rounded px-2 py-1" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600">Learning Rate</label>
                <input type="number" step="0.0001" value={learningRate} onChange={(e) => setLearningRate(Number(e.target.value))} className="w-full border border-slate-300 rounded px-2 py-1" />
              </div>
            </div>
            <button
              type="button"
              disabled={busy === "train" || !selectedDataset}
              onClick={handleRunTraining}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl disabled:opacity-50"
            >
              {busy === "train" ? "Running..." : "Start Training / Lexicon Calibration"}
            </button>
            {trainingJob && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="font-bold">Job {trainingJob.job_id}: {trainingJob.status}</div>
                <div className="text-[11px] text-slate-600">{trainingJob.message}</div>
              </div>
            )}
          </section>
        </div>

        {/* 9. Evaluation Results, 10. Graph Visualization, 11. Model Comparison, 12. Export Reports */}
        {activeEval && (
          <div className="space-y-6">
            {activeEval.pilot_warning && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span><strong>Pilot Evaluation Notice:</strong> {activeEval.pilot_warning}</span>
              </div>
            )}

            {/* 9 & 12: Summary Table + Export */}
            <section className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    9 & 12. Evaluation Results ({activeEval.evaluation_id}) & Export Reports
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Normalization: {activeEval.normalization_method} • Annotated: {activeEval.annotated_samples}/{activeEval.total_samples}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadPdfReport}
                    className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Download PDF Report</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold px-3 py-2 rounded-xl"
                  >
                    Export JSON
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Model</th>
                      <th className="p-2.5">Mode</th>
                      <th className="p-2.5">Avg WER</th>
                      <th className="p-2.5">Avg CER</th>
                      <th className="p-2.5">Avg Latency</th>
                      <th className="p-2.5">Avg RTF</th>
                      <th className="p-2.5">Throughput</th>
                      <th className="p-2.5">Peak Mem</th>
                      <th className="p-2.5">Errors</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(activeEval.model_summaries || []).map((s: any) => (
                      <tr key={s.model_id}>
                        <td className="p-2.5 font-bold">{s.model_name}</td>
                        <td className="p-2.5 text-[11px] text-slate-600">{s.evaluation_mode}</td>
                        <td className="p-2.5 font-mono">{s.avg_wer ?? "N/A"}</td>
                        <td className="p-2.5 font-mono">{s.avg_cer ?? "N/A"}</td>
                        <td className="p-2.5 font-mono">{s.avg_latency_ms} ms</td>
                        <td className="p-2.5 font-mono">{s.avg_rtf ?? "N/A"}</td>
                        <td className="p-2.5 font-mono">{s.throughput_audio_sec_per_sec ?? "N/A"}x</td>
                        <td className="p-2.5 font-mono">{s.peak_memory_mb} MB</td>
                        <td className="p-2.5">{s.errors_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 10 & 11: Automatic Graphs & Radar Comparison */}
            <section className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900">
                10 & 11. Automatic Visualization & Multi-Model Comparison
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <SimpleBarChart
                  title="Audio Duration Distribution"
                  unit="sec"
                  color="#0284c7"
                  data={(graphs.dataset_graphs?.duration_distribution || []).map((d: any) => ({
                    label: d.file_name,
                    value: d.duration_sec,
                  }))}
                />
                <SimpleBarChart
                  title="Language Distribution"
                  unit="files"
                  color="#059669"
                  data={(graphs.dataset_graphs?.language_distribution || []).map((d: any) => ({
                    label: d.label,
                    value: d.count,
                  }))}
                />
                <SimpleBarChart
                  title="Sample Rate Distribution"
                  unit="files"
                  color="#4f46e5"
                  data={(graphs.dataset_graphs?.sample_rate_distribution || []).map((d: any) => ({
                    label: `${d.sample_rate_hz}Hz`,
                    value: d.count,
                  }))}
                />
                <SimpleBarChart
                  title="Model WER Comparison (Lower is Better)"
                  unit="WER"
                  color="#e11d48"
                  data={(graphs.asr_performance_graphs?.model_wer_comparison || []).map((d: any) => ({
                    label: d.model_name,
                    value: d.avg_wer,
                  }))}
                />
                <SimpleBarChart
                  title="Model CER Comparison (Lower is Better)"
                  unit="CER"
                  color="#ea580c"
                  data={(graphs.asr_performance_graphs?.model_cer_comparison || []).map((d: any) => ({
                    label: d.model_name,
                    value: d.avg_cer,
                  }))}
                />
                <SimpleBarChart
                  title="Average Inference Latency"
                  unit="ms"
                  color="#7c3aed"
                  data={(graphs.efficiency_graphs?.avg_latency_comparison || []).map((d: any) => ({
                    label: d.model_name,
                    value: d.avg_latency_ms,
                  }))}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <MultiLineTrainingChart history={graphs.training_performance_graphs?.epochs || []} />
                <ModelRadarChart models={graphs.comparison_radar || []} />
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
