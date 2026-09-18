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
import s from './ProductsView.module.scss';

import CategoriesAutocompleteFormItem from "../../categories/autocomplete/CategoriesAutocompleteFormItem";

import ProductsAutocompleteFormItem from "../autocomplete/ProductsAutocompleteFormItem";

class ProductsForm extends Component {
  iniValues = () => {
    return IniValues(productsFields, this.props.record || {});
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
      <Widget className={s.root} title={<h4>{this.title()}</h4>} collapse close>
        <Formik
          onSubmit={null}
          initialValues={this.iniValues()}
          validationSchema={null}
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

                
                <InputFormItem name={"meta_description"} schema={productsFields} />

                <InputFormItem name={"keywords"} schema={productsFields} />

                <InputFormItem name={"meta_author"} schema={productsFields} />

                <InputFormItem name={"meta_og_title"} schema={productsFields} />

                <InputFormItem name={"meta_og_url"} schema={productsFields} />

                <InputFormItem name={"meta_og_image"} schema={productsFields} />

                <InputFormItem name={"meta_fb_id"} schema={productsFields} />

                <InputFormItem name={"meta_og_sitename"} schema={productsFields} />

                <InputFormItem name={"post_twitter"} schema={productsFields} />

                <InputNumberFormItem name={"rating"} schema={productsFields} />

                <RadioFormItem name={"status"} schema={productsFields} />

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

export default ProductsForm;
