import { createAction } from 'redux-act'

import analytics, { updateLastActive } from 'src/analytics'
import { remoteFunction } from 'src/util/webextensionRPC'
import { actions as filterActs, selectors as filters } from '../search-filters'
import * as constants from './constants'
import * as selectors from './selectors'
import { fetchTooltip } from './components/tooltips'
import { acts as searchBarActs, selectors as searchBar } from './search-bar'

export const setLoading = createAction('overview/setLoading', a => a)
export const nextPage = createAction('overview/nextPage')
export const resetPage = createAction('overview/resetPage')
export const setSearchResult = createAction('overview/setSearchResult')
export const appendSearchResult = createAction('overview/appendSearchResult')
export const hideResultItem = createAction(
    'overview/hideResultItem',
    url => url,
)
export const changeHasBookmark = createAction('overview/changeHasBookmark')
export const resetActiveTagIndex = createAction('overview/resetActiveTagIndex')
export const setActiveTagIndex = createAction('overview/setActiveTagIndex')
export const addTag = createAction('overview/localAddTag', (tag, index) => ({
    tag,
    index,
}))
export const delTag = createAction('overview/localDelTag', (tag, index) => ({
    tag,
    index,
}))

export const setTooltip = createAction('overview/setTooltip', a => a)
export const toggleShowTooltip = createAction('overview/toggleShowTooltip')
export const setShowTooltip = createAction('overview/setShowTooltip')

const createBookmarkByUrl = remoteFunction('addBookmark')
const removeBookmarkByUrl = remoteFunction('delBookmark')
const processEvent = remoteFunction('processEvent')

// Egg
export const easter = () => dispatch =>
    dispatch(
        updateSearchResult({
            overwrite: true,
            searchResult: {
                resultsExhausted: true,
                totalCount: 1,
                docs: [
                    {
                        content: { title: constants.EGG_TITLE },
                        url: constants.EGG_URL,
                        screenshot: constants.EGG_IMG,
                        displayTime: Date.now().toString(),
                        hasBookmark: false,
                        tags: [],
                    },
                ],
            },
        }),
    )

// Analytics use
function trackSearch(searchResult, overwrite, state) {
    // Value should be set as # results (if non-default search)
    const value =
        overwrite && !searchBar.isEmptyQuery(state)
            ? searchResult.totalCount
            : undefined

    let action
    if (searchResult.totalCount > 0) {
        action = overwrite ? 'Successful search' : 'Paginate search'
    } else {
        action = 'Unsuccessful search'
    }
    if (filters.onlyBookmarks(state)) {
        action += ' (BM only)'
    }

    const name = overwrite
        ? selectors.queryParamsDisplay(state)
        : selectors.currentPageDisplay(state)

    analytics.trackEvent({ category: 'Search', action, name, value })
}

// Internal analytics store
function storeSearch(searchResult, overwrite, state) {
    let type

    if (searchResult.totalCount === 0) {
        type = 'unsuccessfulSearch'
    } else {
        type = overwrite ? 'successfulSearch' : 'paginateSearch'
    }

    processEvent({ type })

    if (filters.onlyBookmarks(state)) {
        processEvent({ type: 'bookmarkFilter' })
    }

    if (filters.tags(state).length > 0) {
        processEvent({ type: 'tagFilter' })
    }

    if (
        filters.domainsInc(state).length > 0 ||
        filters.domainsExc(state).length > 0
    ) {
        processEvent({ type: 'domainFilter' })
    }
}

export const updateSearchResult = ({ searchResult, overwrite = false }) => (
    dispatch,
    getState,
) => {
    trackSearch(searchResult, overwrite, getState())
    storeSearch(searchResult, overwrite, getState())

    const searchAction = overwrite ? setSearchResult : appendSearchResult

    dispatch(searchAction(searchResult))
    dispatch(setLoading(false))
}

/**
 * Increments the page state before scheduling another search.
 */
export const getMoreResults = () => dispatch => {
    dispatch(nextPage())
    dispatch(searchBarActs.search())
}

// Remove tags with no associated paged from filters
export const removeTagFromFilter = () => (dispatch, getState) => {
    const filterTags = filters.tags(getState()) || []
    if (!filterTags.length) {
        return
    }
    const pages = selectors.results(getState())
    const isOnPage = {}
    filterTags.forEach(tag => {
        isOnPage[tag] = false
    })

    pages.forEach(page => {
        filterTags.forEach(tag => {
            if (!isOnPage[tag]) {
                if (page.tags.indexOf(tag) > -1) {
                    isOnPage[tag] = true
                }
            }
        })
    })

    Object.entries(isOnPage).forEach(([key, value]) => {
        if (!value) {
            dispatch(filterActs.delTagFilter(key))
        }
    })
}

export const toggleBookmark = (url, index) => async (dispatch, getState) => {
    const results = selectors.results(getState())
    const { hasBookmark } = results[index]
    dispatch(changeHasBookmark(index)) // Reset UI state in case of error

    analytics.trackEvent({
        category: 'Overview',
        action: hasBookmark
            ? 'Remove result bookmark'
            : 'Create result bookmark',
    })

    processEvent({
        type: hasBookmark ? 'removeResultBookmark' : 'createResultBookmark',
    })

    // Reset UI state in case of error
    const errHandler = err => dispatch(changeHasBookmark(index))

    // Either perform adding or removal of bookmark; do not wait for ops to complete
    if (hasBookmark) {
        removeBookmarkByUrl({ url }).catch(errHandler)
    } else {
        createBookmarkByUrl({ url }).catch(errHandler)
    }

    updateLastActive() // Consider user active (analytics)
}

export const showTags = index => (dispatch, getState) => {
    const activeTagIndex = selectors.activeTagIndex(getState())

    if (activeTagIndex === index) {
        dispatch(resetActiveTagIndex())
    } else {
        dispatch(setActiveTagIndex(index))
    }
}

export const fetchNextTooltip = () => async dispatch => {
    const tooltip = await fetchTooltip()
    dispatch(setTooltip(tooltip))
}
