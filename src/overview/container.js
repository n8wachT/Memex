import React, { Component } from 'react'
import { Link } from 'react-router'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Waypoint from 'react-waypoint'
import reduce from 'lodash/fp/reduce'

import { Wrapper, LoadingIndicator } from 'src/common-ui/components'
import { IndexDropdown, MigrationNotice } from 'src/common-ui/containers'
import * as actions from './actions'
import * as selectors from './selectors'
import * as constants from './constants'
import ResultList from './components/ResultList'
import NotificationContainer, { selectors as notifs } from '../notifications'
import Overview from './components/Overview'
import PageResultItem from './components/PageResultItem'
import ResultsMessage from './components/ResultsMessage'
import TagPill from './components/TagPill'
import Onboarding, { selectors as onboarding } from './onboarding'
import Sidebar, {
    selectors as sidebarSels,
    actions as sidebarActs,
} from './sidebar'
import { selectors as filters, actions as filterActs } from '../search-filters'
import { acts as searchBarActs } from './search-bar'
import NoResultBadTerm from './components/NoResultBadTerm'
import localStyles from './components/Overview.css'
import { actions as listActs } from '../custom-lists'
import { acts as deleteConfActs } from './delete-confirm-modal'
import { actions as sidebarLeftActs } from './sidebar-left'
import * as sidebar from './sidebar-left/selectors'

class OverviewContainer extends Component {
    static propTypes = {
        onBottomReached: PropTypes.func.isRequired,
        isMigrationRequired: PropTypes.bool.isRequired,
        isLoading: PropTypes.bool.isRequired,
        isNewSearchLoading: PropTypes.bool.isRequired,
        noResults: PropTypes.bool.isRequired,
        isBadTerm: PropTypes.bool.isRequired,
        isInvalidSearch: PropTypes.bool.isRequired,
        showInitSearchMsg: PropTypes.bool.isRequired,
        resetActiveTagIndex: PropTypes.func.isRequired,
        searchResults: PropTypes.arrayOf(PropTypes.object).isRequired,
        totalResultCount: PropTypes.number,
        shouldShowCount: PropTypes.bool.isRequired,
        needsWaypoint: PropTypes.bool.isRequired,
        handleTrashBtnClick: PropTypes.func.isRequired,
        handleToggleBm: PropTypes.func.isRequired,
        handleTagBtnClick: PropTypes.func.isRequired,
        handleCommentBtnClick: PropTypes.func.isRequired,
        handlePillClick: PropTypes.func.isRequired,
        addTag: PropTypes.func.isRequired,
        delTag: PropTypes.func.isRequired,
        showOnboarding: PropTypes.bool.isRequired,
        mouseOnSidebar: PropTypes.bool.isRequired,
        init: PropTypes.func.isRequired,
        isListFilterActive: PropTypes.bool.isRequired,
        handleCrossRibbonClick: PropTypes.func.isRequired,
        setUrlDragged: PropTypes.func.isRequired,
        mouseOverSidebar: PropTypes.bool.isRequired,
        hideSearchFilters: PropTypes.func.isRequired,
        resetUrlDragged: PropTypes.func.isRequired,
        isSidebarOpen: PropTypes.bool.isRequired,
        showInbox: PropTypes.bool.isRequired,
    }

