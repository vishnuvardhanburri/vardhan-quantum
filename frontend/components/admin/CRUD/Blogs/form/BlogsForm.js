import { Formik } from "formik";
import React, { Component } from "react";
import Loader from "components/admin/Loader";

import InputFormItem from "components/admin/FormItems/items/InputFormItem";
import InputNumberFormItem from "components/admin/FormItems/items/InputNumberFormItem";
import SwitchFormItem from "components/admin/FormItems/items/SwitchFormItem";
import RadioFormItem from "components/admin/FormItems/items/RadioFormItem";
import SelectFormItem from "components/admin/FormItems/items/SelectFormItem";
import DatePickerFormItem from "components/admin/FormItems/items/DatePickerFormItem";
import ImagesFormItem from "components/admin/FormItems/items/ImagesFormItem";
import FilesFormItem from "components/admin/FormItems/items/FilesFormItem";
import TextAreaFormItem from "components/admin/FormItems/items/TextAreaFormItem";

import blogsFields from "components/admin/CRUD/Blogs/blogsFields";
import IniValues from "components/admin/FormItems/iniValues";
import PreparedValues from "components/admin/FormItems/preparedValues";
import FormValidations from "components/admin/FormItems/formValidations";
import Widget from "components/admin/Widget";

import CategoriesAutocompleteFormItem from "components/admin/CRUD/Categories/autocomplete/CategoriesAutocompleteFormItem";

import BlogsAutocompleteFormItem from "components/admin/CRUD/Blogs/autocomplete/BlogsAutocompleteFormItem";

class BlogsForm extends Component {
  iniValues = () => {
    return IniValues(blogsFields, this.props.record || {});
  };

  formValidations = () => {
    return FormValidations(blogsFields, this.props.record || {});
  };

  handleSubmit = (values) => {
    const { id, ...data } = PreparedValues(blogsFields, values || {});
    this.props.onSubmit(id, data);
  };

  title = () => {
    if (this.props.isProfile) {
      return "Edit My Profile";
    }

    return this.props.isEditing ? "Edit blogs" : "Add blogs";
  };

  renderForm() {
    const { saveLoading } = this.props;

    return (
      <Widget title={<h4>{this.title()}</h4>} collapse close>
        <Formik
          onSubmit={this.handleSubmit}
          initialValues={this.iniValues()}
          validationSchema={this.formValidations()}
          render={(form) => {
            return (
              <form onSubmit={form.handleSubmit}>
                <ImagesFormItem
                  name={"image"}
                  schema={blogsFields}
                  path={"blogs/image"}
                  fileProps={{
                    size: undefined,
                    formats: undefined,
                  }}
                  max={undefined}
                />

                <InputFormItem name={"title"} schema={blogsFields} />

                <InputFormItem name={"price"} schema={blogsFields} />

                <InputFormItem name={"discount"} schema={blogsFields} />

                <TextAreaFormItem
                  name={"description"}
                  schema={blogsFields}
                />

                <CategoriesAutocompleteFormItem
                  name={"categories"}
                  schema={blogsFields}
                  showCreate={!this.props.modal}
                  mode="multiple"
                />

                <BlogsAutocompleteFormItem
                  name={"more_blogs"}
                  schema={blogsFields}
                  showCreate={!this.props.modal}
                  mode="multiple"
                />

                <InputNumberFormItem name={"rating"} schema={blogsFields} />

                <RadioFormItem name={"status"} schema={blogsFields} />

                <div className="form-buttons">
                  <button
                    className="btn btn-primary"
                    disabled={saveLoading}
                    type="button"
                    onClick={form.handleSubmit}
                  >
                    Save
                  </button>{" "}
                  <button
                    className="btn btn-light"
                    type="button"
                    disabled={saveLoading}
                    onClick={form.handleReset}
                  >
                    Reset
                  </button>{" "}
                  <button
                    className="btn btn-light"
                    type="button"
                    disabled={saveLoading}
                    onClick={() => this.props.onCancel()}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            );
          }}
        />
      </Widget>
    );
  }

  render() {
    const { isEditing, findLoading, record } = this.props;

    if (findLoading) {
      return <Loader />;
    }

    if (isEditing && !record) {
      return <Loader />;
    }

    return this.renderForm();
  }
}

export default BlogsForm;
