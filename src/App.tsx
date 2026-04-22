import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/Settings/Profile";
import TemplateSettings from "./pages/Settings/TemplateSettings";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import MeetingLayout from "./pages/Meetings/MeetingLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import MeetingStart from "./pages/Meetings/MeetingStart";
import MeetingRegister from "./pages/Meetings/MeetingRegister";
import LiveMeeting from "./pages/Meetings/LiveMeeting";
import QuickMeeting from "./pages/Meetings/QuickMeeting"; 
import MeetingResult from "./pages/Meetings/MeetingResult";
import Status from "./pages/Manage/Status";
import ProjectManement from "./pages/Manage/ProjectManagement";
import MeetingHistory from "./pages/Meetings/history";
import MyWorkspace from "./pages/Workspace/MyWorkSpace";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />
            <Route path="/meeting-start" element={<MeetingStart />} />
            <Route path="/meeting-register" element={<MeetingRegister />} />
            {/* Meeting Management */}
            <Route path="/status" element={<Status />} />
            <Route path="/project-management" element={<ProjectManement />} />
            <Route path="/history" element={<MeetingHistory />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />
            <Route path="/workspace" element={<MyWorkspace />} />

            {/* Settings */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/template-settings" element={<TemplateSettings />} />
            <Route path="/workspace" element={<Blank />} />
            <Route path="/action-plan" element={<Blank />} /> 

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route element={<MeetingLayout />}>
            <Route path="/meeting/:id/live" element={<LiveMeeting />} />
            <Route path="/meeting/quick/live" element={<QuickMeeting />} />
            <Route path="/meeting/:id/result" element={<MeetingResult />} />
          </Route>
          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
