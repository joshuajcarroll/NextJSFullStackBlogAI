// src/components/TinyMCEEditor.tsx
'use client'; // This component MUST be a client component

import React from 'react';
import { Editor } from '@tinymce/tinymce-react'; // Import the Editor component

interface TinyMCEEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly: boolean;
}

const TinyMCEEditor = ({ value, onChange, readOnly }: TinyMCEEditorProps) => {
  // IMPORTANT: Get your TinyMCE API Key
  // 1. Go to https://www.tiny.cloud/signup/ and create a free account.
  // 2. You'll get an API key. Replace 'YOUR_TINYMCE_API_KEY' with your actual key.
  //    For security, ideally store this in an environment variable (e.g., NEXT_PUBLIC_TINYMCE_API_KEY)
  const tinymceApiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || 'YOUR_TINYMCE_API_KEY'; // Replace with your key

  // Basic configuration for TinyMCE
  const editorConfig = {
    height: 500,
    menubar: false,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | blocks | ' +
             'bold italic forecolor | alignleft aligncenter ' +
             'alignright alignjustify | bullist numlist outdent indent | ' +
             'removeformat | link image media code | fullscreen help',
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
    // Disable editing if readOnly is true
    // readonly: readOnly, // Removed due to type incompatibility
  };

  return (
    <Editor
      apiKey={tinymceApiKey}
      init={editorConfig}
      value={value}
      onEditorChange={(newValue) => {
        onChange(newValue);
      }}
      disabled={readOnly} // TinyMCE uses 'disabled' for UI interaction, 'readonly' for core editor behavior
    />
  );
};

export default TinyMCEEditor;