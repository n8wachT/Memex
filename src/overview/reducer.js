import update from 'lodash/fp/update'
import remove from 'lodash/fp/remove'
import { createReducer } from 'redux-act'

import * as actions from './actions'

const defaultState = {
    currentPage: 0, // Pagination state
    searchResult: {
        docs: [], // The current search result list
        resultsExhausted: false,
        totalCount: null,
    },
    isLoading: true,
    activeTagIndex: -1,
    tooltip: null,
    showTooltip: true,
}

function hideResultItem(state, url) {
    return update('searchResult.docs', docs =>
        remove(doc => doc.url === url)(docs),
    )(state)
}

const addTag = (state, { tag, index }) => {
    const doc = state.searchResult.docs[index]
    const docs = [
        ...state.searchResult.docs.slice(0, index),
        {
            ...doc,
            tags: [...doc.tags, tag],
        },
        ...state.searchResult.docs.slice(index + 1),
    ]

    return {
        ...state,
        searchResult: {
            ...state.searchResult,
            docs,
        },
    }
}

const delTag = (state, { tag, index }) => {
    const doc = state.searchResult.docs[index]
    const removalIndex = doc.tags.findIndex(val => val === tag)
    if (removalIndex === -1) {
        return state
    }

    const docs = [
        ...state.searchResult.docs.slice(0, index),
        {
            ...doc,
            tags: [
                ...doc.tags.slice(0, removalIndex),
                ...doc.tags.slice(removalIndex + 1),
            ],
        },
        ...state.searchResult.docs.slice(index + 1),
    ]

    return {
        ...state,
        searchResult: {
            ...state.searchResult,
            docs,
        },
    }
}

// Updates search result state by either overwriting or appending
const handleSearchResult = ({ overwrite }) => (state, newSearchResult) => {
    const searchResult = overwrite
        ? newSearchResult
        : {
              ...newSearchResult,
              docs: [...state.searchResult.docs, ...newSearchResult.docs],
          }

    return { ...state, searchResult }
}

const changeHasBookmark = (state, index) => {
    const currResult = state.searchResult.docs[index]

    const searchResult = {
        ...state.searchResult,
        docs: [
            ...state.searchResult.docs.slice(0, index),
            {
                ...currResult,
                hasBookmark: !currResult.hasBookmark,
            },
            ...state.searchResult.docs.slice(index + 1),
        ],
    }

    return { ...state, searchResult }
}

const payloadReducer = key => (state, payload) => ({ ...state, [key]: payload })

export default createReducer(
    {
        [actions.appendSearchResult]: handleSearchResult({ overwrite: false }),
        [actions.setSearchResult]: handleSearchResult({ overwrite: true }),
        [actions.setLoading]: (state, isLoading) => ({ ...state, isLoading }),
        [actions.hideResultItem]: hideResultItem,
        [actions.changeHasBookmark]: changeHasBookmark,
        [actions.nextPage]: state => ({
            ...state,
            currentPage: state.currentPage + 1,
        }),
        [actions.resetPage]: state => ({
            ...state,
            currentPage: defaultState.currentPage,
        }),
        [actions.resetActiveTagIndex]: state => ({
            ...state,
            activeTagIndex: defaultState.activeTagIndex,
        }),
        [actions.setActiveTagIndex]: payloadReducer('activeTagIndex'),
        [actions.addTag]: addTag,
        [actions.delTag]: delTag,
        [actions.setTooltip]: (state, tooltip) => ({
            ...state,
            tooltip: tooltip,
        }),
        [actions.toggleShowTooltip]: state => ({
            ...state,
            showTooltip: !state.showTooltip,
        }),
        [actions.setShowTooltip]: (state, showTooltip) => ({
            ...state,
            showTooltip: showTooltip,
        }),
    },
    defaultState,
)
