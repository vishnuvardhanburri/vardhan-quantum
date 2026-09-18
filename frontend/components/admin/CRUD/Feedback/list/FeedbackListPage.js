import React, { Component } from 'react';
import FeedbackListTable from 'components/CRUD/Feedback/list/FeedbackListTable';

class FeedbackListPage extends Component {
  render() {
    return (
    	<div>
          <FeedbackListTable />
      	</div>
    );
  }
}

export default FeedbackListPage;
