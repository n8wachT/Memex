import React from 'react'
import PropTypes from 'prop-types'

import { Wrapper } from 'src/common-ui/components'
import { DeleteConfirmModal } from '../delete-confirm-modal'
import styles from './Overview.css'
import Head from 'src/options/containers/Head'
import {
    SidebarContainer as Sidebar,
    SidebarIconsContainer as SidebarIcons,
} from '../sidebar-left'
import { Header } from '../search-bar'

const Overview = props => (
    <Wrapper>
        <Head />
        <Header setInputRef={props.setInputRef} />
        <SidebarIcons />
        <Sidebar />
        <div className={styles.main}>{props.children}</div>
        <DeleteConfirmModal />
        {props.dragElement}
    </Wrapper>
)

Overview.propTypes = {
    children: PropTypes.node.isRequired,
    dragElement: PropTypes.node.isRequired,
    setInputRef: PropTypes.func.isRequired,
}

export default Overview
