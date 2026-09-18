import axios from "axios";
import React, { Component } from "react";
import AutocompleteFormItem from "components/admin/FormItems/items/AutocompleteFormItem";
import { connect } from "react-redux";

async function listAutocomplete(query, limit) {
  const params = { query, limit };
  const response = await axios.get(`/feedback/autocomplete`, { params });
  return response.data;
}

class FeedbackAutocompleteFormItem extends Component {
  fetchFn = (value, limit) => {
    return listAutocomplete(value, limit);
  };

  mapper = {
    toAutocomplete(originalValue) {
      if (!originalValue) {
        return undefined;
      }

      const value = originalValue.id;
      let label = originalValue.label
        ? originalValue.label
        : originalValue.product;

      return {
        key: value,
        value,
        label,
      };
    },

    toValue(originalValue) {
      if (!originalValue) {
        return undefined;
      }

      return {
        id: originalValue.value,
        label: originalValue.label,
      };
    },
  };

  render() {
    const { form, ...rest } = this.props;

    return (
      <React.Fragment>
        <AutocompleteFormItem
          {...rest}
          fetchFn={this.fetchFn}
          mapper={this.mapper}
        />
      </React.Fragment>
    );
  }
}

const select = (state) => ({
  hasPermissionToCreate: state.feedback.hasPermissionToCreate,
});

export async function getServerSideProps(context) {
  // const res = await axios.get("/products");
  // const products = res.data.rows;

  return {
    props: {  }, // will be passed to the page component as props
  };
}

export default connect(select)(FeedbackAutocompleteFormItem);
