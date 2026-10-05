'use client';

import React, { useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Link as LinkIcon,
  RotateCcw,
  RotateCw,
  RemoveFormatting,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your thoughts here...',
  minHeight = '300px',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingFromProps = useRef(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      isUpdatingFromProps.current = true;
      editorRef.current.innerHTML = value || '';
      isUpdatingFromProps.current = false;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current && !isUpdatingFromProps.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      editorRef.current.focus();
    }
  };

  const handleLink = () => {
    const url = window.prompt('Enter link URL (e.g., https://example.com):');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const formatBlock = (tag: string) => {
    executeCommand('formatBlock', `<${tag}>`);
  };

  return (
    <div className="border border-[var(--theme-border)] rounded-md overflow-hidden bg-[var(--theme-card)] focus-within:ring-1 focus-within:ring-[var(--theme-accent)]">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-[var(--theme-bg)] border-b border-[var(--theme-border)] text-sm">
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          title="Bold"
          className="p-1.5 rounded hover:bg-[var(--theme-card)] text-[var(--theme-text)] transition-colors cursor-pointer"
        >
          <Bold className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('italic')}
          title="Italic"
          className="p-1.5 rounded hover:bg-[var(--theme-card)] text-[var(--theme-text)] transition-colors cursor-pointer"
        >
          <Italic className="h-4 w-4" />
        </button>

        <div className="h-4 w-[1px] bg-[var(--theme-border)] mx-1" />

        <button
          type="button"
          onClick={() => formatBlock('h2')}
          title="Heading 2"
          className="p-1.5 rounded hover:bg-[var(--theme-card)] text-[var(--theme-text)] transition-colors cursor-pointer"
        >
          <Heading2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => formatBlock('h3')}
          title="Heading 3"
          className="p-1.5 rounded hover:bg-[var(--theme-card)] text-[var(--theme-text)] transition-colors cursor-pointer"
        >
          <Heading3 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => formatBlock('blockquote')}
          title="Blockquote"
          className="p-1.5 rounded hover:bg-[var(--theme-card)] text-[var(--theme-text)] transition-colors cursor-pointer"
        >
          <Quote className="h-4 w-4" />
        </button>

        <div className="h-4 w-[1px] bg-[var(--theme-border)] mx-1" />

        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          title="Bullet list"
          className="p-1.5 rounded hover:bg-[var(--theme-card)] text-[var(--theme-text)] transition-colors cursor-pointer"
        >
          <List className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('insertOrderedList')}
          title="Numbered list"
          className="p-1.5 rounded hover:bg-[var(--theme-card)] text-[var(--theme-text)] transition-colors cursor-pointer"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={handleLink}
          title="Add link"
          className="p-1.5 rounded hover:bg-[var(--theme-card)] text-[var(--theme-text)] transition-colors cursor-pointer"
        >
          <LinkIcon className="h-4 w-4" />
        </button>

        <div className="h-4 w-[1px] bg-[var(--theme-border)] mx-1" />

        <button
          type="button"
          onClick={() => executeCommand('removeFormat')}
          title="Clear formatting"
          className="p-1.5 rounded hover:bg-[var(--theme-card)] text-[var(--theme-secondary)] hover:text-[var(--theme-text)] transition-colors cursor-pointer"
        >
          <RemoveFormatting className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('undo')}
          title="Undo"
          className="p-1.5 rounded hover:bg-[var(--theme-card)] text-[var(--theme-secondary)] hover:text-[var(--theme-text)] transition-colors cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('redo')}
          title="Redo"
          className="p-1.5 rounded hover:bg-[var(--theme-card)] text-[var(--theme-secondary)] hover:text-[var(--theme-text)] transition-colors cursor-pointer"
        >
          <RotateCw className="h-4 w-4" />
        </button>
      </div>

      {/* Editable Content Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        style={{ minHeight }}
        data-placeholder={placeholder}
        className="editorial-prose p-4 focus:outline-none overflow-y-auto max-h-[600px]"
      />
    </div>
  );
}
