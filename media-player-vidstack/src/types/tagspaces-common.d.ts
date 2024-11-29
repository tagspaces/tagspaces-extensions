/*declare module '@tagspaces/tagspaces-common' {
  export const AppConfig: any;
  export const misc: any;
  export const paths: any;
  export const utilsIo: any;
}*/

declare module '@tagspaces/tagspaces-common/paths' {
  export function extractFileName(
    filePath: string,
    dirSeparator?: string,
  ): string;
  export function getThumbFileLocationForFile(
    entryPath: string,
    dirSeparator?: string,
    encoded?: boolean,
  ): string;
  //const paths: any; // Use `any` or refine if you know the structure
  //export default paths;
}
