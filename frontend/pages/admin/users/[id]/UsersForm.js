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

import usersFields from "components/admin/CRUD/Users/usersFields";
import IniValues from "components/admin/FormItems/iniValues";
import PreparedValues from "components/admin/FormItems/preparedValues";
import FormValidations from "components/admin/FormItems/formValidations";
import Widget from "components/admin/Widget";
import s from './UsersForm.module.scss';
import ProductsAutocompleteFormItem from "components/admin/CRUD/Products/autocomplete/ProductsAutocompleteFormItem";

class UsersForm extends Component {
  iniValues = () => {
    return IniValues(usersFields, this.props.record || {});
  };

  title = () => {
    if (this.props.isProfile) {
      return "Edit My Profile";
    }

    return this.props.isEditing ? "Edit users" : "Add users";
  };

  renderForm() {
    const { saveLoading } = this.props;

    return (
      <Widget className={s.root} title={<h4>{this.title()}</h4>} collapse close>
        <Formik
          onSubmit={null}
          initialValues={this.iniValues()}
          validationSchema={null}
          render={(form) => {
            return (
              <form onSubmit={form.handleSubmit}>
                <ProductsAutocompleteFormItem
                  name={"wishlist"}
                  schema={usersFields}
                  showCreate={!this.props.modal}
                  mode="multiple"
                />

                <InputFormItem name={"firstName"} schema={usersFields} />

                <InputFormItem name={"lastName"} schema={usersFields} />

                <InputFormItem name={"phoneNumber"} schema={usersFields} />

                <InputFormItem name={"email"} schema={usersFields} />

                <RadioFormItem name={"role"} schema={usersFields} />

                <SwitchFormItem name={"disabled"} schema={usersFields} />

                <ImagesFormItem
                  name={"avatar"}
                  schema={usersFields}
                  path={"users/avatar"}
                  fileProps={{
                    size: undefined,
                    formats: undefined,
                  }}
                  max={undefined}
                />

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

export async function getServerSideProps(context) {
    // const res = await axios.get("/products");
    // const products = res.data.rows;

    return {
        props: {  }, // will be passed to the page component as props
    };
}

export default UsersForm;
