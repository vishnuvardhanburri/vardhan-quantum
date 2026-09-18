import React, { Component } from "react";
import BlogsView from "components/admin/CRUD/Blogs/view/BlogsView";
import actions from "actions/blogs/blogsFormActions";
import { connect } from "react-redux";

class BlogsPage extends Component {
  componentDidMount() {
    const { dispatch, match } = this.props;
    dispatch(actions.doFind(match.params.id));
  }

  render() {
    return (
      <React.Fragment>
        <BlogsView loading={this.props.loading} record={this.props.record} />
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

export default connect(mapStateToProps)(BlogsPage);
