import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import SignIn from "./pages/Authentication/SignIn";
import SignUp from "./pages/Authentication/SignUp";
import DefaultLayout from "./layout/DefaultLayout";
import Loader from "./components/Loader";
import AddContact from "./pages/Audience/AddContact";
import ViewContacts from "./pages/Audience/ViewContacts";
import Templates from "./pages/Campaigns/Templates";
// import PageTitle from './components/PageTitle';

// import Calendar from './pages/Calendar';
// import Chart from './pages/Chart';
// import ECommerce from './pages/Dashboard/ECommerce';
// import FormElements from './pages/Form/FormElements';
// import FormLayout from './pages/Form/FormLayout';
// import Profile from './pages/Profile';
// import Settings from './pages/Settings';
// import Tables from './pages/Tables';
// import Alerts from './pages/UiElements/Alerts';
// import Buttons from './pages/UiElements/Buttons';

function App() {
  const [loading, setLoading] = useState(true);
  const { pathname } = useLocation();

  const noLayoutRoutes = ["/auth/signin", "/auth/signup"];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);
  console.log(pathname);
  return loading ? (
    <Loader />
  ) : (
    <>
      {noLayoutRoutes.includes(pathname) ? (
        <Routes>
          <Route path="/auth/signin" element={<SignIn />} />
          <Route path="/auth/signup" element={<SignUp />} />
        </Routes>
      ) : (
        <DefaultLayout>
          <Routes>
            <Route path="/audience/addContact" element={<AddContact />} />
            <Route path="/audience/viewContacts" element={<ViewContacts />} />
            <Route path="/campaigns/templates" element={<Templates />} />
            {/* Other routes go here */}
          </Routes>
        </DefaultLayout>
      )}
    </>
  );
}

export default App;
