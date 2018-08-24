import React, {
    PureComponent,
    ReactNode,
    MouseEventHandler,
    DragEventHandler,
} from 'react'
import classNames from 'classnames'

import { LoadingIndicator } from '../../common-ui/components'
import niceTime from '../../util/nice-time'
import SemiCircularRibbon from './SemiCircularRibbon'

const styles = require('./PageResultItem.css')

export interface Props {
    nullImg?: string

    favIcon: string
    screenshot: string
    displayTime: number
    url: string
    title: string
    hasBookmark: boolean
    isDeleting: boolean
    isListFilterActive: boolean
    isSidebarOpen: boolean
    tagPills: ReactNode[]
    tagManager: ReactNode
    setTagButtonRef: () => void
    hideSearchFilters: () => void
    resetUrlDragged: () => void
    setUrlDragged: (url: string) => void
    onCommentBtnClick: MouseEventHandler
    onTrashBtnClick: MouseEventHandler
    handleCrossRibbonClick: MouseEventHandler
    onToggleBookmarkClick: MouseEventHandler
    onTagBtnClick: MouseEventHandler
}

class PageResultItem extends PureComponent<Props> {
    static defaultProps = {
        nullImg: '/img/null-icon.png',
    }

    get bookmarkClass() {
        return classNames(styles.button, {
            [styles.bookmark]: this.props.hasBookmark,
            [styles.notBookmark]: !this.props.hasBookmark,
        })
    }

    dragStart: DragEventHandler = e => {
        const { url, setUrlDragged } = this.props

        setUrlDragged(url)
        const crt = document.getElementById('dragged-element')
        crt.style.display = 'block'

        e.dataTransfer.setData('text/plain', url)

        e.dataTransfer.setDragImage(crt, 10, 10)
        if (this.props.isSidebarOpen) {
            this.props.hideSearchFilters()
        }
    }

    render() {
        return (
            <li
                className={classNames({
                    [styles.isDeleting]: this.props.isDeleting,
                })}
            >
                {this.props.isDeleting && (
                    <LoadingIndicator className={styles.deletingSpinner} />
                )}
                <div className={styles.rootContainer}>
                    <a
                        onDragStart={this.dragStart}
                        onDragEnd={this.props.resetUrlDragged}
                        className={styles.root}
                        href={this.props.url}
                        target="_blank"
                        draggable
                    >
                        <div className={styles.screenshotContainer}>
                            <img
                                className={styles.screenshot}
                                src={
                                    this.props.screenshot == null
                                        ? this.props.nullImg
                                        : this.props.screenshot
                                }
                            />
                        </div>
                        <div className={styles.descriptionContainer}>
                            <div
                                className={styles.title}
                                title={this.props.title}
                            >
                                {this.props.favIcon && (
                                    <img
                                        className={styles.favIcon}
                                        src={this.props.favIcon}
                                    />
                                )}
                                {this.props.title}
                            </div>
                            <div className={styles.url}>{this.props.url}</div>
                            <div className={styles.time}>
                                <div className={styles.displayTime}>
                                    {' '}
                                    {niceTime(this.props.displayTime)}{' '}
                                </div>
                                <span className={styles.tagList}>
                                    {this.props.tagPills}
                                </span>
                                <div
                                    className={styles.buttonsContainer}
                                    onClick={e => e.preventDefault()}
                                >
                                    <button
                                        className={classNames(
                                            styles.button,
                                            styles.tag,
                                        )}
                                        onClick={this.props.onTagBtnClick}
                                        ref={this.props.setTagButtonRef}
                                    />
                                    <button
                                        className={classNames(
                                            styles.button,
                                            styles.comment,
                                        )}
                                        onClick={this.props.onCommentBtnClick}
                                    />
                                    <button
                                        disabled={this.props.isDeleting}
                                        className={classNames(
                                            styles.button,
                                            styles.trash,
                                        )}
                                        onClick={this.props.onTrashBtnClick}
                                    />
                                    <button
                                        disabled={this.props.isDeleting}
                                        className={this.bookmarkClass}
                                        onClick={
                                            this.props.onToggleBookmarkClick
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </a>
                    <div className={styles.crossRibbon}>
                        {this.props.isListFilterActive && (
                            <SemiCircularRibbon
                                onClick={this.props.handleCrossRibbonClick}
                            />
                        )}
                    </div>
                </div>
                {this.props.tagManager}
            </li>
        )
    }
}

export default PageResultItem
