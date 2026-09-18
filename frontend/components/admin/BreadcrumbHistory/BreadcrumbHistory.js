import React, { Component } from "react";
import { Breadcrumb, BreadcrumbItem } from "reactstrap";
import { v4 as uuid } from 'uuid';
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios";

const BreadcrumbHistory = ({ url, key }) => {
  const router = useRouter();
  const [route, setRoute] = React.useState([]);

  const capitalizeFirstLetter = string => string?.charAt(0).toUpperCase() + string?.slice(1);
  

  const renderBreadCrumbs = () => {
    React.useEffect(() => {
      if (router.pathname.includes("products")) {
        const { id } = router.query;
        if (id) {
          axios.get(`/products/${id}`).then((res) => {
            setRoute([
              "Products",
              res.data.categories[0].id + '__' +
                res.data.categories[0].title,
              res.data.title,
            ]);
          }).catch(e => console.log(e));
        }
      } else {
        if (router.pathname.includes("category")) {
          var { categoryName } = router.query;
        }
        const newUrl = url
          .split("/")
          .slice(1)
          .map((route, index) => {
            if (router.pathname.includes("category") && index === 1) {
              return categoryName ? (categoryName[0].toUpperCase() + categoryName.slice(1)) : 'furniture';
            } else {
              return route[0].toUpperCase() + route.slice(1);
            }
          });
        setRoute(newUrl);
      }
    }, [router]);
    const length = route.length;
    return route.map((item, index) => {
      let middlewareUrl =
        "/" +
        url
          .split("/")
          .slice(1, index + 2)
          .join("/");
      if (router.pathname.includes("products") && index === 0) {
        middlewareUrl = "/shop";
      } else if (router.pathname.includes("products") && index === 1) {
        console.log(route[1])
        middlewareUrl = `/category/${
          route[1].split('__')[0]
        }`;
        item = capitalizeFirstLetter(route[1].split('__')[1]);
      }
      return (
          <>
            { length > 1 &&
              <BreadcrumbItem key={uuid()}>
                {length === index + 1 ? (
                    item
                ) : (
                    <Link href={middlewareUrl}>{item}</Link>
                )}
              </BreadcrumbItem>
            }
            </>
      );
    });
  };
  return (
    <div>
      <Breadcrumb
          tag="nav"
          listTag="div"
          style={{
            marginTop: router.pathname.includes("admin") ? 0 : (route.length > 1 ? 85 : 60),
            borderBottom: route.length > 1 && "1px solid #d9d9d9",
            marginBottom: router.pathname.includes("admin") ? 32 : 0,
          }}
      >
        {renderBreadCrumbs()}
      </Breadcrumb>
    </div>
  );
};

export default BreadcrumbHistory;
