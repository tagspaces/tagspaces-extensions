import { INode } from 'markmap-common';
import { IMarkmapOptions } from './types';
export declare const isMacintosh: boolean;
export declare const defaultColorFn: import("d3").ScaleOrdinal<string, string, never>;
export declare const lineWidthFactory: (baseWidth?: number, deltaWidth?: number, k?: number) => (node: INode) => number;
export declare const defaultOptions: IMarkmapOptions;
