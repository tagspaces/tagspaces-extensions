declare module '@tagspaces/tagspaces-common/AppConfig' {
  export const mediaProtocol: string;
  export const isWeb: boolean;
  export const dirSeparator: string;
}

declare module '@tagspaces/tagspaces-common/paths' {
  export function extractFileName(
    filePath: string,
    dirSeparator?: string
  ): string;
  export function getThumbFileLocationForFile(
    entryPath: string,
    dirSeparator?: string,
    encoded?: boolean
  ): string;
  export function getMetaFileLocationForFile(
    filePath: string,
    dirSeparator?: string
  ): string;
  export function getMetaFileLocationForDir(
    dirPath: string,
    dirSeparator?: string
  ): string;
  export function extractContainingDirectoryPath(
    dirPath: string,
    dirSeparator?: string
  ): string;
  export function getMetaDirectoryPath(
    dirPath: string,
    dirSeparator?: string
  ): string;
}
