import React, { Component } from 'react';
import FeedbackForm from 'components/admin/CRUD/Feedback/form/FeedbackForm';
import { push } from 'connected-react-router';
import actions from 'redux/actions/feedback/feedbackFormActions';
import { connect } from 'react-redux';

class FeedbackFormPage extends Component {
  state = {
    dispatched: false,
  };

  componentDidMount() {
    const { dispatch, match } = this.props;
    if (this.isEditing()) {
      dispatch(actions.doFind(match.params.id));
    }
    else {
      if (this.isProfile()) {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const currentUserId = currentUser.user.id;
        dispatch(actions.doFind(currentUserId));
      }
      else {
        dispatch(actions.doNew());
      }
    }
    this.setState({ dispatched: true });
  }

  doSubmit = (id, data) => {
    const { dispatch } = this.props;
    if (this.isEditing() || this.isProfile()) {
      dispatch(actions.doUpdate(id, data, this.isProfile()));
    } else {
      dispatch(actions.doCreate(data));
    }
  };

  isEditing = () => {
    const { match } = this.props;
    return !!match.params.id;
  };

  isProfile = () => {
    const { match } = this.props;
    return match.url === '/app/profile';
  };

  render() {
    console.log(this.props.record);
    return (
      <React.Fragment>
          {this.state.dispatched && (
            <FeedbackForm
              saveLoading={this.props.saveLoading}
              findLoading={this.props.findLoading}
              currentUser={this.props.currentUser}
              record={
                (this.isEditing() || this.isProfile()) ? this.props.record : {}
              }
              isEditing={this.isEditing()}
              isProfile={this.isProfile()}
              onSubmit={this.doSubmit}
              onCancel={() => this.props.dispatch(push('/admin/feedback'))}
            />
          )}
      </React.Fragment>
    );
  }
}

function mapStateToProps(store) {
  return {
    findLoading: store.feedback.form.findLoading,
    saveLoading: store.feedback.form.saveLoading,
    record: store.feedback.form.record,
    currentUser: store.auth.currentUser,
  };
}

export default connect(mapStateToProps)(FeedbackFormPage);
