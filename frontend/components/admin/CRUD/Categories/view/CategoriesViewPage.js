import React, { Component } from "react";
import CategoriesView from "components/admin/CRUD/Categories/view/CategoriesView";
import actions from "actions/categories/categoriesFormActions";
import { connect } from "react-redux";

class CategoriesPage extends Component {
  componentDidMount() {
    const { dispatch, match } = this.props;
    dispatch(actions.doFind(match.params.id));
  }

  render() {
    return (
      <React.Fragment>
        <CategoriesView
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

export default connect(mapStateToProps)(CategoriesPage);
