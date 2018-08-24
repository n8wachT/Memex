import { createSelector } from 'reselect'

import { RootState } from '../../options/types'
import { selectors as filterSelectors } from '../../search-filters'

const searchBar = (state: RootState) => state.searchBar

export const query = createSelector(searchBar, state => state.query)
export const endDate = createSelector(searchBar, state => state.endDate)
export const startDate = createSelector(searchBar, state => state.startDate)
export const searchCount = createSelector(searchBar, state => state.searchCount)

export const isEmptyQuery = createSelector(
    query,
    startDate,
    endDate,
    filterSelectors.onlyBookmarks,
    filterSelectors.tags,
    filterSelectors.displayDomains,
    (
        q,
        startDateVal,
        endDateVal,
        showOnlyBookmarks,
        filterTags,
        filterDomains,
    ) =>
        !q.length &&
        !startDateVal &&
        !endDateVal &&
        !showOnlyBookmarks &&
        !filterTags.length &&
        !filterDomains.length,
)
