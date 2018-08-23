import React from 'react'
import PropTypes from 'prop-types'

import { Wrapper } from 'src/common-ui/components'
import { DeleteConfirmModal } from '../delete-confirm-modal'
import Header from './Header'
import styles from './Overview.css'
import Head from 'src/options/containers/Head'
import SideBar from '../sidebar-left/container'

const Overview = props => (
    <Wrapper>
        <Head />
        <Header {...props} />

        {props.sidebarIcons}
        <SideBar />

        <div className={styles.main}>{props.children}</div>
        <DeleteConfirmModal />
        {props.renderDragElement}
    </Wrapper>
)

Overview.propTypes = {
    children: PropTypes.node.isRequired,
    renderDragElement: PropTypes.node.isRequired,
    sidebarIcons: PropTypes.node,
}

export default Overview
