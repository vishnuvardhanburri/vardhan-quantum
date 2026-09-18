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

import productsFields from "components/admin/CRUD/Products/productsFields";
import IniValues from "components/admin/FormItems/iniValues";
import PreparedValues from "components/admin/FormItems/preparedValues";
import FormValidations from "components/admin/FormItems/formValidations";
import Widget from "components/admin/Widget";

import CategoriesAutocompleteFormItem from "components/admin/CRUD/Categories/autocomplete/CategoriesAutocompleteFormItem";

import ProductsAutocompleteFormItem from "components/admin/CRUD/Products/autocomplete/ProductsAutocompleteFormItem";

class ProductsForm extends Component {
  iniValues = () => {
    return IniValues(productsFields, this.props.record || {});
  };

  formValidations = () => {
    return FormValidations(productsFields, this.props.record || {});
  };

  handleSubmit = (values) => {
    const { id, ...data } = PreparedValues(productsFields, values || {});
    this.props.onSubmit(id, data);
  };

  title = () => {
    if (this.props.isProfile) {
      return "Edit My Profile";
    }

    return this.props.isEditing ? "Edit products" : "Add products";
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
                  schema={productsFields}
                  path={"products/image"}
                  fileProps={{
                    size: undefined,
                    formats: undefined,
                  }}
                  max={undefined}
                />

                <InputFormItem name={"title"} schema={productsFields} />

                <InputFormItem name={"price"} schema={productsFields} />

                <InputFormItem name={"discount"} schema={productsFields} />

                <TextAreaFormItem
                  name={"description"}
                  schema={productsFields}
                />

                <CategoriesAutocompleteFormItem
                  name={"categories"}
                  schema={productsFields}
                  showCreate={!this.props.modal}
                  mode="multiple"
                />

                <ProductsAutocompleteFormItem
                  name={"more_products"}
                  schema={productsFields}
                  showCreate={!this.props.modal}
                  mode="multiple"
                />

                <InputNumberFormItem name={"rating"} schema={productsFields} />

                <RadioFormItem name={"status"} schema={productsFields} />

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

export default ProductsForm;
