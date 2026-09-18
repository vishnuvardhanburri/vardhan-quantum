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

import CategoriesAutocompleteFormItem from "../../../categories/autocomplete/CategoriesAutocompleteFormItem";

import BlogsAutocompleteFormItem from "../../autocomplete/BlogsAutocompleteFormItem";

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
                  name={"hero_image"}
                  schema={blogsFields}
                  path={"blogs/image"}
                  fileProps={{
                    size: undefined,
                    formats: undefined,
                  }}
                  max={undefined}
                />

                <ImagesFormItem
                  name={"blog_image_one"}
                  schema={blogsFields}
                  path={"blogs/image"}
                  fileProps={{
                    size: undefined,
                    formats: undefined,
                  }}
                  max={undefined}
                />

                <ImagesFormItem
                  name={"blog_image_two"}
                  schema={blogsFields}
                  path={"blogs/image"}
                  fileProps={{
                    size: undefined,
                    formats: undefined,
                  }}
                  max={undefined}
                />

                <ImagesFormItem
                  name={"blog_image_three"}
                  schema={blogsFields}
                  path={"blogs/image"}
                  fileProps={{
                    size: undefined,
                    formats: undefined,
                  }}
                  max={undefined}
                />

                <ImagesFormItem
                  name={"author_avatar"}
                  schema={blogsFields}
                  path={"blogs/image"}
                  fileProps={{
                    size: undefined,
                    formats: undefined,
                  }}
                  max={undefined}
                />

                <InputFormItem name={"title"} schema={blogsFields} />

                <InputFormItem name={"author_name"} schema={blogsFields} />

                <TextAreaFormItem
                  name={"epigraph"}
                  schema={blogsFields}
                />
                <TextAreaFormItem
                  name={"first_paragraph"}
                  schema={blogsFields}
                />
                <TextAreaFormItem
                  name={"second_paragraph"}
                  schema={blogsFields}
                />
                <TextAreaFormItem
                  name={"third_paragraph"}
                  schema={blogsFields}
                />
                <TextAreaFormItem
                  name={"fourth_paragraph"}
                  schema={blogsFields}
                />
                <TextAreaFormItem
                  name={"fifth_paragraph"}
                  schema={blogsFields}
                />
                <InputFormItem name={"blog_image_one_annotation"} schema={blogsFields} />
                <InputFormItem name={"blog_image_two_annotation"} schema={blogsFields} />
                <InputFormItem name={"blog_image_three_annotation"} schema={blogsFields} />
                <InputFormItem name={"blog_image_four_annotation"} schema={blogsFields} />
                <InputFormItem name={"blog_image_five_annotation"} schema={blogsFields} />

                <InputFormItem name={"point_one_title"} schema={blogsFields} />
                <TextAreaFormItem
                  name={"point_one_description"}
                  schema={blogsFields}
                />
                <InputFormItem name={"point_two_title"} schema={blogsFields} />
                <TextAreaFormItem
                  name={"point_two_description"}
                  schema={blogsFields}
                />
                <InputFormItem name={"point_three_title"} schema={blogsFields} />
                <TextAreaFormItem
                  name={"point_three_description"}
                  schema={blogsFields}
                />
                <InputFormItem name={"point_four_title"} schema={blogsFields} />
                <TextAreaFormItem
                  name={"point_four_description"}
                  schema={blogsFields}
                />
                <InputFormItem name={"point_five_title"} schema={blogsFields} />
                <TextAreaFormItem
                  name={"point_five_description"}
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

                <InputFormItem name={"meta_description"} schema={blogsFields} />

                <InputFormItem name={"keywords"} schema={blogsFields} />

                <InputFormItem name={"meta_author"} schema={blogsFields} />

                <InputFormItem name={"meta_og_title"} schema={blogsFields} />

                <InputFormItem name={"meta_og_url"} schema={blogsFields} />

                <InputFormItem name={"meta_og_image"} schema={blogsFields} />

                <InputFormItem name={"meta_fb_id"} schema={blogsFields} />

                <InputFormItem name={"meta_og_sitename"} schema={blogsFields} />

                <InputFormItem name={"post_twitter"} schema={blogsFields} />

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

export async function getServerSideProps(context) {
    // const res = await axios.get("/blogs");
    // const blogs = res.data.rows;

    return {
        props: {  }, // will be passed to the page component as props
    };
}

export default BlogsForm;
