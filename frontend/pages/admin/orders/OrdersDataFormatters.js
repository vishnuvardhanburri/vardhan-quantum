import moment from "moment";
import React from "react";
import { truncate } from "lodash";

function imageFormatter(cell) {
  const imageUrl = cell && cell.length ? cell[0].publicUrl : undefined;
  return (
    <span>
      {imageUrl ? (
        <img
          width="60"
          height="60"
          className="rounded-circle"
          src={imageUrl}
          alt="avatar"
        />
      ) : null}
    </span>
  );
}

function booleanFormatter(cell) {
  return cell ? "Yes" : "No";
}

function dateTimeFormatter(cell) {
  return cell ? moment(cell).format("YYYY-MM-DD HH:mm") : null;
}

function filesFormatter(cell) {
  return (
    <div>
      {cell &&
        cell.map((value) => {
          return (
            <div key={value.id}>
              <i className="la la-link text-muted mr-2"></i>
              <a
                href={value.publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                {truncate(value.name)}
              </a>
            </div>
          );
        })}
    </div>
  );
}

function listFormatter(cell) {
  if (!cell) return null;

  if (Array.isArray(cell)) {
    return (
      <div>
        {cell.map((value, idx) => (
          <div key={value.id || idx}>
            <span style={{ color: "#2563EB", fontFamily: "monospace" }}>{value.title || value.product || value.name || String(value)}</span>
          </div>
        ))}
      </div>
    );
  }

  return <span style={{ color: "#0A0A0A", fontWeight: 600 }}>{cell.product || cell.title || cell.name || String(cell)}</span>;
}

export {
  booleanFormatter,
  imageFormatter,
  dateTimeFormatter,
  listFormatter,
  filesFormatter,
};

const Component = () => {
  return null
}

export async function getServerSideProps(context) {
  // const res = await axios.get("/products");
  // const products = res.data.rows;

  return {
    props: {  }, // will be passed to the page component as props
  };
}

export default Component
