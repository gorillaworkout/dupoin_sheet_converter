export interface ParsedFile {
  fileName: string;
  fileHandle: FileSystemFileHandle | null;
  sheets: ParsedSheet[];
}

export interface ParsedSheet {
  name: string;
  headers: string[];
  rows: string[][];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
