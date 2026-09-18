import { Formik } from "formik";
import React, { Component } from "react";
import Loader from "components/admin/Loader";
import InputFormItem from "components/admin/FormItems/items/InputFormItem";
import Widget from "components/admin/Widget";

class UsersForm extends Component {
  handleSubmit = (values) => {
    const { ...data } = values || {};
    this.props.onSubmit(data);
  };

  title = () => {
    return "Rotate Master Key & Sovereign Passphrase";
  };

  passwordSchema = {
    currentPassword: { type: "string", label: "Current Master Passphrase" },
    newPassword: { type: "string", label: "New Sovereign Passphrase (Min 14 Chars)" },
    confirmNewPassword: { type: "string", label: "Confirm Sovereign Passphrase" },
  };

  renderForm() {
    const { saveLoading } = this.props;

    return (
      <Widget
        title={
          <div className="d-flex align-items-center justify-content-between w-100">
            <div className="d-flex align-items-center">
              <span className="vq-pulse-beacon mr-2" />
              <h4 className="mb-0 font-weight-bold">{this.title()}</h4>
            </div>
            <span className="badge" style={{ background: "rgba(37, 99, 235, 0.12)", color: "#2563EB", border: "1px solid #2563EB", fontFamily: "monospace", fontSize: "11px" }}>
              ARGON2ID (m=64MB, t=3, p=4)
            </span>
          </div>
        }
        collapse
        close
      >
        <div className="p-3 mb-4 rounded" style={{ background: "#050505", border: "1px solid #E0E0E0" }}>
          <div className="d-flex align-items-center mb-1">
            <span style={{ color: "#2563EB", fontWeight: "700", fontSize: "12px", fontFamily: "monospace" }}>
              CRYPTOGRAPHIC KEY ROTATION NOTICE
            </span>
          </div>
          <p className="mb-0" style={{ color: "#666666", fontSize: "13px", lineHeight: "1.5" }}>
            Updating the sovereign master passphrase re-keys the local encrypted keystore using Argon2id and generates a signed audit record with FIPS 204 ML-DSA-87 in the append-only ledger. Active ingress sessions will remain valid until idle expiry.
          </p>
        </div>

        <Formik
          onSubmit={this.handleSubmit}
          render={(form) => {
            return (
              <form onSubmit={form.handleSubmit}>
                <InputFormItem
                  name={"currentPassword"}
                  password
                  schema={this.passwordSchema}
                />

                <InputFormItem
                  name={"newPassword"}
                  schema={this.passwordSchema}
                  password
                />

                <InputFormItem
                  name={"confirmNewPassword"}
                  schema={this.passwordSchema}
                  password
                />

                <div className="form-buttons mt-4 pt-2 d-flex gap-2">
                  <button
                    className="btn btn-primary px-4 py-2 font-weight-bold"
                    disabled={saveLoading}
                    type="button"
                    onClick={form.handleSubmit}
                    style={{ background: "#2563EB", color: "#000000", border: "none", borderRadius: "8px" }}
                  >
                    {saveLoading ? "Re-keying Keystore..." : "Commit Key Rotation"}
                  </button>
                  <button
                    className="btn btn-outline-light px-4 py-2 font-weight-bold ml-2"
                    type="button"
                    disabled={saveLoading}
                    onClick={() => this.props.onCancel()}
                    style={{ borderRadius: "8px" }}
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
    // const res = await axios.get("/products");
    // const products = res.data.rows;

    return {
        props: {  }, // will be passed to the page component as props
    };
}

export default UsersForm;
