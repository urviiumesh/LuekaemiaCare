import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("doctor", "routes/doctor.tsx",),
  route("patients", "routes/patients_new.tsx"),
  route("family", "routes/family.tsx"),
  route("appointment", "routes/appointments.tsx"),
  route("login", "routes/login.tsx"),
] satisfies RouteConfig;
