import { ITransformer, ITransformHooks, ITransformPlugin } from '../types';
export declare function createTransformHooks(transformer: ITransformer): ITransformHooks;
/**
 * This function is only used to help type checking.
 */
export declare function definePlugin(plugin: ITransformPlugin): ITransformPlugin;