    componentDidMount() {
        document.addEventListener('click', this.handleOutsideClick, false)
        this.inputQueryEl.focus()
        this.props.init()
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleOutsideClick, false)
    }

    get scrollDisabled() {
        return (
            this.props.showOnboarding ||
            this.props.mouseOverSidebar ||
            this.props.mouseOnSidebar
        )
    }

    dropdownRefs = []
    tagBtnRefs = []

    setInputRef = el => (this.inputQueryEl = el)
    setTagDivRef = el => (this.tagDiv = el)
    setTagButtonRef = el => this.tagBtnRefs.push(el)
    trackDropwdownRef = el => this.dropdownRefs.push(el)

    renderTagsManager = ({ shouldDisplayTagPopup, url, tags }, index) =>
        shouldDisplayTagPopup ? (
            <IndexDropdown
                url={url}
                onFilterAdd={this.props.addTag(index)}
                onFilterDel={this.props.delTag(index)}
                setTagDivRef={this.setTagDivRef}
                initFilters={tags}
                source="tag"
                hover
            />
        ) : null

    renderTagPills({ tagPillsData, tags }, resultIndex) {
        const pills = tagPillsData.map((tag, i) => (
            <TagPill
                key={i}
                value={tag}
                onClick={this.props.handlePillClick(tag)}
            />
        ))

        // Add on dummy pill with '+' sign if over limit
        if (tags.length > constants.SHOWN_TAGS_LIMIT) {
            return [
                ...pills,
                <TagPill
                    key="+"
                    setRef={this.trackDropwdownRef}
                    value={`+${tags.length - constants.SHOWN_TAGS_LIMIT}`}
                    onClick={this.props.handleTagBtnClick(resultIndex)}
                    noBg
                />,
            ]
        }

        return pills
    }
    renderResultItems() {
        if (this.props.isNewSearchLoading) {
            return <LoadingIndicator />
        }

        const resultItems = this.props.searchResults.map((doc, i) => (
            <PageResultItem
                key={i}
                index={i}
                scrollDisabled={this.scrollDisabled}
                onTrashBtnClick={this.props.handleTrashBtnClick(doc, i)}
                onToggleBookmarkClick={this.props.handleToggleBm(doc, i)}
                tagManager={this.renderTagsManager(doc, i)}
                setTagButtonRef={this.setTagButtonRef}
                onTagBtnClick={this.props.handleTagBtnClick(i)}
                onCommentBtnClick={this.props.handleCommentBtnClick(doc)}
                tagPills={this.renderTagPills(doc, i)}
                isListFilterActive={this.props.isListFilterActive}
                handleCrossRibbonClick={this.props.handleCrossRibbonClick(doc)}
                setUrlDragged={this.props.setUrlDragged}
                resetUrlDragged={this.props.resetUrlDragged}
                hideSearchFilters={this.props.hideSearchFilters}
                isSidebarOpen={this.props.isSidebarOpen}
                {...doc}
            />
        ))

        // Insert waypoint at the end of results to trigger loading new items when
        // scrolling down
        if (this.props.needsWaypoint) {
            resultItems.push(
                <Waypoint
                    onEnter={this.props.onBottomReached}
                    key="waypoint"
                />,
            )
        }

        // Add loading spinner to the list end, if loading
        if (this.props.isLoading) {
            resultItems.push(<LoadingIndicator key="loading" />)
        }

        return resultItems
    }

    renderInitMessage = () => (
        <ResultsMessage>
            <div className={localStyles.title}>
                You didn't visit or{' '}
                <Link style={{ color: '#777' }} to="/import">
                    import
                </Link>
                <br /> <p className={localStyles.subTitle}>any websites yet.</p>
            </div>
            <div>
                <Link
                    className={localStyles.choiceBtn}
                    type="button"
                    to="/import"
                >
                    Import History & Bookmarks
                </Link>
            </div>
        </ResultsMessage>
    )

    renderResults() {
        if (this.props.showInbox) {
            return <NotificationContainer />
        }

        if (this.props.isMigrationRequired) {
            return (
                <ResultsMessage>
                    <MigrationNotice />
                </ResultsMessage>
            )
        }

        if (this.props.isBadTerm) {
            return (
                <ResultsMessage>
                    <NoResultBadTerm>
                        Search terms are too common, or have been filtered out
                        to increase performance.
                    </NoResultBadTerm>
                </ResultsMessage>
            )
        }

        if (this.props.isInvalidSearch) {
            return (
                <ResultsMessage>
                    <NoResultBadTerm title="Invalid search query">
                        You can't exclude terms without including at least 1
                        term to search
                    </NoResultBadTerm>
                </ResultsMessage>
            )
        }

        if (this.props.showInitSearchMsg) {
            return this.renderInitMessage()
        }

        if (this.props.noResults) {
            return (
                <ResultsMessage>
                    <NoResultBadTerm>
                        found for this query. ¯\_(ツ)_/¯
                    </NoResultBadTerm>
                </ResultsMessage>
            )
        }

        // No issues; render out results list view
        return (
            <Wrapper>
                {this.props.shouldShowCount && (
                    <ResultsMessage small>
                        Found <strong>{this.props.totalResultCount}</strong>{' '}
                        results in your digital memory
                    </ResultsMessage>
                )}
                <ResultList scrollDisabled={this.scrollDisabled}>
                    {this.renderResultItems()}
                </ResultList>
            </Wrapper>
        )
    }

    handleOutsideClick = event => {
        // Reduces to `true` if any on input elements were clicked
        const wereAnyClicked = reduce((res, el) => {
            const isEqual = el != null ? el.isEqualNode(event.target) : false
            return res || isEqual
        }, false)

        const clickedTagDiv =
            this.tagDiv != null && this.tagDiv.contains(event.target)

        if (
            !clickedTagDiv &&
            !wereAnyClicked(this.tagBtnRefs) &&
            !wereAnyClicked(this.dropdownRefs)
        ) {
            this.props.resetActiveTagIndex()
        }
    }

    renderDragElement() {
        return (
            <div
                id="dragged-element"
                className={localStyles.dragElement}
                href="#"
            >
                {' '}
                + Add to Collection
            </div>
        )
    }

    render() {
        return (
            <Wrapper>
                <Overview
                    setInputRef={this.setInputRef}
                    dragElement={this.renderDragElement()}
                >
                    {this.renderResults()}
                </Overview>
                <Sidebar />
                <Onboarding />
            </Wrapper>
        )
    }
}

