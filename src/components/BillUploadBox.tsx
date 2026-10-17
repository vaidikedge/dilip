import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  X,
  AlertCircle,
  Eye,
  Zap,
  Info,
  FileCheck
} from 'lucide-react';

export interface BillUploadData {
  fileName: string;
  fileType: string;
  fileSize: number;
  fileData: string; // Base64 data URI
  accountNumber?: string;
  sanctionedLoad?: string;
}

interface BillUploadBoxProps {
  value?: BillUploadData | null;
  onChange: (data: BillUploadData | null) => void;
  accountNumber?: string;
  onAccountNumberChange?: (val: string) => void;
  sanctionedLoad?: string;
  onSanctionedLoadChange?: (val: string) => void;
  compact?: boolean;
}

/**
 * Compresses an image file in the browser using HTML5 Canvas
 * to ensure it safely fits within Firestore's 1MB document limit (< 300KB).
 */
async function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const maxDimension = 1400;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        // Draw image onto canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG with 0.78 quality for crisp text + compact file size
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.78);
        resolve(compressedDataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Reads a PDF file as Base64 Data URL
 */
async function readPdfAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
}

export const BillUploadBox: React.FC<BillUploadBoxProps> = ({
  value,
  onChange,
  accountNumber = '',
  onAccountNumberChange,
  sanctionedLoad = '',
  onSanctionedLoadChange,
  compact = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    setErrorMessage(null);

    // Validate type
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (!isImage && !isPdf) {
      setErrorMessage('Please upload an image (JPG, PNG) or PDF copy of your electricity bill.');
      return;
    }

    // Check size limit (max 10MB raw, will be compressed if image)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File is too large. Please select a file under 10MB.');
      return;
    }

    if (isPdf && file.size > 800 * 1024) {
      setErrorMessage('PDF exceeds 800 KB. Please upload a camera photo/screenshot of the bill for instant upload.');
      return;
    }

    setIsProcessing(true);

    try {
      let dataUrl = '';
      if (isImage) {
        dataUrl = await compressImageToDataUrl(file);
      } else {
        dataUrl = await readPdfAsDataUrl(file);
      }

      onChange({
        fileName: file.name,
        fileType: isImage ? 'image/jpeg' : 'application/pdf',
        fileSize: Math.round((dataUrl.length * 3) / 4), // Approximate bytes from base64
        fileData: dataUrl,
        accountNumber,
        sanctionedLoad,
      });
    } catch (err) {
      console.error('Error processing bill file:', err);
      setErrorMessage('Could not process this file. Please try taking a clear photo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isAccountNumberValid = accountNumber.trim().length === 10 && /^\d+$/.test(accountNumber.trim());

  return (
    <div className="space-y-3 bg-amber-50/40 border border-amber-200/80 rounded-2xl p-4 sm:p-5 transition-all">
      {/* Header with UPPCL Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-sm">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                Electricity Bill (UPPCL Bill)
              </h4>
              <span className="text-[10px] bg-amber-200 text-amber-900 font-extrabold px-2 py-0.5 rounded-full border border-amber-300">
                Purvanchal DISCOM
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Upload your bill photo or PDF to verify sanctioned load & account number.
            </p>
          </div>
        </div>

        {value && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Attached</span>
          </span>
        )}
      </div>

      {/* Upload Dropzone or Attached Preview */}
      {!value ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleFileInputChange}
            className="hidden"
            id="uppcl-bill-input"
          />

          <label
            htmlFor="uppcl-bill-input"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full flex flex-col items-center justify-center p-4 sm:p-5 border-2 border-dashed rounded-xl cursor-pointer transition-all text-center ${
              isDragging
                ? 'border-amber-500 bg-amber-100/60 scale-[0.99]'
                : 'border-amber-300 hover:border-amber-500 bg-white/80 hover:bg-white'
            }`}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center gap-2 py-2 text-amber-700">
                <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold">Processing bill image...</span>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-2 shadow-inner">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-800">
                  Click to Upload or Drag & Drop UPPCL Bill
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Supports Camera Photo, JPG, PNG or PDF (Max 10MB)
                </div>
              </>
            )}
          </label>
        </div>
      ) : (
        /* Attached Bill Details & Thumbnail */
        <div className="bg-white rounded-xl p-3.5 border border-amber-200 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            {value.fileType.startsWith('image/') ? (
              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                <img
                  src={value.fileData}
                  alt="Bill Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  title="View Full Image"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                <FileText className="w-6 h-6" />
              </div>
            )}

            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs">
                {value.fileName}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                <span>{(value.fileSize / 1024).toFixed(1)} KB</span>
                <span>•</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready for verification
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {value.fileType.startsWith('image/') && (
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                title="Preview Bill"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Remove File"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* UPPCL Consumer Account ID & Sanctioned Load Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
            UPPCL 10-Digit Account No. (खाता संख्या)
          </label>
          <div className="relative">
            <input
              type="text"
              maxLength={10}
              placeholder="e.g. 7218001234"
              value={accountNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                if (onAccountNumberChange) onAccountNumberChange(val);
                if (value) onChange({ ...value, accountNumber: val });
              }}
              className={`w-full px-3 py-2 rounded-xl border text-xs font-mono tracking-wider focus:outline-none focus:ring-2 ${
                isAccountNumberValid
                  ? 'border-emerald-500 bg-emerald-50/40 text-slate-900 focus:ring-emerald-500'
                  : 'border-slate-200 bg-white focus:ring-amber-500'
              }`}
            />
            {isAccountNumberValid && (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600 flex items-center gap-1 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                <CheckCircle2 className="w-3 h-3" /> Valid
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Printed on top-right of your UPPCL bill
          </span>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
            Sanctioned Load (स्वीकृत भार)
          </label>
          <select
            value={sanctionedLoad}
            onChange={(e) => {
              const val = e.target.value;
              if (onSanctionedLoadChange) onSanctionedLoadChange(val);
              if (value) onChange({ ...value, sanctionedLoad: val });
            }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Select Connected Load</option>
            <option value="1 kW">1 kW (Up to 1 kW Solar)</option>
            <option value="2 kW">2 kW (Up to 2 kW Solar)</option>
            <option value="3 kW">3 kW (Up to 3 kW Solar - Recommended)</option>
            <option value="4 kW">4 kW (Up to 4 kW Solar)</option>
            <option value="5 kW">5 kW (Up to 5 kW Solar)</option>
            <option value="7 kW">7 kW</option>
            <option value="10 kW+">10 kW+ (Commercial/Heavy)</option>
          </select>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Solar capacity cannot exceed your sanctioned load
          </span>
        </div>
      </div>

      {/* Full Resolution Bill Preview Modal */}
      {showPreviewModal && value && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-bold truncate max-w-md">{value.fileName}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 max-h-[75vh] overflow-auto flex items-center justify-center bg-slate-100">
              {value.fileType.startsWith('image/') ? (
                <img
                  src={value.fileData}
                  alt="Bill Full Preview"
                  className="max-w-full h-auto rounded-lg shadow"
                />
              ) : (
                <div className="p-8 text-center space-y-3">
                  <FileText className="w-16 h-16 text-rose-500 mx-auto" />
                  <p className="text-sm font-bold text-slate-800">PDF Document Attached</p>
                  <a
                    href={value.fileData}
                    download={value.fileName}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
                  >
                    Download PDF File
                  </a>
                </div>
              )}
            </div>
            <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center text-xs text-slate-600">
              <span>Account No: <strong>{accountNumber || 'Not provided'}</strong></span>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
