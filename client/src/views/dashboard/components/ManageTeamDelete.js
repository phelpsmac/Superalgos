import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { Mutation } from 'react-apollo'

import Button from '@material-ui/core/Button'
import DeleteIcon from '@material-ui/icons/Delete'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Typography from '@material-ui/core/Typography'

import DELETE_TEAM from '../../../graphql/teams/DeleteTeamMutation'
import GET_TEAMS_BY_OWNER from '../../../graphql/teams/GetTeamsByOwnerQuery'

import { checkGraphQLError } from '../../../utils/graphql-errors'

export class ManageTeamDelete extends Component {
  constructor (props) {
    super(props)

    this.handleClickOpen = this.handleClickOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)

    this.state = {
      open: false,
      motto: '',
      description: ''
    }
  }

  handleClickOpen () {
    this.setState({ open: true })
  }

  handleClose () {
    this.setState({ open: false })
  }

  handleChange (e) {
    this.setState({ name: e.target.value })
  }

  render () {
    console.log(this.props, this.props.slug)
    const authId = this.props.authId
    return (
      <Mutation
        mutation={DELETE_TEAM}
        refetchQueries={[
          {
            query: GET_TEAMS_BY_OWNER,
            variables: { authId }
          }
        ]}
        update={(cache, { data: { deleteTeam } }) => {
          const data = cache.readQuery({ query: GET_TEAMS_BY_OWNER })
          console.log('Mutation cache update: ', deleteTeam, data)
          data.getTeamsByOwner.push(deleteTeam)
          cache.writeQuery({ query: GET_TEAMS_BY_OWNER, data })
        }}
      >
        {(deleteTeam, { loading, error, data }) => {
          let errors
          let loader
          if (loading) {
            loader = <Typography variant='caption'>Submitting team...</Typography>
          }
          if (error) {
            errors = error.graphQLErrors.map(({ message }, i) => {
              const displayMessage = checkGraphQLError(message)
              console.log('createTeam error:', displayMessage)
              return (
                <Typography key={i} variant='caption'>
                  {message}
                </Typography>
              )
            })
          }
          return (
            <div>
              <Button size='small' color='primary' className={this.props.classes.buttonRight} onClick={this.handleClickOpen}>
                <DeleteIcon /> Delete
              </Button>
              <Dialog
                open={this.state.open}
                onClose={this.handleClose}
                aria-labelledby='form-dialog-title'
              >
                <DialogTitle id='form-dialog-title'>Delete Team Team</DialogTitle>
                <DialogContent>
                  <Typography variant='subheading' color='primary'>DANGER - Deleting your team cannot be undone</Typography>
                  <Typography variant='subheading'>Are you sure you want to delete this team?</Typography>
                  {loader}
                  {errors}
                </DialogContent>
                <DialogActions>
                  <Button onClick={this.handleClose} color='primary'>
                    Cancel
                  </Button>
                  <Button onClick={e => {
                    this.handleSubmit(e, deleteTeam, this.props.slug, authId)
                  }} color='primary'>
                    Delete Team
                  </Button>
                </DialogActions>
              </Dialog>
            </div>
          )
        }}
      </Mutation>
    )
  }

  async handleSubmit (e, deleteTeam, slug, authId) {
    e.preventDefault()
    await deleteTeam({ variables: { slug, owner: authId } })
  }
}

ManageTeamDelete.propTypes = {
  classes: PropTypes.object.isRequired,
  slug: PropTypes.string.isRequired,
  authId: PropTypes.string.isRequired
}

export default withRouter(ManageTeamDelete)
