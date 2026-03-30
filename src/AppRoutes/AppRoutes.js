import React, { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../Components/ProtectedRoute/ProtectedRoute";
import AdminLogin from "../Pages/AdminLoginPage/AdminLoginPage";
import PageSkeleton from "../Components/Layout/PageSkeleton";
import StudentDashboard from "../Pages/StuRegManagement/StudentDashboard";
import StaffAttendance from "../Pages/staffAttendance/StaffAttendance";
import StaffAttendanceReport from "../Pages/staffAttendance/StaffAttendanceReport";
import PublicRoutesProtect from "../Components/PublicRoutesProtect";
import MyEarnings from "../Pages/MyEarnings";

/* ===== Lazy Loaded Pages ===== */

const AdminDashboard = lazy(() => import("../Pages/AdminDashboard"));

const StaffManagement = lazy(() =>
  import("../Pages/StaffManagement/StaffManagement")
);
const StaffDetails = lazy(() =>
  import("../Pages/StaffDetails/StaffDetails")
);

const StudentManagement = lazy(() =>
  import("../Pages/StudentManagement/StudentManagement")
);
const StudentDetails = lazy(() =>
  import("../Pages/StudentDetails/StudentDetails")
);

const PlacementManagement = lazy(() =>
  import("../Pages/PlacementManagement/PlacementManagement")
);
const PlacementView = lazy(() =>
  import("../Pages/PlacementManagement/PlacementView")
);

const CompanyManagement = lazy(() =>
  import("../Pages/CompanyManagement/CompanyManagement")
);

const StuRegManagement = lazy(() =>
  import("../Pages/StuRegManagement/StuRegManagement")
);
const StuRegDetails = lazy(() =>
  import("../Pages/StuRegDetails/StuRegDetails")
);

const InstallmentPage = lazy(() =>
  import("../Pages/InstallmentPage/InstallmentPage")
);
const StuInsDetails = lazy(() =>
  import("../Pages/StuInsDetailsPage/StuInsDetailsPage")
);

const EnquiryManagement = lazy(() =>
  import("../Pages/EnquiryManagement.js/EnquiryManagement")
);

const FollowUpPage = lazy(() =>
  import("../Pages/FollowPage/FollowPage")
);

const CourseManagement = lazy(() =>
  import("../Pages/CourseManagementPage/CourseManagementPage")
);
const CourseUpdatedProject = lazy(() =>
  import("../Pages/CourseUpdatedPage/CourseUpdatedProject")
);
const StaffCourseUpdatedProject = lazy(() =>
  import("../Pages/CourseUpdatedPage/StaffCourseUpdatedProject")
);

const StaffCoursePage = lazy(() =>
  import("../Pages/CourseManagementPage/StaffCoursePage")
);

const Attendance = lazy(() => import("../Pages/Attendance"));
const AdminAttendance = lazy(() => import("../Pages/Adminattendance"));

const AdminEvents = lazy(() => import("../Pages/AdminEvents"));
const AdminMark = lazy(() => import("../Pages/AdminMark"));
const StudentMark = lazy(() => import("../Pages/StudentMark"));
const StudentMarksReport = lazy(() => import("../Pages/StudentMarksReport"));
const AdminHrEarnings = lazy(() => import("../Pages/AdminHrEarnings"));

const JobManagement = lazy(() =>
  import("../Pages/JobPosting")
);

const AdminAddProject = lazy(() =>
  import("../Pages/AdminProject/AdminAddProject")
);
const AssignmentDashboard = lazy(() =>
  import("../Pages/AssignmentDashboard/AssignmentDashboard")
);

const StudentStaffLogin = lazy(() =>
  import("../Pages/studentStaffLogin")
);

const StudentProfile = lazy(() =>
  import("../Pages/StudentProfile")
);
const StaffProfile = lazy(() =>
  import("../Pages/StaffProfile")
);

const Student = lazy(() => import("../Pages/student"));
const Staff = lazy(() => import("../Pages/staff"));

const Logout = lazy(() => import("../Pages/Logout/Logout"));
const NotFound = lazy(() => import("../Pages/NotFound/NotFound"));

/* ===== App Routes ===== */

function AppRoutes() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>

          {/* ===== Public Routes ===== */}
         <Route path="/login" element={<PublicRoutesProtect><StudentStaffLogin /></PublicRoutesProtect>} />
          <Route path="/admin-login" element={<PublicRoutesProtect><AdminLogin /></PublicRoutesProtect>} />

          {/* ===== Dashboard ===== */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* ===== Staff ===== */}
          <Route
            path="/staff-management"
            element={
              <ProtectedRoute>
                <StaffManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff-management/:id"
            element={
              <ProtectedRoute>
                <StaffDetails />
              </ProtectedRoute>
            }
          />

          {/* ===== Student ===== */}
          <Route
            path="/student-management"
            element={
              <ProtectedRoute>
                <StudentManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-management/:id"
            element={
              <ProtectedRoute>
                <StudentDetails />
              </ProtectedRoute>
            }
          />

          {/* ===== Placement ===== */}
          <Route
            path="/placement-management"
            element={
              <ProtectedRoute>
                <PlacementManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/placement-management/:id"
            element={
              <ProtectedRoute>
                <PlacementView />
              </ProtectedRoute>
            }
          />

          {/* ===== Jobs & Company ===== */}
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <JobManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company"
            element={
              <ProtectedRoute>
                <CompanyManagement />
              </ProtectedRoute>
            }
          />

          {/* ===== Student Registration ===== */}
          <Route
            path="/stureg"
            element={
              <ProtectedRoute>
                <StuRegManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stureg/:id/:index"
            element={
              <ProtectedRoute>
                <StuRegDetails />
              </ProtectedRoute>
            }
          />

          {/* ===== Installments ===== */}
          <Route
            path="/install"
            element={
              <ProtectedRoute>
                <InstallmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/install/:id"
            element={
              <ProtectedRoute>
                <StuInsDetails />
              </ProtectedRoute>
            }
          />

          {/* ===== Enquiry & Follow Up ===== */}
          <Route
            path="/enquiry"
            element={
              <ProtectedRoute allowedRoles={["admin", "hr", "staff"]}>
                <EnquiryManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-earnings"
            element={
              <ProtectedRoute allowedRoles={["hr", "staff"]}>
                <MyEarnings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/followup"
            element={
              <ProtectedRoute>
                <FollowUpPage />
              </ProtectedRoute>
            }
          />

          {/* ===== Courses ===== */}
          <Route
            path="/course-management"
            element={
              <ProtectedRoute>
                <CourseManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/course-update"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <CourseUpdatedProject /> 
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff-course-update"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <StaffCourseUpdatedProject />
              </ProtectedRoute>
            }
          />
          <Route
            path="/course-staff"
            element={
              <ProtectedRoute allowedRoles={["staff", "student"]}>
                <StaffCoursePage />
              </ProtectedRoute>
            }
          />

          {/* ===== Attendance & Marks ===== */}
          <Route
            path="/student-attendance"
            element={
              <ProtectedRoute allowedRoles={["student", "staff"]}>
                <Attendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-attendance"
            element={
              <ProtectedRoute>
                <AdminAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff-marks"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <StudentMark />
              </ProtectedRoute>
            }
          />

             <Route
            path="/staff-attendance"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <StaffAttendance />
              </ProtectedRoute>
            }
          />
            <Route
            path="/staff-attendance-report"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <StaffAttendanceReport/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-mark"
            element={
              <ProtectedRoute>
                <AdminMark />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-hr-earnings"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminHrEarnings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-marks"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentMarksReport />
              </ProtectedRoute>
            }
          />

          {/* ===== Events & Projects ===== */}
          <Route
            path="/admin-events"
            element={
              <ProtectedRoute>
                <AdminEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignments"
            element={
              <ProtectedRoute>
                <AssignmentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-add-project"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <AdminAddProject />
              </ProtectedRoute>
            }
          />

          {/* ===== Profiles ===== */}
          <Route
            path="/student-profile"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentProfile />
              </ProtectedRoute>
            }
          />
           <Route
            path="/bill"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff-profile"
            element={
              <ProtectedRoute allowedRoles={["staff", "hr"]}>
                <StaffProfile />
              </ProtectedRoute>
            }
          />

          {/* ===== Basic ===== */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Student />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <Staff />
              </ProtectedRoute>
            }
          />
          <Route path="/logout" element={<Logout />} />

          {/* ===== 404 ===== */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRoutes;
