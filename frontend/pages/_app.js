import React from "react";
import { createStore, applyMiddleware, compose } from "redux";
import { Provider } from "react-redux";
import ReduxThunk from "redux-thunk";
import axios from "axios";
import createRootReducer from "redux/reducers";
import config from "constants/config";
import { doInit } from "redux/actions/auth";
import Header from "components/e-commerce/Header";
import Sidebar from "components/e-commerce/Sidebar";
import Footer from "components/e-commerce/Footer";
import AdminLayout from 'components/admin/Layout'
import "styles/theme.scss";
import { useRouter } from "next/router";
import { Container } from "reactstrap";
import BreadcrumbHistory from "components/admin/BreadcrumbHistory";

axios.defaults.baseURL = config.baseURLApi;
axios.defaults.headers.common["Content-Type"] = "application/json";
const token = typeof window !== "undefined" && localStorage.getItem("token");

if (token) {
  axios.defaults.headers.common["Authorization"] = "Bearer " + token;
}

export const store = createStore(
  createRootReducer,
  compose(applyMiddleware(ReduxThunk))
);

store.dispatch(doInit());

function MyApp({ Component, pageProps, sidebarStatic }) {
  const router = useRouter();
  React.useEffect(() => {
    document.querySelector("body").scrollTo(0, 0);
  });
  return (
    <Provider store={store}>
      {router.pathname.includes("admin") ? (
          <AdminLayout>
              <Component {...pageProps} />
          </AdminLayout>
      ) : router.pathname.includes("login") || router.pathname.includes("register")? (
        <Component {...pageProps} />
      ) : router.pathname.includes("search") ? (
          <>
            <Header/>
            <Component {...pageProps} />
          </>
      ) : router.pathname === "/" ? (
        <Component {...pageProps} />
      ) : (
        <>
          <Header />
          <Container style={{ paddingTop: "80px" }}>
            <BreadcrumbHistory url={router.pathname}/>
          </Container>
          <Component {...pageProps} />
        </>
      )}
    </Provider>
  );
}

export default MyApp;
