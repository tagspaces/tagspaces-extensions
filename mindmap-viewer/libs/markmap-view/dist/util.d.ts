import { IMarkmapJSONOptions, IMarkmapOptions } from './types';
export declare function deriveOptions(jsonOptions?: Partial<IMarkmapJSONOptions>): Partial<IMarkmapOptions>;
/**
 * Credit: https://gist.github.com/jlevy/c246006675becc446360a798e2b2d781?permalink_comment_id=4738050#gistcomment-4738050
 */
export declare function simpleHash(str: string): string;
export declare function childSelector<T extends Element>(filter?: string | ((el: T) => boolean)): () => T[];
