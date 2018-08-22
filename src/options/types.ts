import { ThunkAction } from 'redux-thunk'

import { State as DeleteConfModalState } from '../overview/delete-confirm-modal/reducer'

export interface RootState {
    deleteConfModal: DeleteConfModalState
}

export type Thunk<R = void> = ThunkAction<R, RootState, void, any>
