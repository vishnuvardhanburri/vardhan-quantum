import React, { Component } from 'react';
import FeedbackView from 'components/CRUD/Feedback/view/FeedbackView';
import actions from 'actions/feedback/feedbackFormActions';
import { connect } from 'react-redux';

class FeedbackPage extends Component {
  componentDidMount() {
    const { dispatch, match } = this.props;
    dispatch(actions.doFind(match.params.id));
  }

  render() {
    return (
      <React.Fragment>
          <FeedbackView
            loading={this.props.loading}
            record={this.props.record}
          />
      </React.Fragment>
    );
  }
}

function mapStateToProps(store) {
  return {
    loading: store.users.form.loading,
    record: store.users.form.record,
  };
}

export default connect(mapStateToProps)(FeedbackPage);
