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

import categoriesFields from "components/admin/CRUD/Categories/categoriesFields";
import IniValues from "components/admin/FormItems/iniValues";
import PreparedValues from "components/admin/FormItems/preparedValues";
import FormValidations from "components/admin/FormItems/formValidations";
import Widget from "components/admin/Widget";

class CategoriesForm extends Component {
  iniValues = () => {
    return IniValues(categoriesFields, this.props.record || {});
  };

  title = () => {
    if (this.props.isProfile) {
      return "Edit My Profile";
    }

    return this.props.isEditing ? "Edit сategories" : "Add сategories";
  };

  renderForm() {
    const { saveLoading } = this.props;

    return (
      <Widget title={<h4>{this.title()}</h4>} collapse close>
        <Formik
          onSubmit={null}
          initialValues={this.iniValues()}
          validationSchema={null}
          render={(form) => {
            return (
              <form onSubmit={null}>
                <InputFormItem
                  name={"title"}
                  schema={categoriesFields}
                  autoFocus
                />

                
                <InputFormItem name={"meta_description"} schema={categoriesFields} />

                <InputFormItem name={"keywords"} schema={categoriesFields} />

                <InputFormItem name={"meta_author"} schema={categoriesFields} />

                <InputFormItem name={"meta_og_title"} schema={categoriesFields} />

                <InputFormItem name={"meta_og_url"} schema={categoriesFields} />

                <InputFormItem name={"meta_og_image"} schema={categoriesFields} />

                <InputFormItem name={"meta_fb_id"} schema={categoriesFields} />

                <InputFormItem name={"meta_og_sitename"} schema={categoriesFields} />

                <InputFormItem name={"post_twitter"} schema={categoriesFields} />

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

export default CategoriesForm;
