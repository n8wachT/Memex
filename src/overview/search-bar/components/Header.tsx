import React, {
    PureComponent,
    ReactEventHandler,
    KeyboardEventHandler,
} from 'react'
import { Link } from 'react-router'

import { OutLink } from '../../../common-ui/containers'
import InboxButton from '../../../notifications/components/InboxButton'
import { OVERVIEW_URL } from '../../../popup/constants'
import DateRangeSelection from './DateRangeSelection'

const styles = require('./Header.css')

export interface Props {
    searchPlaceholder?: string
    pricingUrl?: string
    settingsIconUrl?: string
    settingsRoute?: string
    isSearchDisabled: boolean
    showUnreadCount: boolean
    showInbox: boolean
    unreadNotifCount: number
    startDate: number
    endDate: number
    query: string
    toggleInbox: () => void
    setInputRef: (el: HTMLInputElement) => void
    onStartDateChange: (date: number) => void
    onEndDateChange: (date: number) => void
    onQueryKeyDown: KeyboardEventHandler<HTMLInputElement>
    onQueryChange: ReactEventHandler<HTMLInputElement>
}

class Header extends PureComponent<Props> {
    static defaultProps = {
        searchPlaceholder: 'Search your memory; use # to filter by tag',
        pricingUrl: 'https://worldbrain.io/pricing',
        settingsIconUrl: '/img/settings-icon.png',
        settingsRoute: '/settings',
    }

    render() {
        return (
            <div className={styles.navbar}>
                <a href={OVERVIEW_URL}>
                    <div className={styles.logo} />
                </a>
                <div className={styles.container}>
                    <div className={styles.searchField}>
                        <input
                            className={styles.query}
                            onChange={this.props.onQueryChange}
                            placeholder={this.props.searchPlaceholder}
                            value={this.props.query}
                            ref={this.props.setInputRef}
                            onKeyDown={this.props.onQueryKeyDown}
                            disabled={this.props.isSearchDisabled}
                        />
                        <DateRangeSelection
                            startDate={this.props.startDate}
                            endDate={this.props.endDate}
                            onStartDateChange={this.props.onStartDateChange}
                            onEndDateChange={this.props.onEndDateChange}
                            disabled={this.props.isSearchDisabled}
                        />
                    </div>
                </div>
                <div className={styles.links}>
                    <InboxButton
                        toggleInbox={this.props.toggleInbox}
                        showInbox={this.props.showInbox}
                        unreadNotifCount={this.props.unreadNotifCount}
                        showUnreadCount={this.props.showUnreadCount}
                    />
                    <OutLink
                        className={styles.upgrade}
                        to={this.props.pricingUrl}
                    >
                        Upgrade Memex
                    </OutLink>
                    <Link to={this.props.settingsRoute}>
                        <img
                            src={this.props.settingsIconUrl}
                            className={styles.icon}
                        />
                    </Link>
                </div>
            </div>
        )
    }
}

export default Header
