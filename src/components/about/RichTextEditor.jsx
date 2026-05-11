import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Heading2, Heading3, List } from 'lucide-react';

export default function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, []); // only on mount

  const exec = (command, val = null) => {
    editorRef.current.focus();
    document.execCommand(command, false, val);
    onChange(editorRef.current.innerHTML);
  };

  const handleInput = () => {
    onChange(editorRef.current.innerHTML);
  };

  const toolbarBtn = (onClick, icon, title) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className="w-8 h-8 flex items-center justify-center rounded-lg hover:opacity-80 transition-opacity"
      style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-primary)' }}
    >
      {icon}
    </button>
  );

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
      {/* Toolbar */}
      <div className="flex gap-1.5 p-2 border-b" style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}>
        {toolbarBtn(() => exec('formatBlock', 'h2'), <Heading2 className="w-4 h-4" />, 'Overskrift 1')}
        {toolbarBtn(() => exec('formatBlock', 'h3'), <Heading3 className="w-4 h-4" />, 'Overskrift 2')}
        {toolbarBtn(() => exec('bold'), <Bold className="w-4 h-4" />, 'Fed')}
        {toolbarBtn(() => exec('italic'), <Italic className="w-4 h-4" />, 'Kursiv')}
        {toolbarBtn(() => exec('insertUnorderedList'), <List className="w-4 h-4" />, 'Liste')}
        {toolbarBtn(() => exec('formatBlock', 'p'), <span className="text-xs font-medium">¶</span>, 'Normal tekst')}
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className="min-h-[120px] p-3 text-sm leading-relaxed outline-none"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          color: 'var(--color-text-secondary)',
        }}
      />

      <style>{`
        [contenteditable] h2 { font-size: 1.1rem; font-weight: 700; margin: 0.5rem 0 0.25rem; color: var(--color-text-primary); }
        [contenteditable] h3 { font-size: 0.95rem; font-weight: 600; margin: 0.4rem 0 0.2rem; color: var(--color-text-primary); }
        [contenteditable] b, [contenteditable] strong { font-weight: 700; color: var(--color-text-primary); }
        [contenteditable] i, [contenteditable] em { font-style: italic; }
        [contenteditable] ul { list-style: disc; padding-left: 1.25rem; margin: 0.25rem 0; }
        [contenteditable] p { margin: 0.25rem 0; }
      `}</style>
    </div>
  );
}