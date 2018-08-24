import { createSelector } from 'reselect'

import { selectors as deleteConfSelectors } from './delete-confirm-modal'
import {
    selectors as searchBar,
    constants as searchBarConsts,
} from './search-bar'
import * as constants from './constants'

/**
 * Either set display title to be the top-level title field, else look in content. Fallback is the URL.
 * @param {any} pageDoc The augmented page doc from search results.
 * @returns {string} Title string to display from page title, or URL in case of bad data..
 */
function decideTitle(pageDoc) {
    if (pageDoc.title) return pageDoc.title

    return pageDoc.content && pageDoc.content.title
        ? pageDoc.content.title
        : pageDoc.url
}

export const overview = state => state.overview
const searchResult = createSelector(overview, state => state.searchResult)
const resultDocs = createSelector(searchResult, results => results.docs)

export const queryParamsDisplay = createSelector(
    searchBar.query,
    searchBar.startDate,
    searchBar.endDate,
    (query, startDate, endDate) => {
        let val = ''

        if (query && query.length) {
            val += 'T'
        }

        if (startDate) {
            val += ' SD'
        }

        if (endDate) {
            val += ' ED'
        }

        return val
    },
)

export const isLoading = createSelector(overview, state => state.isLoading)
export const noResults = createSelector(
    resultDocs,
    isLoading,
    (docs, isLoading) => docs.length === 0 && !isLoading,
)
export const currentPage = createSelector(overview, state => state.currentPage)

export const currentPageDisplay = createSelector(
    currentPage,
    page => `Page: ${page}`,
)

export const resultsSkip = createSelector(
    currentPage,
    page => page * searchBarConsts.PAGE_SIZE,
)

export const activeTagIndex = createSelector(
    overview,
    state => state.activeTagIndex,
)

export const results = createSelector(
    resultDocs,
    deleteConfSelectors.isShown,
    deleteConfSelectors.indexToDelete,
    activeTagIndex,
    (docs, modalShown, deleting, tagIndex) =>
        docs.map((pageDoc, i) => ({
            ...pageDoc,
            title: decideTitle(pageDoc),
            isDeleting: !modalShown && i === deleting,
            tagPillsData: pageDoc.tags.slice(0, constants.SHOWN_TAGS_LIMIT),
            shouldDisplayTagPopup: i === tagIndex,
        })),
)

export const showInitSearchMsg = createSelector(
    searchBar.searchCount,
    resultDocs,
    isLoading,
    (searchCount, results, isLoading) =>
        !results.length && !searchCount && !isLoading,
)

export const isMigrationRequired = createSelector(
    searchResult,
    results => !!results.requiresMigration,
)

export const isBadTerm = createSelector(
    searchResult,
    results => !!results.isBadTerm,
)

export const isInvalidSearch = createSelector(
    searchResult,
    results => !!results.isInvalidSearch,
)

const resultsExhausted = createSelector(
    searchResult,
    results => results.resultsExhausted,
)

export const totalResultCount = createSelector(
    searchResult,
    results => results.totalCount,
)

export const shouldShowCount = createSelector(
    totalResultCount,
    isLoading,
    (count, isLoading) => count != null && !isLoading,
)

export const needsPagWaypoint = createSelector(
    resultsExhausted,
    isLoading,
    (isExhausted, isLoading) => !isLoading && !isExhausted,
)

export const isNewSearchLoading = createSelector(
    isLoading,
    currentPage,
    (isLoading, currentPage) => isLoading && currentPage === 0,
)

export const tooltip = state => overview(state).tooltip

export const showTooltip = state => overview(state).showTooltip

export const isFirstTooltip = createSelector(
    tooltip,
    showTooltip,
    (tooltip, showTooltip) => tooltip === null && showTooltip,
)

export const isTooltipRenderable = createSelector(
    tooltip,
    showTooltip,
    (tooltip, showTooltip) => tooltip !== null && showTooltip,
)