const mapStateToProps = state => ({
    isLoading: selectors.isLoading(state),
    isNewSearchLoading: selectors.isNewSearchLoading(state),
    isMigrationRequired: selectors.isMigrationRequired(state),
    noResults: selectors.noResults(state),
    isBadTerm: selectors.isBadTerm(state),
    isInvalidSearch: selectors.isInvalidSearch(state),
    searchResults: selectors.results(state),
    needsWaypoint: selectors.needsPagWaypoint(state),
    showFilters: filters.showFilters(state),
    showInitSearchMsg: selectors.showInitSearchMsg(state),
    totalResultCount: selectors.totalResultCount(state),
    shouldShowCount: selectors.shouldShowCount(state),
    showOnboarding: onboarding.isVisible(state),
    showTooltip: selectors.showTooltip(state),
    tooltip: selectors.tooltip(state),
    isFirstTooltip: selectors.isFirstTooltip(state),
    isTooltipRenderable: selectors.isTooltipRenderable(state),
    mouseOnSidebar: sidebarSels.mouseOnSidebar(state),
    isListFilterActive: filters.listFilterActive(state),
    mouseOverSidebar: sidebar.mouseOverSidebar(state),
    isSidebarOpen: sidebar.isSidebarOpen(state),
    showInbox: notifs.showInbox(state),
})

const mapDispatchToProps = dispatch => ({
    ...bindActionCreators(
        {
            hideSearchFilters: sidebarLeftActs.openSidebarListMode,
            onBottomReached: actions.getMoreResults,
            deleteDocs: actions.deleteDocs,
            resetActiveTagIndex: actions.resetActiveTagIndex,
            onShowFilterChange: filterActs.showFilter,
            fetchNextTooltip: actions.fetchNextTooltip,
            setUrlDragged: listActs.setUrlDragged,
            resetUrlDragged: listActs.resetUrlDragged,
            init: searchBarActs.init,
        },
        dispatch,
    ),
    handleTrashBtnClick: ({ url }, index) => event => {
        event.preventDefault()
        dispatch(deleteConfActs.show(url, index))
    },
    handleToggleBm: ({ url }, index) => event => {
        event.preventDefault()
        dispatch(actions.toggleBookmark(url, index))
    },
    handleTagBtnClick: index => event => {
        event.preventDefault()
        dispatch(actions.showTags(index))
    },
    handlePillClick: tag => event => {
        event.preventDefault()
        dispatch(filterActs.toggleTagFilter(tag))
    },
    handleCommentBtnClick: ({ url, title }) => event => {
        event.preventDefault()
        dispatch(sidebarActs.openSidebar(url, title))
    },
    addTag: resultIndex => tag => dispatch(actions.addTag(tag, resultIndex)),
    delTag: resultIndex => tag => dispatch(actions.delTag(tag, resultIndex)),
    toggleShowTooltip: event => dispatch(actions.toggleShowTooltip()),
    handleCrossRibbonClick: ({ url }) => event => {
        dispatch(listActs.delPageFromList(url))
        dispatch(actions.hideResultItem(url))
    },
})

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(OverviewContainer)
