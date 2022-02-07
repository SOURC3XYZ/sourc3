import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import js from 'react-syntax-highlighter/dist/esm/languages/prism/js-templates';
import ts from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';

export const syntax = [
  {
    ext: 'cpp',
    data: cpp
  },
  {
    ext: 'js',
    data: js
  },
  {
    ext: 'jsx',
    data: jsx
  },
  {
    ext: 'ts',
    data: ts
  },
  {
    ext: 'tsx',
    data: tsx
  },
  {
    ext: 'json',
    data: json
  },
  {
    ext: 'css',
    data: css
  }
];
