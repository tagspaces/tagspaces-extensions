import type MarkdownIt from 'markdown-it';
import { CSSItem, JSItem, UrlBuilder } from 'markmap-common';
import { IHtmlParserOptions } from 'markmap-html-parser';
import { IAssets, IFeatures, ITransformHooks, ITransformPlugin, ITransformResult, ITransformer } from './types';
export declare const builtInPlugins: ITransformPlugin[];
export declare class Transformer implements ITransformer {
    hooks: ITransformHooks;
    md: MarkdownIt;
    assetsMap: Record<string, IAssets>;
    urlBuilder: UrlBuilder;
    plugins: ITransformPlugin[];
    constructor(plugins?: Array<ITransformPlugin | (() => ITransformPlugin)>);
    transform(content: string, fallbackParserOptions?: Partial<IHtmlParserOptions>): ITransformResult;
    resolveJS(item: JSItem): JSItem;
    resolveCSS(item: CSSItem): CSSItem;
    /**
     * Get all assets from enabled plugins or filter them by plugin names as keys.
     */
    getAssets(keys?: string[]): IAssets;
    /**
     * Get used assets by features object returned by `transform`.
     */
    getUsedAssets(features: IFeatures): IAssets;
}
