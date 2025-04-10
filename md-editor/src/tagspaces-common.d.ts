declare module '@tagspaces/tagspaces-common/AppConfig' {
  const AppConfig: any; // Replace `any` with a more specific type if available.
  export default AppConfig;
}
declare module '@tagspaces/tagspaces-common/paths' {
  export function extractContainingDirectoryPath(
    dirPath: string,
    dirSeparator?: string,
  ): string;
}
