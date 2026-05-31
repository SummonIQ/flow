import path from 'path';

// Dangerous patterns that should never be written to or deleted
const DANGEROUS_PATTERNS = [
  '.git',
  '.env',
  '.env.local',
  '.env.production',
  '.env.development',
  'node_modules',
  '.next',
  'dist',
  'build',
  '.turbo',
  '.cache',
  'package-lock.json',
  'bun.lockb',
  'yarn.lock',
  'pnpm-lock.yaml',
];

// Glob patterns that are too broad and dangerous
const DANGEROUS_GLOBS = ['*', '**', '**/*', '*.*', '.*', '../', '..\\'];

// Binary file extensions that should not be edited as text
const BINARY_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.bmp',
  '.ico',
  '.webp',
  '.svg',
  '.mp3',
  '.mp4',
  '.wav',
  '.ogg',
  '.webm',
  '.avi',
  '.mov',
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.zip',
  '.tar',
  '.gz',
  '.rar',
  '.7z',
  '.exe',
  '.dll',
  '.so',
  '.dylib',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.otf',
  '.db',
  '.sqlite',
  '.sqlite3',
];

export interface FileOperationResult {
  success: boolean;
  error?: string;
  path?: string;
}

export interface PathValidationResult {
  valid: boolean;
  error?: string;
  resolvedPath?: string;
}

/**
 * Validates that a path is safe and within the project root
 */
export function validatePath(
  projectRoot: string,
  relativePath: string,
): PathValidationResult {
  if (!projectRoot || !relativePath) {
    return { valid: false, error: 'Path is required' };
  }

  // Normalize paths
  const normalizedRoot = path.resolve(projectRoot);
  const fullPath = path.resolve(projectRoot, relativePath);

  // Check path traversal - ensure the resolved path starts with project root
  if (
    !fullPath.startsWith(normalizedRoot + path.sep) &&
    fullPath !== normalizedRoot
  ) {
    return { valid: false, error: 'Access denied: path outside project root' };
  }

  // Check for dangerous patterns in the path
  const pathParts = relativePath.split(path.sep);
  for (const part of pathParts) {
    if (DANGEROUS_PATTERNS.includes(part)) {
      return { valid: false, error: `Access denied: cannot modify ${part}` };
    }
  }

  // Check for dangerous globs
  for (const glob of DANGEROUS_GLOBS) {
    if (relativePath.includes(glob)) {
      return { valid: false, error: 'Access denied: dangerous glob pattern' };
    }
  }

  return { valid: true, resolvedPath: fullPath };
}

/**
 * Validates a file name for creation/rename
 */
export function validateFileName(name: string): {
  valid: boolean;
  error?: string;
} {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Name is required' };
  }

  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (invalidChars.test(name)) {
    return { valid: false, error: 'Name contains invalid characters' };
  }

  // Check for reserved names (Windows)
  const reservedNames = [
    'CON',
    'PRN',
    'AUX',
    'NUL',
    'COM1',
    'COM2',
    'COM3',
    'COM4',
    'COM5',
    'COM6',
    'COM7',
    'COM8',
    'COM9',
    'LPT1',
    'LPT2',
    'LPT3',
    'LPT4',
    'LPT5',
    'LPT6',
    'LPT7',
    'LPT8',
    'LPT9',
  ];
  if (reservedNames.includes(name.toUpperCase())) {
    return { valid: false, error: 'Name is reserved by the system' };
  }

  // Check for hidden files starting with .
  if (name.startsWith('.') && DANGEROUS_PATTERNS.includes(name)) {
    return { valid: false, error: `Cannot create ${name}` };
  }

  return { valid: true };
}

/**
 * Checks if a file is binary based on extension
 */
export function isBinaryFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return BINARY_EXTENSIONS.includes(ext);
}

/**
 * Gets a safe file type description for UI
 */
export function getFileType(
  filePath: string,
): 'text' | 'binary' | 'image' | 'unknown' {
  const ext = path.extname(filePath).toLowerCase();

  const imageExtensions = [
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.bmp',
    '.ico',
    '.webp',
    '.svg',
  ];
  if (imageExtensions.includes(ext)) {
    return 'image';
  }

  if (BINARY_EXTENSIONS.includes(ext)) {
    return 'binary';
  }

  const textExtensions = [
    '.txt',
    '.md',
    '.json',
    '.js',
    '.ts',
    '.jsx',
    '.tsx',
    '.css',
    '.scss',
    '.less',
    '.html',
    '.htm',
    '.xml',
    '.yaml',
    '.yml',
    '.toml',
    '.ini',
    '.cfg',
    '.conf',
    '.sh',
    '.bash',
    '.zsh',
    '.fish',
    '.ps1',
    '.bat',
    '.cmd',
    '.py',
    '.rb',
    '.php',
    '.java',
    '.c',
    '.cpp',
    '.h',
    '.hpp',
    '.cs',
    '.go',
    '.rs',
    '.sql',
    '.graphql',
    '.prisma',
    '.env.example',
    '.gitignore',
    '.dockerignore',
    'Dockerfile',
    'Makefile',
    'README',
    'LICENSE',
    'CHANGELOG',
  ];

  const fileName = path.basename(filePath);
  if (textExtensions.includes(ext) || textExtensions.includes(fileName)) {
    return 'text';
  }

  return 'unknown';
}

/**
 * Checks if an operation would affect a protected path
 */
export function isProtectedPath(relativePath: string): boolean {
  const pathParts = relativePath.split(path.sep);
  return pathParts.some(part => DANGEROUS_PATTERNS.includes(part));
}

/**
 * Gets a list of protected patterns for UI display
 */
export function getProtectedPatterns(): string[] {
  return [...DANGEROUS_PATTERNS];
}
