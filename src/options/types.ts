import { ThunkAction } from 'redux-thunk'

import { State as DeleteConfModalState } from '../overview/delete-confirm-modal/reducer'
import { State as SearchBarState } from '../overview/search-bar/reducer'

export interface RootState {
    deleteConfModal: DeleteConfModalState
    searchBar: SearchBarState
}

export type Thunk<R = void> = ThunkAction<R, RootState, void, any>
