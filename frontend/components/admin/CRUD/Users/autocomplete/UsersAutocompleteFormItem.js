import axios from "axios";
import React, { Component } from "react";
import AutocompleteFormItem from "components/admin/FormItems/items/AutocompleteFormItem";
import { connect } from "react-redux";

async function listAutocomplete(query, limit) {
  const params = { query, limit };
  const response = await axios.get(`/users/autocomplete`, { params });
  return response.data;
}

class UsersAutocompleteFormItem extends Component {
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
        : originalValue.email;

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
  hasPermissionToCreate: state.users.hasPermissionToCreate,
});

export default connect(select)(UsersAutocompleteFormItem);
