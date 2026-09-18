import React, { Component } from "react";
import Loader from "components/admin/Loader";
import TextViewItem from "components/admin/FormItems/items/TextViewItem";
import ImagesViewItem from "components/admin/FormItems/items/ImagesViewItem";
import Widget from "components/admin/Widget";

class BlogsView extends Component {
  renderView() {
    const { record } = this.props;

    return (
      <Widget title={<h4>{"View User"}</h4>} collapse close>
        <ImagesViewItem label={"Avatar"} value={record.avatar} />

        <TextViewItem label={"First name"} value={record.firstName} />

        <TextViewItem label={"Last Name"} value={record.lastName} />

        <TextViewItem label={"Phone number"} value={record.phoneNumber} />

        <TextViewItem label={"Email"} value={record.email} />

        <TextViewItem label={"Disabled"} value={record.disabled} />
      </Widget>
    );
  }

  render() {
    const { record, loading } = this.props;

    if (loading || !record) {
      return <Loader />;
    }

    return this.renderView();
  }
}

export default BlogsView;
