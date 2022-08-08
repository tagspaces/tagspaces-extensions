type Action = { type: 'show' } | { type: 'hide' };
export type Dispatch = (action: Action) => void;
export type State = { hide: boolean };

export function hideReducer(state: State, action: Action) {
    switch (action.type) {
        case 'show': {
            return {hide: false}
        }
        case 'hide': {
            return {hide: true}
        }
        default: {
            throw new Error(`Unhandled action type:`)
        }
    }
}