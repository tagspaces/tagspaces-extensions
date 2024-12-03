declare module '@tagspaces/tagspaces-common/AppConfig' {
  export const mediaProtocol: string;
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
}
