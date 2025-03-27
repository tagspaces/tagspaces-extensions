import type * as d3 from 'd3';
import { Hook, INode, IPureNode } from 'markmap-common';
import { ID3SVGElement, IMarkmapOptions, IMarkmapState, IPadding } from './types';
export declare const globalCSS: string;
/**
 * A global hook to refresh all markmaps when called.
 */
export declare const refreshHook: Hook<[]>;
export declare class Markmap {
    options: {
        autoFit: boolean;
        duration: number;
        embedGlobalCSS: boolean;
        fitRatio: number;
        id?: string;
        initialExpandLevel: number;
        maxInitialScale: number;
        pan: boolean;
        scrollForPan: boolean;
        style?: (id: string) => string;
        toggleRecursively: boolean;
        zoom: boolean;
        color: (node: INode) => string;
        lineWidth: (node: INode) => number;
        maxWidth: number;
        nodeMinHeight: number;
        paddingX: number;
        spacingHorizontal: number;
        spacingVertical: number;
    };
    state: IMarkmapState;
    svg: ID3SVGElement;
    styleNode: d3.Selection<HTMLStyleElement, INode, HTMLElement, INode>;
    g: d3.Selection<SVGGElement, INode, HTMLElement, INode>;
    zoom: d3.ZoomBehavior<SVGElement, INode>;
    private _observer;
    private _disposeList;
    constructor(svg: string | SVGElement | ID3SVGElement, opts?: Partial<IMarkmapOptions>);
    getStyleContent(): string;
    updateStyle(): void;
    handleZoom: (e: any) => void;
    handlePan: (e: WheelEvent) => void;
    toggleNode(data: INode, recursive?: boolean): Promise<void>;
    handleClick: (e: MouseEvent, d: INode) => void;
    private _initializeData;
    private _relayout;
    setOptions(opts?: Partial<IMarkmapOptions>): void;
    setData(data?: IPureNode | null, opts?: Partial<IMarkmapOptions>): Promise<void>;
    setHighlight(node?: INode | null): Promise<void>;
    private _getHighlightRect;
    renderData(originData?: INode): Promise<void>;
    transition<T extends d3.BaseType, U, P extends d3.BaseType, Q>(sel: d3.Selection<T, U, P, Q>): d3.Transition<T, U, P, Q>;
    /**
     * Fit the content to the viewport.
     */
    fit(maxScale?: number): Promise<void>;
    findElement(node: INode): {
        data: INode;
        g: SVGGElement;
    } | undefined;
    /**
     * Pan the content to make the provided node visible in the viewport.
     */
    ensureVisible(node: INode, padding?: Partial<IPadding>): Promise<void>;
    /** @deprecated Use `ensureVisible` instead */
    ensureView: (node: INode, padding?: Partial<IPadding>) => Promise<void>;
    centerNode(node: INode, padding?: Partial<IPadding>): Promise<void>;
    /**
     * Scale content with it pinned at the center of the viewport.
     */
    rescale(scale: number): Promise<void>;
    destroy(): void;
    static create(svg: string | SVGElement | ID3SVGElement, opts?: Partial<IMarkmapOptions>, data?: IPureNode | null): Markmap;
}
