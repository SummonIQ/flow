'use client';

// Plate.js editor plugins configuration
// Define the plugins that should be enabled in the editor
export const editorPlugins = [
  // Basic block types
  {
    key: 'p',
    type: 'element',
    isElement: true,
  },
  {
    key: 'h1',
    type: 'element',
    isElement: true,
  },
  {
    key: 'h2',
    type: 'element',
    isElement: true,
  },
  {
    key: 'h3',
    type: 'element',
    isElement: true,
  },
  {
    key: 'h4',
    type: 'element',
    isElement: true,
  },
  {
    key: 'h5',
    type: 'element',
    isElement: true,
  },
  {
    key: 'h6',
    type: 'element',
    isElement: true,
  },
  {
    key: 'blockquote',
    type: 'element',
    isElement: true,
  },
  {
    key: 'ul',
    type: 'element',
    isElement: true,
  },
  {
    key: 'ol',
    type: 'element',
    isElement: true,
  },
  {
    key: 'li',
    type: 'element',
    isElement: true,
  },
  {
    key: 'a',
    type: 'element',
    isElement: true,
  },
  // Text marks
  {
    key: 'bold',
    type: 'mark',
    isLeaf: true,
  },
  {
    key: 'italic',
    type: 'mark',
    isLeaf: true,
  },
  {
    key: 'underline',
    type: 'mark',
    isLeaf: true,
  },
  {
    key: 'strikethrough',
    type: 'mark',
    isLeaf: true,
  },
  {
    key: 'code',
    type: 'mark',
    isLeaf: true,
  },
];
