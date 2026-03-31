/**
 * FileUpload.jsx
 * Drag-and-drop file upload with text fallback
 */

import React, { useCallback, useRef, useState } from 'react';

const ACCEPT = '.pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain';

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

export default function FileUpload({ label, sublabel, value, onChange, showTextFallback = false }) {
  const [dragging, setDragging] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [textValue, setTextValue] = useState('');
  const inputRef = useRef(null);

  const handleFile = useCallback((file) => {
    if (!file) return;
    onChange({ file, text: null });
  }, [onChange]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleTextSave = () => {
    if (textValue.trim()) {
      onChange({ file: null, text: textValue.trim() });
    }
  };

  const clear = () => {
    onChange({ file: null, text: null });
    setTextValue('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const hasValue = value?.file || value?.text;

  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="flex items-center justify-between">
        <div>
          <p className="section-label mb-0.5">{label}</p>
          {sublabel && <p className="text-xs text-slate-500">{sublabel}</p>}
        </div>
        {showTextFallback && !hasValue && (
          <button
            type="button"
            onClick={() => setTextMode(!textMode)}
            className="text-xs text-ink-400 hover:text-ink-300 transition-colors underline underline-offset-2"
          >
            {textMode ? 'Upload file instead' : 'Paste text instead'}
          </button>
        )}
      </div>

      {/* Uploaded state */}
      {hasValue && (
        <div className="flex items-center gap-3 p-3 bg-ink-500/10 border border-ink-500/30 rounded-xl">
          <div className="text-ink-400"><FileIcon /></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">
              {value.file ? value.file.name : 'Pasted text'}
            </p>
            <p className="text-xs text-slate-500">
              {value.file
                ? `${(value.file.size / 1024).toFixed(1)} KB`
                : `${value.text.length} characters`}
            </p>
          </div>
          <button onClick={clear} className="text-slate-500 hover:text-red-400 transition-colors p-1">
            <TrashIcon />
          </button>
        </div>
      )}

      {/* Text paste mode */}
      {!hasValue && textMode && (
        <div className="space-y-2">
          <textarea
            value={textValue}
            onChange={e => setTextValue(e.target.value)}
            placeholder={label.includes('JD') || label.includes('Job') ? 'Paste the full job description here…' : 'Paste your resume text here…'}
            className="w-full h-36 bg-slate-900/80 border border-slate-700/60 rounded-xl px-4 py-3
                       text-sm text-slate-200 placeholder-slate-600 resize-none font-mono
                       focus:outline-none focus:border-ink-500/60 transition-colors"
          />
          <button
            type="button"
            onClick={handleTextSave}
            disabled={!textValue.trim()}
            className="btn-primary text-sm py-2 px-4"
          >
            Use this text
          </button>
        </div>
      )}

      {/* Drop zone */}
      {!hasValue && !textMode && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-2 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200
            ${dragging
              ? 'border-ink-400 bg-ink-500/10 scale-[1.01]'
              : 'border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/40'
            }`}
        >
          <div className={`transition-colors ${dragging ? 'text-ink-400' : 'text-slate-600'}`}>
            <UploadIcon />
          </div>
          <p className="text-sm text-slate-400">
            <span className="text-ink-400 font-medium">Click to upload</span> or drag & drop
          </p>
          <p className="text-xs text-slate-600">PDF, DOCX, or TXT — up to 10 MB</p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={e => handleFile(e.target.files[0])}
          />
        </div>
      )}
    </div>
  );
}
