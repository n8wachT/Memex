import React from 'react'
import PropTypes from 'prop-types'

import { Wrapper } from 'src/common-ui/components'
import { DeleteConfirmModal } from '../delete-confirm-modal'
import styles from './Overview.css'
import Head from 'src/options/containers/Head'
import SideBar from '../sidebar-left/container'
import { Header } from '../search-bar'

const Overview = props => (
    <Wrapper>
        <Head />
        <Header setInputRef={props.setInputRef} />
        {props.sidebarIcons}
        <SideBar />
        <div className={styles.main}>{props.children}</div>
        <DeleteConfirmModal />
        {props.dragElement}
    </Wrapper>
)

Overview.propTypes = {
    children: PropTypes.node.isRequired,
    dragElement: PropTypes.node.isRequired,
    sidebarIcons: PropTypes.node,
    setInputRef: PropTypes.func.isRequired,
}

export default Overview
