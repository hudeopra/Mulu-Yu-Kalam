'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, Sparkles, Code, Eye, Eraser } from 'lucide-react';

interface RichParagraphEditorProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  description?: string;
  placeholder?: string;
}

export function RichParagraphEditor({
  label,
  value,
  onChange,
  description,
  placeholder,
}: RichParagraphEditorProps) {
  const [showHtml, setShowHtml] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync value to contenteditable when changed externally (or on mount)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value, showHtml]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const applyFormat = (command: string, arg: string | undefined = undefined) => {
    if (showHtml) return;
    document.execCommand(command, false, arg);
    handleInput();
  };

  const applyStudioHighlight = () => {
    if (showHtml) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    const span = document.createElement('span');
    span.className = 'font-bold text-[#2e0249]';
    span.textContent = selectedText;

    range.deleteContents();
    range.insertNode(span);
    handleInput();
  };

  const applyOrangeHighlight = () => {
    if (showHtml) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    const span = document.createElement('span');
    span.className = 'font-bold text-[#ff7b01]';
    span.textContent = selectedText;

    range.deleteContents();
    range.insertNode(span);
    handleInput();
  };

  const handleClearFormatting = () => {
    if (showHtml) return;
    document.execCommand('removeFormat', false, undefined);
    handleInput();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#2e0249] uppercase tracking-wider">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowHtml(!showHtml)}
          className="text-[11px] font-semibold text-[#ff7b01] hover:text-[#d96700] flex items-center gap-1 transition-colors"
        >
          {showHtml ? (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Visual Editor</span>
            </>
          ) : (
            <>
              <Code className="w-3.5 h-3.5" />
              <span>HTML Source</span>
            </>
          )}
        </button>
      </div>

      {description && (
        <p className="text-[11px] text-gray-500">{description}</p>
      )}

      {/* Formatting Toolbar */}
      {!showHtml && (
        <div className="flex flex-wrap items-center gap-1 p-1.5 bg-[#faf7f2] border border-[#f0e8dc] rounded-xl">
          <button
            type="button"
            onClick={() => applyFormat('bold')}
            title="Bold"
            className="p-1.5 rounded-lg text-gray-700 hover:text-[#2e0249] hover:bg-white transition-colors"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('italic')}
            title="Italic"
            className="p-1.5 rounded-lg text-gray-700 hover:text-[#2e0249] hover:bg-white transition-colors"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('underline')}
            title="Underline"
            className="p-1.5 rounded-lg text-gray-700 hover:text-[#2e0249] hover:bg-white transition-colors"
          >
            <Underline className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-gray-300 mx-1" />

          {/* Studio Accent Color Spans */}
          <button
            type="button"
            onClick={applyStudioHighlight}
            title="Highlight with Studio Purple (#2e0249)"
            className="px-2 py-1 rounded-lg text-xs font-bold text-[#2e0249] bg-white border border-[#2e0249]/20 hover:border-[#2e0249] transition-all flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-[#2e0249]" />
            <span>Studio Purple</span>
          </button>

          <button
            type="button"
            onClick={applyOrangeHighlight}
            title="Highlight with Flame Orange (#ff7b01)"
            className="px-2 py-1 rounded-lg text-xs font-bold text-[#ff7b01] bg-white border border-[#ff7b01]/20 hover:border-[#ff7b01] transition-all flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-[#ff7b01]" />
            <span>Flame Orange</span>
          </button>

          <div className="w-[1px] h-4 bg-gray-300 mx-1" />

          <button
            type="button"
            onClick={handleClearFormatting}
            title="Clear Formatting"
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-white transition-colors"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Editor Body */}
      {showHtml ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={5}
          className="w-full p-4 font-mono text-xs bg-gray-900 text-gray-100 rounded-2xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff7b01] focus:border-transparent transition-all leading-relaxed"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          role="textbox"
          aria-multiline="true"
          data-placeholder={placeholder}
          className="w-full min-h-[120px] p-4 text-sm text-gray-800 bg-white rounded-2xl border border-[#f0e8dc] focus:outline-none focus:ring-2 focus:ring-[#ff7b01] focus:border-transparent transition-all leading-relaxed"
        />
      )}
    </div>
  );
}

